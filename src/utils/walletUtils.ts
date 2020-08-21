import * as Sentry from "@sentry/react";

import Web3 from "web3";
import GatewayJS from "@renproject/gateway";
// import Box from '3box'
import Web3Modal from "web3modal";
import firebase from "firebase";
import MEWconnect from "@myetherwallet/mewconnect-web-client";

import BCH from "../assets/bch.png";
import BTC from "../assets/btc.png";
import DAI from "../assets/dai.png";
import ETH from "../assets/eth.png";
import RENBCH from "../assets/renBCH.svg";
import RENBTC from "../assets/renBTC.svg";
import RENZEC from "../assets/renZEC.svg";
import USDC from "../assets/usdc.png";
import WBTC from "../assets/wbtc.png";
import ZEC from "../assets/zec.svg";
import { getStore } from "../services/storeService";
import erc20ABI from "./erc20ABI.json";
import { recoverTrades } from "./txUtils";
import {
  RENBCH_MAIN,
  RENBCH_TEST,
  RENBTC_MAIN,
  RENBTC_TEST,
  RENZEC_MAIN,
  RENZEC_TEST,
} from "./web3Utils";

// used for montoring balances
let walletDataInterval: any = null;

export const ASSETS = ["BTC", "WBTC"];

export const NAME_MAP = {
  btc: "Bitcoin",
  eth: "Ethereum",
  zec: "Zcash",
  bch: "Bitcoin Cash",
  dai: "DAI",
  usdc: "USDC",
  wbtc: "Wrapped Bitcoin",
  renbtc: "Ren Bitcoin",
  renzec: "Ren Zcash",
  renbch: "Ren Bitcoin Cash",
};

export const SYMBOL_MAP = {
  btc: "BTC",
  eth: "ETH",
  zec: "ZEC",
  bch: "BCH",
  dai: "DAI",
  usdc: "USDC",
  wbtc: "WBTC",
  renbtc: "renBTC",
  renzec: "renZEC",
  renbch: "renBCH",
};

export const NETWORK_MAP = {
  btc: "bitcoin",
  eth: "ethereum",
  zec: "zcash",
  bch: "bitcoin-cash",
  dai: "ethereum",
  usdc: "ethereum",
  wbtc: "ethereum",
  renbtc: "ethereum",
  renzec: "ethereum",
  renbch: "ethereum",
};

export const MINI_ICON_MAP: { [key in string]: string } = {
  btc: BTC,
  eth: ETH,
  zec: ZEC,
  bch: BCH,
  dai: DAI,
  usdc: USDC,
  wbtc: WBTC,
  renbtc: RENBTC,
  renzec: RENZEC,
  renbch: RENBCH,
};

export const abbreviateAddress = function (walletAddress: string) {
  if (!walletAddress || typeof walletAddress !== "string") {
    return "";
  } else {
    return (
      walletAddress.slice(0, 5) +
      "..." +
      walletAddress.slice(walletAddress.length - 5)
    );
  }
};

/**
 * Get External Data for Fees, Balances, etc.
 */
export const updateFees = async function () {
  const store = getStore();
  try {
    const fees = await fetch("https://lightnode-mainnet.herokuapp.com", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 67,
        jsonrpc: "2.0",
        method: "ren_queryFees",
        params: {},
      }),
    });
    const data = (await fees.json()).result;
    store.set("fees", data);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
  }
};

export const updateMarketData = async function () {
  const store = getStore();

  try {
    const btc = await fetch(`https://api.coincap.io/v2/assets/bitcoin`, {
      method: "GET",
    });

    store.set("btcusd", (await btc.json()).data.priceUsd);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
  }

  try {
    const zec = await fetch(`https://api.coincap.io/v2/assets/zcash`, {
      method: "GET",
    });

    store.set("zecusd", (await zec.json()).data.priceUsd);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
  }

  try {
    const bch = await fetch(`https://api.coincap.io/v2/assets/bitcoin-cash`, {
      method: "GET",
    });

    store.set("bchusd", (await bch.json()).data.priceUsd);
  } catch (e) {
    console.error(e);

    Sentry.captureException(e);
  }
};

