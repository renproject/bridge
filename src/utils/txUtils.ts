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
        updated: timestamp,
        data: JSON.stringify(tx),
      });
  } catch (e) {
    const errorMessage = String(e && e.message);
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
  if (fsEnabled) {
    try {
      db.collection("transactions")
        .doc(newTx.id)
        .update({
          data: JSON.stringify(newTx),
          updated: newTx.updated,
        });
    } catch (e) {
      console.error(e);
      Sentry.captureException(e);
    }
  }
};

export const removeTx = async (tx: any) => {
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

  // // update 3box
  // if (space) {
  //     space.private.set(storeString, JSON.stringify(newTxs))
  // }

  // update firebase
  if (fsEnabled) {
    try {
      db.collection("transactions").doc(tx.id).delete();
    } catch (e) {
      console.error(e);
      Sentry.captureException(e);
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
    Number(amount) * Number(fees[selectedAsset].ethereum[dynamicFeeKey] / 10000)
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
  const { gjs, localWeb3, localWeb3Address, selectedAsset } = store.getState();

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
  const open = gjs.open(data, id);
  open
    .result()
    .on("status", async (status: any) => {
      console.info(`[GOT STATUS] ${status}`);
      if (status === GatewayJS.LockAndMintStatus.Committed) {
        const postOpenTrades = Array.from((await gjs.getGateways()).values());

        if (preOpenTrades.length !== postOpenTrades.length) {
          const preOpenIds = preOpenTrades.map((t: any) => t.id);
          postOpenTrades.map((pot: any) => {
            // if unique, add to 3box
            if (preOpenIds.indexOf(pot.id)) {
              updateTx(pot);
              trade = pot;
            }
          });
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
        // remove from 3box
        removeTx(trade);
      } else {
        Sentry.captureException(error);
      }
    });

  store.set("confirmTx", null);
  store.set("confirmAction", "");
};

export const initGJSWithdraw = async function (tx: any) {
  const { amount, destAddress } = tx;
  const store = getStore() as any;
  const { gjs, localWeb3, selectedAsset } = store.getState();

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
          postOpenTrades.map((pot: any) => {
            // if unique, add to 3box
            if (preOpenIds.indexOf(pot.id)) {
              updateTx(pot);
              trade = pot;
            }
          });
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

export const reOpenTx = async function (trade: any, id?: string) {
  const store = getStore();
  const gjs = store.get("gjs");
  const localWeb3 = store.get("localWeb3");
  const gateway = gjs.recoverTransfer(localWeb3.currentProvider, trade, id);

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
        Sentry.captureException(error);
      }
    });
};

export const recoverTrades = async function () {
  const store = getStore();
  const gjs = store.get("gjs");
  const space = store.get("space");
  const fsSignature = store.get("fsSignature");
  const db = store.get("db");

  // Re-open incomplete trades
  const localGateways = await gjs.getGateways();
  const localTrades: any[] = Array.from(localGateways.values());
  for (const trade of localTrades) {
    const tradeCompleted = isGatewayJSTxComplete(trade.status);
    if (tradeCompleted) {
      continue;
    }
    reOpenTx(trade);
  }

  // // Get 3box transactions
  // const boxData = await space.private.get('convert.transactions')
  // const boxTrades = boxData ? JSON.parse(boxData) : []

  // Get firebase transactions
  const fsDataSnapshot = await db
    .collection("transactions")
    .where("walletSignature", "==", fsSignature)
    .get();
  let fsTrades: [any, string][] = [];
  if (!fsDataSnapshot.empty) {
    fsDataSnapshot.forEach((doc: any) => {
      const data = doc.data();
      const tx = JSON.parse(data.data);
      fsTrades.push([tx, data.id]);
    });
  }
  const fsTradeIds = fsTrades.map(([f]) => f.id);

  // if firebase has transactions not found locally, reopen those
  const localTradeIds = localTrades.map((t) => t.id);
  fsTrades.map(([ftx, id]) => {
    if (
      !isGatewayJSTxComplete(ftx.status) &&
      localTradeIds.indexOf(ftx.id) < 0
    ) {
      reOpenTx(ftx, id);
    }
  });

  // // if 3box has transactions not found locally or in firebase, reopen those
  // // remove this when we fully switch away from 3box
  // boxTrades.map(btx => {
  //     if (!isGatewayJSTxComplete(btx.status)
  //         && localTradeIds.indexOf(btx.id) < 0
  //         && fsTradeIds.indexOf(btx.id) < 0) {
  //         reOpenTx(btx)
  //     }
  // })
};

export default {};
