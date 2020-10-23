import * as Sentry from "@sentry/react";

import firebase from "firebase";
import GatewayJS from "@renproject/gateway";
import { randomBytes } from "@renproject/utils";

import { getStore } from "../services/storeService";

export const MIN_TX_AMOUNTS = {
  btc: 0.00035036,
  zec: 0.00035036,
  bch: 0.00035036,
  renbtc: 0.00035036,
  renzec: 0.00035036,
  renbch: 0.00035036,
};

export const windowBlocker = function (event: any) {
  // Cancel the event as stated by the standard.
  event.preventDefault();

  const msg =
    "WARNING: closing the browser window now may result in loss of funds. Are you sure?";

  // Chrome requires returnValue to be set.
  event.returnValue = msg;
  return msg;
};

export const setWindowBlocker = function () {
  window.addEventListener("beforeunload", windowBlocker);
};

export const removeWindowBlocker = function () {
  window.removeEventListener("beforeunload", windowBlocker);
};

/**
 * Create/Update/Delete Transactions on Firebase and 3box
 */
export const addTx = async (tx: any, id?: string) => {
  const store = getStore();
  const storeString = "convert.transactions";

  // const space = store.get('space')
  const db = store.get("db");
  const fsEnabled = store.get("fsEnabled");
  const localWeb3Address = store.get("localWeb3Address");
  const fsSignature = store.get("fsSignature");

  if (!fsEnabled) {
    throw new Error(
      `Unable to create transaction - not connected to database.`
    );
  }

  // add timestamps
  const timestamp = firebase.firestore.Timestamp.fromDate(new Date(Date.now()));
  tx.created = timestamp;
  tx.updated = timestamp;

  const txs = store.get(storeString);
  const newTxs = txs.concat([tx]);

  // update state
  store.set(storeString, newTxs);

  // update localStorage just in case
  localStorage.setItem(storeString, JSON.stringify(newTxs));

  // // update 3box
  // if (space) {
  //     space.private.set(storeString, JSON.stringify(newTxs))
  // }

  id = id || tx.id;

  // update firebase
  try {
    db.collection("transactions")
      .doc(id)
      .set({
        user: localWeb3Address.toLowerCase(),
        walletSignature: fsSignature,
        id,
        created: timestamp,
        updated: timestamp,
        data: JSON.stringify(tx),
      });
  } catch (e) {
    const errorMessage = String(e && e.message);
    Sentry.withScope(function (scope) {
      scope.setTag("error-hint", "storing transaction");
      Sentry.captureException(e);
    });
    e.message = `Unable to store transaction to database${
      errorMessage ? `: ${errorMessage}` : "."
    }`;
    throw e;
  }
};

export const updateTx = async (newTx: any) => {
  const store = getStore();
  const storeString = "convert.transactions";
  // const space = store.get('space')
  const db = store.get("db");
  const fsEnabled = store.get("fsEnabled");
  const localWeb3Address = store.get("localWeb3Address");

  // update timestamp
  newTx.updated = firebase.firestore.Timestamp.fromDate(new Date(Date.now()));

  const txs = store.get(storeString);

  const filtered = txs.filter((t: any) => t.id !== newTx.id);
  const newTxs = filtered.concat([newTx]);

  // update state
  store.set(storeString, newTxs);

  // use localStorage
  localStorage.setItem(storeString, JSON.stringify(newTxs));

  // // update 3box
  // if (space) {
  //     space.private.set(storeString, JSON.stringify(newTxs))
  // }

  // update firebase
  if (fsEnabled && newTx.id) {
    let docData;

    const doc = (db as firebase.firestore.Firestore)
      .collection("transactions")
      .doc(newTx.id);
    try {
      docData = await doc.get();
    } catch (e) {
      console.error(e);
      Sentry.withScope(function (scope) {
        scope.setTag("error-hint", "missing transaction");
        Sentry.captureException(e);
      });
    }

    if (docData?.exists) {
      try {
        await doc.update({
          data: JSON.stringify(newTx),
          user: localWeb3Address.toLowerCase(),
          updated: newTx.updated,
        });
      } catch (e) {
        console.error(e);
        Sentry.withScope(function (scope) {
          scope.setTag("error-hint", "adding transaction");
          Sentry.captureException(e);
        });
      }
    } else {
      await addTx(newTx, newTx.id);
    }
  }
};

