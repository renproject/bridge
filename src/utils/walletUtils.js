import Web3 from "web3";
import GatewayJS from '@renproject/gateway'
import Box from '3box'
import Web3Modal from 'web3modal'
import firebase from 'firebase'

import BTC from '../assets/btc.png'
import ETH from '../assets/eth.png'
import ZEC from '../assets/zec.svg'
import BCH from '../assets/bch.png'
import DAI from '../assets/dai.png'
import USDC from '../assets/usdc.png'
import WBTC from '../assets/wbtc.png'
import RENBTC from '../assets/renBTC.svg'
import RENZEC from '../assets/renZEC.svg'
import RENBCH from '../assets/renBCH.svg'

import {
    RENBTC_MAIN,
    RENBTC_TEST,
    RENZEC_MAIN,
    RENZEC_TEST,
    RENBCH_MAIN,
    RENBCH_TEST
} from './web3Utils'

import {
    recoverTrades
} from './txUtils'

import { getStore } from '../services/storeService'

import erc20ABI from "./erc20ABI.json";

let walletDataInterval = null

export const ASSETS = ['BTC', 'WBTC']

export const NAME_MAP = {
    btc: 'Bitcoin',
    eth: 'Ethereum',
    zec: 'Zcash',
    bch: 'Bitcoin Cash',
    dai: 'DAI',
    usdc: 'USDC',
    wbtc: 'Wrapped Bitcoin',
    renbtc: 'Ren Bitcoin',
    renzec: 'Ren Zcash',
    renbch: 'Ren Bitcoin Cash'
}

export const SYMBOL_MAP = {
    btc: 'BTC',
    eth: 'ETH',
    zec: 'ZEC',
    bch: 'BCH',
    dai: 'DAI',
    usdc: 'USDC',
    wbtc: 'WBTC',
    renbtc: 'renBTC',
    renzec: 'renZEC',
    renbch: 'renBCH'
}

export const NETWORK_MAP = {
    btc: 'bitcoin',
    eth: 'ethereum',
    zec: 'zcash',
    bch: 'bitcoin-cash',
    dai: 'ethereum',
    usdc: 'ethereum',
    wbtc: 'ethereum',
    renbtc: 'ethereum',
    renzec: 'ethereum',
    renbch: 'ethereum'
}

export const MINI_ICON_MAP = {
    btc: BTC,
    eth: ETH,
    zec: ZEC,
    bch: BCH,
    dai: DAI,
    usdc: USDC,
    wbtc: WBTC,
    renbtc: RENBTC,
    renzec: RENZEC,
    renbch: RENBCH
}

export const resetWallet = async function() {
    const store = getStore()
    store.set('localWeb3', null)
    store.set('localWeb3Address', '')
    store.set('localWeb3Network', '')
    store.set('space', null)
    store.set('convert.transactions', [])
}

export const updateFees = async function() {
    const store = getStore()
    try {
        const fees = await fetch('https://lightnode-mainnet.herokuapp.com', {
            method: 'POST', // or 'PUT'
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: 67,
              jsonrpc: "2.0",
              method: "ren_queryFees",
              params: {}
            })
        })
        const data = (await fees.json()).result
        // console.log(data)
        // console.log('renvm fees', await fees.json())
        store.set('fees', data)
    } catch(e) {
        console.log(e)
    }
}

export const updateMarketData = async function() {
    const store = getStore()

    try {
        const btc = await fetch(`https://api.coincap.io/v2/assets/bitcoin`, {
            method: 'GET',
        })

        store.set('btcusd', (await btc.json()).data.priceUsd)
    } catch(e) {
        console.log(e)
    }

    try {
        const zec = await fetch(`https://api.coincap.io/v2/assets/zcash`, {
            method: 'GET',
        })

        store.set('zecusd', (await zec.json()).data.priceUsd)
    } catch(e) {
        console.log(e)
    }

    try {
        const bch = await fetch(`https://api.coincap.io/v2/assets/bitcoin-cash`, {
            method: 'GET',
        })

        store.set('bchusd', (await bch.json()).data.priceUsd)
    } catch(e) {
        console.log(e)
    }
}


