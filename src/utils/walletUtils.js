import Web3 from "web3";
import GatewayJS from '@renproject/gateway'
import Box from '3box'

import DetectNetwork from "web3-detect-network";
import Web3Modal from 'web3modal'

import BTC from '../assets/btc.png'
import ETH from '../assets/eth.png'
import ZEC from '../assets/zec.jpg'
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
    initMonitoring,
    // gatherFeeData,
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

    // manual connect to injected web3
    // let web3Provider;
    //
    // if (window.ethereum) {
    //     web3Provider = window.ethereum;
    //     try {
    //         // Request account access
    //         await window.ethereum.enable();
    //     } catch (error) {
    //         console.log(error)
    //         return
    //     }
    // }
    // // Legacy dApp browsers...
    // else if (window.web3) {
    //     web3Provider = window.web3.currentProvider;
    // }
    // // If no injected web3 instance is detected, fall back to Ganache
    // else {
    //     return
    // }

    const web3 = new Web3(web3Provider)
    const currentProvider = web3.currentProvider
    const accounts = await web3.eth.getAccounts()
    // console.log('accounts', accounts)
    let network = ''
    if (currentProvider.networkVersion === '1') {
        network = 'mainnet'
    } else if (currentProvider.networkVersion === '42' ||
      (currentProvider.authereum && currentProvider.authereum.networkId === 42)) {
        network = 'testnet'
    }

    if (selectedNetwork !== network) {
        store.set('showNetworkModal', true)
        return
    }

    try {
        // recover transactions from 3box
        store.set('spaceRequesting', true)
        // console.log(currentProvider, accounts)
        const box = await Box.openBox(accounts[0], currentProvider)

        // alternate
        // const provider = await Box.get3idConnectProvider()
        // const box = await Box.create(provider)
        // const auth = await box.auth(["ren-bridge"], {
        //     address: accounts[0]
        // })
        // console.log(auth)

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

        // sometimes 3box data isn't immediately there, so recover
        // after a slight delay
        setTimeout(() => {
            recoverTrades()
            updateBalance()
        }, 100)

        // listen for changes
        currentProvider.on('accountsChanged', async () => {
            resetWallet()
            initLocalWeb3()
        })

        currentProvider.on('chainChanged', async () => {
            resetWallet()
            initLocalWeb3()
        })

        currentProvider.on('networkChanged', async () => {
            resetWallet()
            initLocalWeb3()
        })
    } catch(e) {
        console.log(e)
        store.set('spaceError', true)
        store.set('spaceRequesting', false)
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

export const modifyNumericInput = function(value, string, input) {
    const valStr = String(value)
    // console.log(value, string, input, valStr)
    if (string === '.') {
        setTimeout(() => {
          input.value = '0.'
        }, 1)
    } else if (string === '.0') {
        setTimeout(() => {
          input.setValue(0.0)
          input.value = '0.0'
        }, 1)
    } else if (valStr.length === 3 && valStr.charAt(1) === '.'){
        setTimeout(() => {
          if (input.createTextRange) {
              var part = input.createTextRange();
              part.move("character", 3);
              part.select();
          } else if (input.setSelectionRange) {
              input.setSelectionRange(3, 3);
          }
          input.focus();
        }, 1)
    }
}

// window.setWbtcAllowance = setWbtcAllowance

export default {
    resetWallet,
    setNetwork,
    updateBalance,
    abbreviateAddress
}
