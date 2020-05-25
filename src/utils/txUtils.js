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
    btc: 0.00035001,
    zec: 0.00035001,
    bch: 0.00035001,
    renbtc: 0.00035001,
    renzec: 0.00035001,
    renbch: 0.00035001
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

export const addTx = async (tx) => {
    const store = getStore()
    const storeString = 'convert.transactions'
    const space = store.get('space')

    const txs = JSON.parse(await space.private.get(storeString)) || []
    const newTxs = txs.concat([tx])

    // update state
    store.set(storeString, newTxs)

    // update 3box

    if (space) {
        space.private.set(storeString, JSON.stringify(newTxs))
    }

    // update localStorage just in case
    localStorage.setItem(storeString, JSON.stringify(newTxs))

    // for debugging
    window.txs = newTxs
}

export const updateTx = async (newTx) => {
    const store = getStore()
    const storeString = 'convert.transactions'
    const space = store.get('space')

    const txs = JSON.parse(await space.private.get(storeString)) || []

    const newTxs = txs.map(t => {
        if (t.id === newTx.id) {
            return newTx
        }
        return t
    })

    // update state
    store.set(storeString, newTxs)

    // update 3box
    if (space) {
        space.private.set(storeString, JSON.stringify(newTxs))
    }

    // use localStorage
    localStorage.setItem(storeString, JSON.stringify(newTxs))

    // for debugging
    window.txs = txs
}

export const removeTx = async (tx) => {
    const store = getStore()
    const storeString = 'convert.transactions'
    const space = store.get('space')

    const txs = JSON.parse(await space.private.get(storeString)) || []
    const newTxs = txs.filter(t => (t.id !== tx.id))

    // update local state
    store.set(storeString, newTxs)

    // update 3box
    if (space) {
        space.private.set(storeString, JSON.stringify(newTxs))
    }

    // update localStorage just in case
    localStorage.setItem(storeString, JSON.stringify(newTxs))

    // for debugging
    window.txs = txs
}

export const txExists = function(tx) {
    return getStore().get('convert.transactions').filter(t => t.id === tx.id).length > 0
}

export const gatherFeeData = async function(type) {
    const store = getStore()
    const amount = store.get('convert.amount')
    const fees = store.get('fees')
    const selectedAsset = store.get('selectedAsset')
    const selectedDirection = store.get('convert.selectedDirection')
    const fixedFeeKey = selectedDirection ? 'release' : 'lock'
    const dynamicFeeKey = selectedDirection ? 'burn' : 'mint'

    if (!amount) return

    const amountInSats = GatewayJS.utils.value(amount, "btc").sats().toNumber()

    const renVMFee = Number((Number(amount) * Number(fees[selectedAsset].ethereum[dynamicFeeKey] / 10000))).toFixed(6)
    // const fixedFee = 0.00035
    const fixedFee = Number(fees[selectedAsset][fixedFeeKey] / (10 ** 8))
    // console.log(amount, fee, Number(amount-fee))
    const total = Number(amount-renVMFee-fixedFee) > 0 ? Number(amount-renVMFee-fixedFee).toFixed(6) : '0.000000'

    store.set('convert.renVMFee', renVMFee)
    store.set('convert.networkFee', fixedFee)
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

    const preOpenTrades = Array.from((await gjs.getGateways()).values())
    // console.log('before open', preOpenTrades)
    let trade = null
    const open = gjs.open(data);
    open.result()
        .on("status", async (status) => {
            console.log(`[GOT STATUS] ${status}`)
            if (status === GatewayJS.LockAndMintStatus.Committed) {
                const postOpenTrades = Array.from((await gjs.getGateways()).values())
                // console.log('after open', postOpenTrades)
                if (preOpenTrades.length !== postOpenTrades.length) {
                    const preOpenIds = preOpenTrades.map(t => t.id)
                    postOpenTrades.map(pot => {
                        // if unique, add to 3box
                        if (preOpenIds.indexOf(pot.id)) {
                            addTx(pot)
                            trade = pot
                        }
                    })
                }
            }
        })
        .catch(error => {
            if (error.message === "Transfer cancelled by user") {
                // remove from 3box
                removeTx(trade)
            }
        })

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

    const preOpenTrades = Array.from((await gjs.getGateways()).values())
    // console.log('before open', preOpenTrades)
    let trade = null
    const open = gjs.open(data);
    open.result()
        .on("status", async (status) => {
            console.log(`[GOT STATUS] ${status}`)
            if (status === GatewayJS.BurnAndReleaseStatus.Committed) {
                const postOpenTrades = Array.from((await gjs.getGateways()).values())
                // console.log('after open', postOpenTrades)
                if (preOpenTrades.length !== postOpenTrades.length) {
                    const preOpenIds = preOpenTrades.map(t => t.id)
                    postOpenTrades.map(pot => {
                        // if unique, add to 3box
                        if (preOpenIds.indexOf(pot.id)) {
                            addTx(pot)
                            trade = pot
                        }
                    })
                }
            }
        })
        .catch(error => {
            if (error.message === "Transfer cancelled by user") {
                // remove from 3box
                removeTx(trade)
            }
        })
}

export const isGatewayJSTxComplete = function(status) {
    return status === GatewayJS.LockAndMintStatus.ConfirmedOnEthereum || status === GatewayJS.BurnAndReleaseStatus.ReturnedFromRenVM
}

export const reOpenTx = async function(trade) {
    const store = getStore()
    const gjs = store.get('gjs')
    const localWeb3 = store.get('localWeb3')
    const gateway = gjs.recoverTransfer(localWeb3.currentProvider, trade)
    // console.log(gateway, GatewayJS.LockAndMintStatus)
    // gateway.close()
    // gateway.cancel();
    gateway.result()
        .on("status", (status) => {
            const completed = isGatewayJSTxComplete(status)
            if (completed) {
                // remove from 3box
                removeTx(trade)
            }
            console.log(`[GOT STATUS] ${status}`, gateway, trade)
        })
        .then(console.log)
        .catch(error => {
            if (error.message === "Transfer cancelled by user") {
                // remove from 3box
                removeTx(trade)
            }
        });
}

export const recoverTrades = async function() {
    const store = getStore()
    const gjs = store.get('gjs')
    const space = store.get('space')

    // Re-open incomplete trades
    const previousGateways = await gjs.getGateways();
    const previousTrades = Array.from(previousGateways.values())
    // console.log('previousTrades', previousTrades)
    for (const trade of previousTrades) {

        const tradeCompleted = isGatewayJSTxComplete(trade.status)
        // console.log('trade', trade, tradeCompleted)
        if (tradeCompleted) {
          continue;
        }
        reOpenTx(trade)
    }

    const boxData = await space.private.get('convert.transactions')
    const boxTrades = boxData ? JSON.parse(boxData) : []

    // console.log('boxTrades', boxData, boxTrades)

    // if 3box has transactions not found locally, reopen those
    const previousTradeIds = previousTrades.map(t => t.id)
    boxTrades.map(btx => {
        if (!isGatewayJSTxComplete(btx.status) &&  previousTradeIds.indexOf(btx.id) < 0) {
            reOpenTx(btx)
        }
    })
}

window.GatewayJS = GatewayJS
window.reOpenTx = reOpenTx

export default {
    addTx,
    updateTx,
    removeTx,
}