export const updateBalance = async function() {
    const store = getStore()

    const web3 = store.get('localWeb3')
    const walletAddress = store.get('localWeb3Address')
    const renBTCAddress = store.get('renBTCAddress')
    const renZECAddress = store.get('renZECAddress')
    const renBCHAddress = store.get('renBCHAddress')

    if (!web3 || !walletAddress) {
        return
    }

    const renBTC = new web3.eth.Contract(erc20ABI, renBTCAddress);
    const renZEC = new web3.eth.Contract(erc20ABI, renZECAddress);
    const renBCH = new web3.eth.Contract(erc20ABI, renBCHAddress);
    const renBTCBalance = await renBTC.methods.balanceOf(walletAddress).call();
    const renZECBalance = await renZEC.methods.balanceOf(walletAddress).call();
    const renBCHBalance = await renBCH.methods.balanceOf(walletAddress).call();
    const ethBal = await web3.eth.getBalance(walletAddress);

    store.set('ethBalance', Number(web3.utils.fromWei(ethBal)).toFixed(8))
    store.set('renBTCBalance', Number(parseInt(renBTCBalance.toString()) / 10 ** 8).toFixed(8))
    store.set('renZECBalance', Number(parseInt(renZECBalance.toString()) / 10 ** 8).toFixed(8))
    store.set('renBCHBalance', Number(parseInt(renBCHBalance.toString()) / 10 ** 8).toFixed(8))
    store.set('loadingBalances', false)

    updateMarketData()
}

export const watchWalletData = async function() {
    const store = getStore()
    if (walletDataInterval) {
        clearInterval(walletDataInterval)
    }
    // await updateAllowance()
    await updateBalance()
    walletDataInterval = setInterval(async () => {
        // await updateAllowance()
        await updateBalance()
    }, 10 * 1000)
}

export const initDataWeb3 = async function() {
   const store = getStore()
   const network = store.get('selectedNetwork')
   store.set('dataWeb3', new Web3(`https://${network === 'testnet' ? 'kovan' : 'mainnet'}.infura.io/v3/7be66f167c2e4a05981e2ffc4653dec2`))
}