export const updateBalance = async function () {
  const store = getStore();

  const web3 = store.get("localWeb3");
  const walletAddress = store.get("localWeb3Address");
  const renBTCAddress = store.get("renBTCAddress");
  const renZECAddress = store.get("renZECAddress");
  const renBCHAddress = store.get("renBCHAddress");

  if (!web3 || !walletAddress) {
    return;
  }

  const renBTC = new web3.eth.Contract(erc20ABI, renBTCAddress);
  const renZEC = new web3.eth.Contract(erc20ABI, renZECAddress);
  const renBCH = new web3.eth.Contract(erc20ABI, renBCHAddress);
  const renBTCBalance = await renBTC.methods.balanceOf(walletAddress).call();
  const renZECBalance = await renZEC.methods.balanceOf(walletAddress).call();
  const renBCHBalance = await renBCH.methods.balanceOf(walletAddress).call();
  const ethBal = await web3.eth.getBalance(walletAddress);

  store.set("ethBalance", Number(web3.utils.fromWei(ethBal)).toFixed(8));
  store.set(
    "renBTCBalance",
    Number(parseInt(renBTCBalance.toString()) / 10 ** 8).toFixed(8)
  );
  store.set(
    "renZECBalance",
    Number(parseInt(renZECBalance.toString()) / 10 ** 8).toFixed(8)
  );
  store.set(
    "renBCHBalance",
    Number(parseInt(renBCHBalance.toString()) / 10 ** 8).toFixed(8)
  );
  store.set("loadingBalances", false);

  updateMarketData();
};

export const watchWalletData = async function () {
  const store = getStore();
  if (walletDataInterval) {
    clearInterval(walletDataInterval);
  }
  // await updateAllowance()
  await updateBalance();
  walletDataInterval = setInterval(async () => {
    // await updateAllowance()
    await updateBalance();
  }, 10 * 1000);
};

export const initDataWeb3 = async function () {
  const store = getStore();
  const network = store.get("selectedNetwork");
  store.set(
    "dataWeb3",
    new Web3(
      `https://${
        network === "testnet" ? "kovan" : "mainnet"
      }.infura.io/v3/7117ca7a3c7b4b94b24944c1ef0ecec9`
    )
  );
};

/**
 * Connecting to Local Web3 Wallet
 */