export const removeTx = async <T extends { id: string }>(tx: T) => {
  if (!tx.id) {
    Sentry.withScope(function (scope) {
      scope.setTag("error-hint", "missing transaction id");
      Sentry.captureException(new Error("failed to remove tx - missing id"));
    });
    return;
  }
  const store = getStore();
  const storeString = "convert.transactions";
  // const space = store.get('space')
  const db = store.get("db");
  const fsEnabled = store.get("fsEnabled");

  const txs = store.get(storeString);
  const newTxs = txs.filter((t: any) => t.id !== tx.id);

  // update local state
  store.set(storeString, newTxs);

  // update localStorage just in case
  localStorage.setItem(storeString, JSON.stringify(newTxs));

  // Don't manually delete gateway from gjs, as it maintains
  // the archival state
  // const localGateways = await gjs.getGateways();
  // localGateways.delete(tx.id);

  // update firebase
  if (fsEnabled) {
    try {
      await db.collection("transactions").doc(tx.id).update({
        deleted: true,
      });
    } catch (e) {
      console.error(e);
      Sentry.withScope(function (scope) {
        scope.setTag("error-hint", "removing transaction");
        Sentry.captureException(e);
      });
    }
  }
};

export const txExists = function (tx: any) {
  return (
    getStore()
      .get("convert.transactions")
      .filter((t: any) => t.id === tx.id).length > 0
  );
};

/**
 * Calculate Fees for a Transaction
 */
export const gatherFeeData = async function () {
  const store = getStore();
  const amount = store.get("convert.amount");
  const fees = store.get("fees");
  const selectedAsset = store.get("selectedAsset");
  const selectedDirection = store.get("convert.selectedDirection");
  const fixedFeeKey = selectedDirection ? "release" : "lock";
  const dynamicFeeKey = selectedDirection ? "burn" : "mint";

  if (!amount) {
    return;
  }

  const renVMFee = Number(
    Number(amount) * Number((dynamicFeeKey === "mint" ? 20 : 10) / 10000)
  ).toFixed(6);
  const fixedFee = Number(fees[selectedAsset][fixedFeeKey] / 10 ** 8);
  const total =
    Number(amount - Number(renVMFee) - fixedFee) > 0
      ? Number(amount - Number(renVMFee) - fixedFee).toFixed(6)
      : "0.000000";

  store.set("convert.renVMFee", renVMFee);
  store.set("convert.networkFee", fixedFee);
  store.set("convert.conversionTotal", total);
};

/**
 * Mint and Burn
 */