export const initLocalWeb3 = async function() {
    const store = getStore()
    store.set('walletConnecting', true)

    // already connected
    if (store.get('localWeb3Address')) {
        return
    }

    store.set('spaceError', false)
    const selectedNetwork = store.get('selectedNetwork')

    // web3 modal
    const providerOptions = {}
    const web3Modal = new Web3Modal({
        network: selectedNetwork === 'testnet' ? "kovan" : 'mainnet', // optional
        cacheProvider: false, // optional
        providerOptions // required
    })
    const web3Provider = await web3Modal.connect()

    const web3 = new Web3(web3Provider)
    const currentProvider = web3.currentProvider
    const accounts = await web3.eth.getAccounts()
    const address = accounts[0]
    const addressLowerCase = address.toLowerCase()
    const db = store.get('db')

    // set app network based on web3 network
    let network = ''
    if (currentProvider.networkVersion === '1') {
        network = 'mainnet'
    } else if (currentProvider.networkVersion === '42') {
        network = 'testnet'
    }

    if (selectedNetwork !== network) {
        store.set('showNetworkModal', true)
        return
    }

    try {
        ///////////////////////////////////////////////////////
        // Firebase Sign In or Sign Up
        //////////////////////////////////////////////////////

        let signature = ''

        // get from local storage if user has signed in already
        const localSigMap = localStorage.getItem('sigMap')
        const localSigMapData = localSigMap ? JSON.parse(localSigMap) : {}
        if (localSigMapData[addressLowerCase]) {
            signature = localSigMapData[addressLowerCase]
        } else {
            // get unique wallet signature for firebase backup
            const sig = await web3.eth.personal.sign(web3.utils.utf8ToHex("Signing in to RenBridge"), addressLowerCase)
            signature = web3.utils.sha3(sig)
            localSigMapData[addressLowerCase] = signature
            localStorage.setItem('sigMap', JSON.stringify(localSigMapData))
        }

        store.set('fsSignature', signature)

        // auth with firestore
        const bridgeId = `${addressLowerCase}@renproject.io`
        const currentFsUser = firebase.auth().currentUser
        let fsUser

        if (!currentFsUser || currentFsUser.email !== bridgeId) {
            try {
                fsUser = (await firebase.auth()
                    .signInWithEmailAndPassword(bridgeId, signature)).user
            } catch(e) {
                console.log(e)
                console.log('new user')
                fsUser = (await firebase.auth()
                    .createUserWithEmailAndPassword(bridgeId, signature)).user
            }
        } else {
            fsUser = currentFsUser
        }

        store.set('fsUser', fsUser)

        // update user collection
        const doc = await db.collection("users").doc(fsUser.uid)
        const docData = await doc.get()

        if (docData.exists) {
            const data = docData.data()
            if (data.signatures.indexOf(signature) < 0) {
                // add a new signature if needed
                await doc.update({
                    signatures: data.signatures.concat([signature]),
                    updated: firebase.firestore.Timestamp.fromDate(new Date(Date.now()))
                })
            }
        } else {
            // create user
            await doc.set({
                uid: fsUser.uid,
                updated: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
                signatures: [signature]
            })
        }

        store.set('fsEnabled', true)

        ///////////////////////////////////////////////////////
        // Recover Transactions
        //////////////////////////////////////////////////////

        // recover transactions from 3box
        store.set('spaceRequesting', true)
        // console.log(currentProvider, accounts)
        const box = await Box.openBox(accounts[0], currentProvider)

        store.set('box', box)
        // console.log(box)
        const space = await box.openSpace("ren-bridge")
        // console.log('space', space)
        store.set('space', space)
        window.space = space

        store.set('localWeb3', web3)
        store.set('localWeb3Address', accounts[0])
        store.set('localWeb3Network', network)
        store.set('spaceRequesting', false)
        store.set('walletConnecting', false)

        recoverTrades()
        updateBalance()

        // listen for changes
        currentProvider.on('accountsChanged', async () => {
            window.location.reload()
        })

        currentProvider.on('chainChanged', async () => {
            window.location.reload()
        })

        currentProvider.on('networkChanged', async () => {
            window.location.reload()
        })
    } catch(e) {
        console.log(e)
        store.set('spaceError', true)
        store.set('spaceRequesting', false)
        store.set('walletConnecting', false)
    }

    return
}

export const setAddresses = async function() {
    const store = getStore()
    const network = store.get('selectedNetwork')
    if (network === 'testnet') {
        store.set('renBTCAddress', RENBTC_TEST)
        store.set('renZECAddress', RENZEC_TEST)
        store.set('renBCHAddress', RENBCH_TEST)
    } else {
        store.set('renBTCAddress', RENBTC_MAIN)
        store.set('renZECAddress', RENZEC_MAIN)
        store.set('renBCHAddress', RENBCH_MAIN)
    }
}

export const setNetwork = async function(network) {
    const store = getStore()
    store.set('selectedNetwork', network)
    store.set('gjs', new GatewayJS(network))

    setAddresses.bind(this)()
}

export const abbreviateAddress = function(walletAddress) {
    if (!walletAddress || typeof walletAddress !== 'string') {
        return ''
    } else {
        return (walletAddress.slice(0,5) + '...' + walletAddress.slice(walletAddress.length - 5))
    }
}

export default {
    resetWallet,
    setNetwork,
    updateBalance,
    abbreviateAddress
}
