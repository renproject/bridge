import { withStore } from '@spyna/react-store'
import GatewayJS from "@renproject/gateway";
import BigNumber from "bignumber.js";
import adapterABI from "../utils/adapterCurveABI.json";
import zbtcABI from "../utils/erc20ABI.json";
import curveABI from "../utils/curveABI.json";
import { getStore } from '../services/storeService'
import {
    BTC_GATEWAY_MAIN,
    BTC_GATEWAY_TEST,
    ZEC_GATEWAY_MAIN,
    ZEC_GATEWAY_TEST,
    BCH_GATEWAY_MAIN,
    BCH_GATEWAY_TEST,
    CURVE_TEST
} from './web3Utils'

export const MIN_TX_AMOUNTS = {
    btc: 0.00010001,
    zec: 0.00010001,
    bch: 0.00010001,
    renbtc: 0.00010001,
    renzec: 0.00010001,
    renbch: 0.00010001
}

export const windowBlocker = function(event) {
    // Cancel the event as stated by the standard.
    event.preventDefault();

    const msg = 'WARNING: closing the browser window now may result in loss of funds. Are you sure?';

    // Chrome requires returnValue to be set.
    event.returnValue = msg
    return msg
}

export const setWindowBlocker = function() {
    window.addEventListener('beforeunload', windowBlocker);
}

export const removeWindowBlocker = function() {
    window.removeEventListener('beforeunload', windowBlocker);
}

export const addTx = (tx) => {
    const store = getStore()
    const storeString = 'convert.transactions'
    let txs = store.get(storeString)
    txs.push(tx)
    store.set(storeString, txs)

    // const space = store.get('space')
    // // console.log('space', space)
    //
    // if (space) {
    //     space.public.set(storeString, JSON.stringify(txs))
    // }

    // use localStorage
    localStorage.setItem(storeString, JSON.stringify(txs))

    // for debugging
    window.txs = txs
}

export const updateTx = (newTx) => {
    const store = getStore()
    const storeString = 'convert.transactions'
    const txs = store.get(storeString).map(t => {
        if (t.id === newTx.id) {
            // const newTx = Object.assign(t, props)
            return newTx
        }
        return t
    })
    store.set(storeString, txs)

    // const space = store.get('space')
    // if (space) {
    //     space.public.set(storeString, JSON.stringify(txs))
    // }

    // use localStorage
    localStorage.setItem(storeString, JSON.stringify(txs))

    // for debugging
    window.txs = txs
}

export const removeTx = (tx) => {
    const store = getStore()
    const storeString = 'convert.transactions'
    let txs = store.get(storeString).filter(t => (t.id !== tx.id))
    // console.log(txs)
    store.set(storeString, txs)

    // const space = store.get('space')
    // if (space) {
    //     space.public.set(storeString, JSON.stringify(txs))
    // }

    // use localStorage
    localStorage.setItem(storeString, JSON.stringify(txs))

    // for debugging
    window.txs = txs
}

export const txExists = function(tx) {
    return getStore().get('convert.transactions').filter(t => t.id === tx.id).length > 0
}

export const gatherFeeData = async function() {
    const store = getStore()
    const amount = store.get('convert.amount')

    if (!amount) return

    const amountInSats = GatewayJS.utils.value(amount, "btc").sats().toNumber()

    const fee = Number((Number(amount) * 0.001) + 0.00005).toFixed(6)
    const total = Number(amount-fee).toFixed(6)
    store.set('convert.networkFee', fee)
    store.set('convert.conversionTotal', total)
}

// transfers
export const initGJSDeposit = async function(tx) {
    const {
      amount,
      params,
      destAddress,
    } = tx
    const store = getStore()
    const {
        gjs,
        localWeb3,
        localWeb3Address,
        selectedAsset
    } = store.getState()

    const data = {
        sendToken: GatewayJS.Tokens[selectedAsset.toUpperCase()].Mint,
        // every source asset for now uses the same unit number as BTC
        suggestedAmount: GatewayJS.utils.value(amount, "btc").sats().toString(),
        sendTo: localWeb3Address,
        web3Provider: localWeb3.currentProvider
    }

    console.log('initGJSDeposit', data)

    gjs.open(data);

    store.set('confirmTx', null)
    store.set('confrirmAction', '')
}

export const initGJSWithdraw = async function(tx) {
    const {
      amount,
      params,
      destAddress,
    } = tx
    const store = getStore()
    const {
        gjs,
        localWeb3,
        localWeb3Address,
        selectedAsset,
    } = store.getState()

    const adapterAddress = BTC_GATEWAY_TEST

    const data = {
        sendToken: GatewayJS.Tokens[selectedAsset.toUpperCase()].Burn,
        // every source asset for now uses the same unit number as BTC
        sendAmount: GatewayJS.utils.value(amount, "btc").sats().toString(),
        sendTo: destAddress,
        web3Provider: localWeb3.currentProvider
    }

    console.log('initGJSWithdraw', data)

    gjs.open(data);
}

export const recoverTrades = async function() {
    const store = getStore()
    const gjs = store.get('gjs')
    const localWeb3 = store.get('localWeb3')
    console.log(store.getState())

    // Re-open incomplete trades
    const previousGateways = await gjs.getGateways();
    for (const trade of Array.from(previousGateways.values())) {
        console.log('trade', trade)
        if (trade.status === GatewayJS.LockAndMintStatus.ConfirmedOnEthereum || trade.status === GatewayJS.BurnAndReleaseStatus.ReturnedFromRenVM) { continue; }
        const gateway = gjs.recoverTransfer(localWeb3.currentProvider, trade)
        console.log(gateway)
        // gateway.close()
        // gateway.cancel();
        gateway.result()
            .on("status", (status) => console.log(`[GOT STATUS] ${status}`))
            .then(console.log)
            .catch(console.error);
    }
}

window.GatewayJS = GatewayJS

export default {
    addTx,
    updateTx,
    removeTx,
}