export const initGJSDeposit = async function (tx: any) {
  const { amount } = tx;
  const store = getStore() as any;
  const { localWeb3, localWeb3Address, selectedAsset } = store.getState();
  const gjs: GatewayJS = store.get("gjs");

  const storableData = {
    sendToken:
      GatewayJS.Tokens[
        selectedAsset.toUpperCase() as keyof typeof GatewayJS.Tokens
      ].Mint,
    // every source asset for now uses the same unit number as BTC
    sendAmount: GatewayJS.utils.value(amount, "btc").sats().toString(),
    sendTo: localWeb3Address,
  };

  const data = {
    ...storableData,
    web3Provider: localWeb3.currentProvider,
  };

  const preOpenTrades = Array.from((await gjs.getGateways()).values());

  const id = randomBytes(8);
  await addTx(storableData, id);

  let trade: any = null;
  // If a tx is cancelled before it is persisted, we should flag it
  let shouldRemove = false;
  const open = gjs.open(data, id);
  open
    .result()
    .on("status", async (status: any) => {
      console.info(`[GOT STATUS] ${status}`);
      if (status === GatewayJS.LockAndMintStatus.Committed) {
        const postOpenTrades = Array.from((await gjs.getGateways()).values());

        if (preOpenTrades.length !== postOpenTrades.length) {
          const preOpenIds = preOpenTrades.map((t: any) => t.id);
          for (let pot of postOpenTrades) {
            if (preOpenIds.indexOf(pot.id)) {
              await updateTx(pot);
              trade = pot;
              if (shouldRemove) {
                removeTx(trade);
              }
              // we should never process more than one version of the same trade, so return
              return;
            }
          }
        }
      }
    })
    .on("transferUpdated", (transfer: any) => {
      console.info(`[GOT TRANSFER]`, transfer);
      if (
        !transfer.archived &&
        transfer.status !== GatewayJS.LockAndMintStatus.Committed
      ) {
        updateTx(transfer);
      }
    })
    .catch((error: any) => {
      if (error.message === "Transfer cancelled by user") {
        // ensure that trade is removed after updates
        shouldRemove = true;

        if (trade) {
          removeTx(trade);
        }
      } else {
        Sentry.withScope(function (scope) {
          scope.setTag("error-hint", "gatewayjs error");
          Sentry.captureException(error);
        });
      }
    });

  store.set("confirmTx", null);
  store.set("confirmAction", "");
};

export const initGJSWithdraw = async function (tx: any) {
  const { amount, destAddress } = tx;
  const store = getStore() as any;
  const { localWeb3, selectedAsset } = store.getState();
  const gjs: GatewayJS = store.get("gjs");

  const storableData = {
    sendToken:
      GatewayJS.Tokens[
        selectedAsset.toUpperCase() as keyof typeof GatewayJS.Tokens
      ].Burn,
    // every source asset for now uses the same unit number as BTC
    sendAmount: GatewayJS.utils.value(amount, "btc").sats().toString(),
    sendTo: destAddress,
    web3Provider: localWeb3.currentProvider,
  };

  const data = {
    ...storableData,
    web3Provider: localWeb3.currentProvider,
  };

  const preOpenTrades = Array.from((await gjs.getGateways()).values());

  const id = randomBytes(8);
  await addTx(storableData, id);

  let trade: any = null;
  const open = gjs.open(data, id);
  open
    .result()
    .on("status", async (status: any) => {
      console.info(`[GOT STATUS] ${status}`);
      if (status === GatewayJS.BurnAndReleaseStatus.Committed) {
        const postOpenTrades = Array.from((await gjs.getGateways()).values());

        if (preOpenTrades.length !== postOpenTrades.length) {
          const preOpenIds = preOpenTrades.map((t: any) => t.id);
          for (let pot of postOpenTrades) {
            if (preOpenIds.indexOf(pot.id)) {
              await updateTx(pot);
              trade = pot;
            }
          }
        }
      }
    })
    .on("transferUpdated", (transfer: any) => {
      console.info(`[GOT TRANSFER]`, transfer);
      if (
        !transfer.archived &&
        transfer.status !== GatewayJS.BurnAndReleaseStatus.Committed
      ) {
        updateTx(transfer);
      }
    })
    .catch((error: any) => {
      if (error.message === "Transfer cancelled by user") {
        // remove from 3box
        removeTx(trade);
      }
    });
};

/**
 * Recover and Continue Transactions
 */
export const isGatewayJSTxComplete = function (status: any) {
  return (
    status === GatewayJS.LockAndMintStatus.ConfirmedOnEthereum ||
    status === GatewayJS.BurnAndReleaseStatus.ReturnedFromRenVM
  );
};