export const initLocalWeb3 = async function (type: any) {
  const store = getStore();
  store.set("walletConnecting", true);

  // already connected
  if (store.get("localWeb3Address")) {
    return;
  }

  store.set("spaceError", false);
  const selectedNetwork = store.get("selectedNetwork");

  let web3;
  let currentProvider;
  let accounts = [];
  let network = "";

  try {
    if (type === "injected" || !type) {
      const providerOptions = {};
      const web3Modal = new Web3Modal({
        network: selectedNetwork === "testnet" ? "kovan" : "mainnet",
        cacheProvider: false,
        providerOptions,
      });
      const web3Provider = await web3Modal.connect();

      web3 = new Web3(web3Provider);
      currentProvider = web3.currentProvider;
      if (typeof currentProvider === "string") return;
      if (!currentProvider) return;
      accounts = await web3.eth.getAccounts();
      const netId = await web3.eth.net.getId();
      if (netId === 1) {
        network = "mainnet";
      } else if (netId === 42) {
        network = "testnet";
      }
    } else if (type === "mew-connect") {
      const chainId = selectedNetwork === "testnet" ? 42 : 1;
      const jsonRpcUrl = `wss://${
        selectedNetwork === "testnet" ? "kovan" : "mainnet"
      }.infura.io/ws/v3/7117ca7a3c7b4b94b24944c1ef0ecec9`;

      const mewConnect = new MEWconnect.Provider({
        windowClosedError: true,
      });
      const web3Provider = mewConnect.makeWeb3Provider(
        chainId,
        jsonRpcUrl,
        true
      );

      web3 = new Web3(web3Provider);
      currentProvider = web3.currentProvider;

      if (typeof currentProvider === "string") return;
      if (!currentProvider) return;

      accounts = await web3Provider.enable();
      network = selectedNetwork;
    } else {
      console.error("Invalid wallet type.");
      store.set("spaceError", true);
      store.set("spaceRequesting", false);
      store.set("walletConnecting", false);
      return;
    }
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    store.set("spaceError", true);
    store.set("spaceRequesting", false);
    store.set("walletConnecting", false);
    return;
  }

  const address = accounts[0];
  const addressLowerCase = address.toLowerCase();
  const db = store.get("db");

  if (selectedNetwork !== network) {
    store.set("showNetworkModal", true);
    store.set("spaceError", true);
    store.set("spaceRequesting", false);
    store.set("walletConnecting", false);
    return;
  }

  try {
    ///////////////////////////////////////////////////////
    // Firebase Sign In or Sign Up
    //////////////////////////////////////////////////////

    let signature = "";

    // get from local storage if user has signed in already
    const localSigMap = localStorage.getItem("sigMap");
    const localSigMapData = localSigMap ? JSON.parse(localSigMap) : {};
    if (localSigMapData[addressLowerCase]) {
      signature = localSigMapData[addressLowerCase];
    } else {
      // get unique wallet signature for firebase backup
      // @ts-ignore
      const sig = await web3.eth.personal.sign(
        web3.utils.utf8ToHex("Signing in to RenBridge"),
        addressLowerCase
      );
      signature = web3.utils.sha3(sig)!;
      localSigMapData[addressLowerCase] = signature;
      localStorage.setItem("sigMap", JSON.stringify(localSigMapData));
    }

    store.set("fsSignature", signature);

    // auth with firestore
    const bridgeId = `${addressLowerCase}@renproject.io`;
    const currentFsUser = firebase.auth().currentUser;
    let fsUser;

    if (!currentFsUser || currentFsUser.email !== bridgeId) {
      try {
        fsUser = (
          await firebase.auth().signInWithEmailAndPassword(bridgeId, signature)
        ).user;
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        fsUser = (
          await firebase
            .auth()
            .createUserWithEmailAndPassword(bridgeId, signature)
        ).user;
      }
    } else {
      fsUser = currentFsUser;
    }

    store.set("fsUser", fsUser);

    if (fsUser) {
      // update user collection
      const doc = await db.collection("users").doc(fsUser.uid);
      const docData = await doc.get();

      if (docData.exists) {
        const data = docData.data();
        if (data.signatures.indexOf(signature) < 0) {
          // add a new signature if needed
          await doc.update({
            signatures: data.signatures.concat([signature]),
            updated: firebase.firestore.Timestamp.fromDate(
              new Date(Date.now())
            ),
          });
        }
      } else {
        // create user
        await doc.set({
          uid: fsUser.uid,
          updated: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
          signatures: [signature],
        });
      }
    }

    store.set("fsEnabled", true);

    ///////////////////////////////////////////////////////
    // Recover Transactions
    //////////////////////////////////////////////////////

    store.set("localWeb3", web3);
    store.set("localWeb3Address", accounts[0]);
    store.set("localWeb3Network", network);
    store.set("spaceRequesting", false);
    store.set("walletConnecting", false);

    recoverTrades();
    updateBalance();

    if ((!currentProvider as any).on) return;
    // FIXME: provide propper provider type
    const listeningProvider: any = currentProvider;
    if (listeningProvider.on) {
      // listen for changes
      listeningProvider.on("accountsChanged", async () => {
        window.location.reload();
      });

      listeningProvider.on("chainChanged", async () => {
        window.location.reload();
      });

      listeningProvider.on("networkChanged", async () => {
        window.location.reload();
      });

      listeningProvider.on("disconnected", async () => {
        window.location.reload();
      });
    }
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    store.set("spaceError", true);
    store.set("spaceRequesting", false);
    store.set("walletConnecting", false);
  }

  return;
};

export const setAddresses = async function () {
  const store = getStore();
  const network = store.get("selectedNetwork");
  if (network === "testnet") {
    store.set("renBTCAddress", RENBTC_TEST);
    store.set("renZECAddress", RENZEC_TEST);
    store.set("renBCHAddress", RENBCH_TEST);
  } else {
    store.set("renBTCAddress", RENBTC_MAIN);
    store.set("renZECAddress", RENZEC_MAIN);
    store.set("renBCHAddress", RENBCH_MAIN);
  }
};

export const setNetwork = async function (network: any) {
  const store = getStore();
  store.set("selectedNetwork", network);
  store.set(
    "gjs",
    new GatewayJS(network, {
      // If we want to test against gatewayjs staging, we should change the endpoint
      // manually in a PR, which does not get merged, and check the preview build
      // endpoint: "https://ren-gatewayjs-staging.netlify.app/",
    })
  );
  // @ts-ignore
  setAddresses.bind(this)();
};

export default {};
