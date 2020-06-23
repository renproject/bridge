import firebase from 'firebase'
import GatewayJS from "@renproject/gateway";
import { getStore } from '../services/storeService'

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
    const db = store.get('db')
    const fsEnabled = store.get('fsEnabled')
    const localWeb3Address = store.get('localWeb3Address')
    const fsSignature = store.get('fsSignature')

    // add timestamps
    const timestamp = firebase.firestore.Timestamp.fromDate(new Date(Date.now()))
    tx.created = timestamp
    tx.updated = timestamp

    const txs = JSON.parse(await space.private.get(storeString)) || []
    const newTxs = txs.concat([tx])

    // update state
    store.set(storeString, newTxs)

    // update localStorage just in case
    localStorage.setItem(storeString, JSON.stringify(newTxs))

    // update 3box
    if (space) {
        space.private.set(storeString, JSON.stringify(newTxs))
    }

    // update firebase
    if (fsEnabled) {
        try {
            db.collection("transactions").doc(tx.id).set({
                user: localWeb3Address.toLowerCase(),
                walletSignature: fsSignature,
                id: tx.id,
                updated: timestamp,
                data: JSON.stringify(tx)
            })
        } catch(e) {
            console.log(e)
        }
    }

    // for debugging
    window.txs = newTxs
}

export const updateTx = async (newTx) => {
    const store = getStore()
    const storeString = 'convert.transactions'
    const space = store.get('space')
    const db = store.get('db')
    const fsEnabled = store.get('fsEnabled')

    // update timestamp
    newTx.updated = firebase.firestore.Timestamp.fromDate(new Date(Date.now()))

    const txs = JSON.parse(await space.private.get(storeString)) || []

    const newTxs = txs.map(t => {
        if (t.id === newTx.id) {
            return newTx
        }
        return t
    })

    // update state
    store.set(storeString, newTxs)

    // use localStorage
    localStorage.setItem(storeString, JSON.stringify(newTxs))

    // update 3box
    if (space) {
        space.private.set(storeString, JSON.stringify(newTxs))
    }

    // update firebase
    if (fsEnabled) {
        try {
            db.collection("transactions")
                .doc(newTx.id)
                .update({
                    data: JSON.stringify(newTx),
                    updated: newTx.updated
                })
        } catch(e) {
            console.log(e)
        }
    }

    // for debugging
    window.txs = txs
}

export const removeTx = async (tx) => {
    const store = getStore()
    const storeString = 'convert.transactions'
    const space = store.get('space')
    const db = store.get('db')
    const fsEnabled = store.get('fsEnabled')

    const txs = JSON.parse(await space.private.get(storeString)) || []
    const newTxs = txs.filter(t => (t.id !== tx.id))

    // update local state
    store.set(storeString, newTxs)

    // update localStorage just in case
    localStorage.setItem(storeString, JSON.stringify(newTxs))

    // update 3box
    if (space) {
        space.private.set(storeString, JSON.stringify(newTxs))
    }

    // update firebase
    if (fsEnabled) {
        try {
            db.collection("transactions")
                .doc(tx.id)
                .delete()
        } catch(e) {
            console.log(e)
        }
    }

    // for debugging
    window.txs = txs
}

export const txExists = function(tx) {
    return getStore().get('convert.transactions').filter(t => t.id === tx.id).length > 0
}

export const gatherFeeData = async function() {
    const store = getStore()
    const amount = store.get('convert.amount')
    const fees = store.get('fees')
    const selectedAsset = store.get('selectedAsset')
    const selectedDirection = store.get('convert.selectedDirection')
    const fixedFeeKey = selectedDirection ? 'release' : 'lock'
    const dynamicFeeKey = selectedDirection ? 'burn' : 'mint'

    if (!amount) return

    const renVMFee = Number((Number(amount) * Number(fees[selectedAsset].ethereum[dynamicFeeKey] / 10000))).toFixed(6)
    const fixedFee = Number(fees[selectedAsset][fixedFeeKey] / (10 ** 8))
    const total = Number(amount-renVMFee-fixedFee) > 0 ? Number(amount-renVMFee-fixedFee).toFixed(6) : '0.000000'

    store.set('convert.renVMFee', renVMFee)
    store.set('convert.networkFee', fixedFee)
    store.set('convert.conversionTotal', total)
}

// transfers
export const initGJSDeposit = async function(tx) {
    const {
      amount,
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
        sendAmount: GatewayJS.utils.value(amount, "btc").sats().toString(),
        sendTo: localWeb3Address,
        web3Provider: localWeb3.currentProvider
    }

    const preOpenTrades = Array.from((await gjs.getGateways()).values())

    let trade = null
    const open = gjs.open(data);
    open.result()
        .on("status", async (status) => {
            console.log(`[GOT STATUS] ${status}`)
            if (status === GatewayJS.LockAndMintStatus.Committed) {
                const postOpenTrades = Array.from((await gjs.getGateways()).values())

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
      destAddress,
    } = tx
    const store = getStore()
    const {
        gjs,
        localWeb3,
        selectedAsset,
    } = store.getState()

    const data = {
        sendToken: GatewayJS.Tokens[selectedAsset.toUpperCase()].Burn,
        // every source asset for now uses the same unit number as BTC
        sendAmount: GatewayJS.utils.value(amount, "btc").sats().toString(),
        sendTo: destAddress,
        web3Provider: localWeb3.currentProvider
    }

    const preOpenTrades = Array.from((await gjs.getGateways()).values())

    let trade = null
    const open = gjs.open(data);
    open.result()
        .on("status", async (status) => {
            console.log(`[GOT STATUS] ${status}`)
            if (status === GatewayJS.BurnAndReleaseStatus.Committed) {
                const postOpenTrades = Array.from((await gjs.getGateways()).values())

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
    const fsSignature = store.get('fsSignature')
    const db = store.get('db')

    // Re-open incomplete trades
    const localGateways = await gjs.getGateways();
    const localTrades = Array.from(localGateways.values())
    for (const trade of localTrades) {
        const tradeCompleted = isGatewayJSTxComplete(trade.status)
        if (tradeCompleted) {
          continue;
        }
        reOpenTx(trade)
    }

    // Get 3box transactions
    const boxData = await space.private.get('convert.transactions')
    const boxTrades = boxData ? JSON.parse(boxData) : []

    // Get firebase transactions
    const fsDataSnapshot = await db.collection("transactions")
        .where("walletSignature", "==", fsSignature).get()
    let fsTrades = []
    if (!fsDataSnapshot.empty) {
        fsDataSnapshot.forEach(doc => {
            const tx = JSON.parse(doc.data().data)
            fsTrades.push(tx)
        })
    }
    const fsTradeIds = fsTrades.map(f => f.id)

    // if firebase has transactions not found locally, reopen those
    const localTradeIds = localTrades.map(t => t.id)
    fsTrades.map(ftx => {
        if (!isGatewayJSTxComplete(ftx.status)
            && localTradeIds.indexOf(ftx.id) < 0) {
            reOpenTx(ftx)
        }
    })

    // if 3box has transactions not found locally or in firebase, reopen those
    // remove this when we fully switch away from 3box
    boxTrades.map(btx => {
        if (!isGatewayJSTxComplete(btx.status)
            && localTradeIds.indexOf(btx.id) < 0
            && fsTradeIds.indexOf(btx.id) < 0) {
            reOpenTx(btx)
        }
    })
}

window.getStore = getStore
window.GatewayJS = GatewayJS
window.reOpenTx = reOpenTx

export default {
    addTx,
    updateTx,
    removeTx,
}