export const reOpenTx = function (trade: any, id?: string) {
  const store = getStore();
  const gjs: GatewayJS = store.get("gjs");
  const localWeb3 = store.get("localWeb3");
  // Does gatewayjs remove the id for a trade if it is recovered without an id?
  const gateway = gjs.recoverTransfer(localWeb3.currentProvider, trade, id);
  trade.id = id;

  gateway
    .pause()
    .result()
    .on("status", (status: any) => {
      const completed = isGatewayJSTxComplete(status);
      if (completed) {
        // remove from 3box
        removeTx(trade);
      }
      console.info(`[GOT STATUS] ${status}`, gateway, trade);
    })
    .on("transferUpdated", (transfer: any) => {
      console.info(`[GOT TRANSFER]`, transfer);
      transfer.id = transfer.id || trade.id || id;
      if (!transfer.archived) {
        updateTx(transfer);
      }
    })
    .then(console.log)
    .catch((error: any) => {
      if (error.message === "Transfer cancelled by user") {
        // remove from 3box
        removeTx(trade);
      } else {
        Sentry.withScope(function (scope) {
          scope.setTag("error-hint", "gatewayjs error re-opening");
          Sentry.captureException(error);
        });
      }
    });
};

export const recoverTrades = async function () {
  const store = getStore();
  const gjs: GatewayJS = store.get("gjs");
  const fsSignature = store.get("fsSignature");
  const localWeb3Address: string = store.get("localWeb3Address");
  const db = store.get("db");

  // Re-open incomplete trades
  const localGateways = await gjs.getGateways();
  const localTrades = Array.from(localGateways.values());
  for (const trade of localTrades) {
    const tradeCompleted = isGatewayJSTxComplete(trade.status);
    if (tradeCompleted) {
      continue;
    }
    if (!trade.id) {
      Sentry.withScope(function (scope) {
        const e = new Error("tx with no id: " + JSON.stringify(trade));
        console.error(e);
        scope.setTag("error-hint", "corrupted tx");
        Sentry.captureException(e);
      });
      // If a trade has no ID, we cannot persist it properly, and it will duplicate
      // so instead continue and hope that it has been persisted to firebase and
      // we can restore from there
      continue;
    }
    try {
      reOpenTx(trade);
    } catch (e) {
      Sentry.withScope(function (scope) {
        scope.setTag("error-hint", "reopening local transaction");
        Sentry.captureException(e);
      });
    }
  }

  // Get firebase transactions
  const fsDataSnapshotBySignature = await (db as firebase.firestore.Firestore)
    .collection("transactions")
    .where("walletSignature", "==", fsSignature)
    .get();

  const fsDataSnapshotByUser = await (db as firebase.firestore.Firestore)
    .collection("transactions")
    .where("user", "==", localWeb3Address.toLowerCase())
    .get()
    .catch((e) => {
      Sentry.withScope(function (scope) {
        scope.setTag(
          "error-hint",
          "user has transactions with mismatched signatures"
        );
        Sentry.captureException(e);
      });
    });

  let fsTrades: [any, string][] = [];

  if (!fsDataSnapshotBySignature.empty) {
    fsDataSnapshotBySignature.forEach((doc) => {
      const data = doc.data();
      if (data.deleted) return;
      const tx = JSON.parse(data.data);
      fsTrades.push([tx, data.id]);
    });
  }

  if (fsDataSnapshotByUser && !fsDataSnapshotByUser.empty) {
    fsDataSnapshotByUser.forEach((doc) => {
      const data = doc.data();
      if (data.walletSignature === fsSignature) {
        return; // We don't want to double-count transactions
      }
      const tx = JSON.parse(data.data);
      fsTrades.push([tx, data.id]);
    });
  }

  // if firebase has transactions not found locally, reopen those
  const localTradeIds = localTrades.map((t) => t.id);
  for (let [ftx, id] of fsTrades) {
    if (!isGatewayJSTxComplete(ftx.status) && localTradeIds.indexOf(id) < 0) {
      try {
        reOpenTx(ftx, id);
      } catch (e) {
        Sentry.withScope(function (scope) {
          scope.setTag("error-hint", "reopening remote transaction");
          Sentry.captureException(e);
        });
      }
    }
  }
};

export default {};
