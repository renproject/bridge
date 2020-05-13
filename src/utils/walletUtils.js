import Web3 from "web3";
// import RenSDK from "@renproject/ren";
import DetectNetwork from "web3-detect-network";
import Box from '3box';
import Portis from '@portis/web3';
import Torus from "@toruslabs/torus-embed";
import Web3Modal from 'web3modal'
import Authereum from "authereum"
import Fortmatic from "fortmatic";

import BTC from '../assets/btc.png'
import ETH from '../assets/eth.png'
import ZEC from '../assets/zec.jpg'
import DAI from '../assets/dai.png'
import USDC from '../assets/usdc.png'
import WBTC from '../assets/wbtc.png'
import RENBTC from '../assets/renBTC.svg'

import {
    ZBTC_MAIN,
    ZBTC_TEST,
    RENBTC_MAIN,
    RENBTC_TEST,
    ADAPTER_MAIN,
    ADAPTER_TEST,
    BTC_SHIFTER_MAIN,
    BTC_SHIFTER_TEST,
    WBTC_TEST
} from './web3Utils'

import {
    initMonitoring,
    gatherFeeData,
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
    dai: 'DAI',
    usdc: 'USDC',
    wbtc: 'WBTC',
    renbtc: 'renBTC',
    renzec: 'renZEC',
    renbch: 'renBCH'
}

export const MINI_ICON_MAP = {
    btc: BTC,
    eth: ETH,
    zec: ZEC,
    dai: DAI,
    usdc: USDC,
    wbtc: WBTC,
    renbtc: RENBTC,
    renzec: RENBTC,
    renbch: RENBTC
}

export const resetWallet = async function() {
    const store = getStore()
    store.set('localWeb3', null)
    store.set('localWeb3Address', '')
    store.set('localWeb3Network', '')
    store.set('space', null)
    store.set('convert.transactions', [])
}

export const updateAllowance = async function() {
    const store = getStore()

    const web3 = store.get('localWeb3')
    const walletAddress = store.get('localWeb3Address')

    if (!web3 || !walletAddress) {
        return
    }

    const contract = new web3.eth.Contract(erc20ABI, WBTC_TEST);
    const allowance = await contract.methods.allowance(walletAddress, ADAPTER_TEST).call();

    // console.log('allowance', allowance)

    store.set('convert.adapterWbtcAllowance', Number(parseInt(allowance.toString()) / 10 ** 8).toFixed(8))
}

export const setWbtcAllowance = async function() {
    const store = getStore()
    const walletAddress = store.get('localWeb3Address')
    const web3 = store.get('localWeb3')

    const contract = new web3.eth.Contract(erc20ABI, WBTC_TEST)
    store.set('convert.adapterWbtcAllowanceRequesting', true)
    try {
        await contract.methods.approve(ADAPTER_TEST, web3.utils.toWei('1000000000000000000')).send({
            from: walletAddress
        })
        updateAllowance();
        store.set('convert.adapterWbtcAllowanceRequesting', false)
    } catch(e) {
        // console.log(e)
        store.set('convert.adapterWbtcAllowanceRequesting', false)
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
}

export const watchWalletData = async function() {
    const store = getStore()
    if (walletDataInterval) {
        clearInterval(walletDataInterval)
    }
    await updateAllowance()
    await updateBalance()
    walletDataInterval = setInterval(async () => {
        await updateAllowance()
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
    store.set('spaceError', false)

    const providerOptions = {
        // authereum: {
        //     package: Authereum, // required
        //     options: {
        //         networkName: 'kovan'
        //     }
        // },
        // torus: {
        //     package: Torus, // required
        //     options: {
        //         network: {
        //             host: 'kovan'
        //         }
        //     }
        // },
        // fortmatic: {
        //     package: Fortmatic, // required
        //     options: {
        //         key: "pk_test_D12A04424946656D" // required
        //     }
        // }
    }

    const web3Modal = new Web3Modal({
        network: "kovan", // optional
        cacheProvider: false, // optional
        providerOptions // required
    })

    // console.log('web3Modal', web3Modal)

    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const currentProvider = web3.currentProvider
    const accounts = await web3.eth.getAccounts()
    let network = ''
    if (currentProvider.networkVersion === '1') {
        network = 'mainnet'
        store.set('showNetworkModal', true)
        return
    } else if (currentProvider.networkVersion === '42' ||
      (currentProvider.authereum && currentProvider.authereum.networkId === 42)) {
        network = 'testnet'
    }

    store.set('localWeb3', web3)
    store.set('localWeb3Address', accounts[0])
    store.set('localWeb3Network', network)

    try {
        // // recover transactions from 3box
        // const box = await Box.openBox(accounts[0], currentProvider)
        // const space = await box.openSpace("wbtc-cafe")
        // const txData = await space.public.get('convert.transactions')
        //
        // const transactions = txData ? JSON.parse(txData) : []
        // store.set('convert.transactions', transactions)
        // store.set('space', space)
        // window.space = space

        // recover transactions from localStorage
        const txData = window.localStorage.getItem('convert.transactions')
        const transactions = txData ? JSON.parse(txData) : []
        store.set('convert.transactions', transactions)

        if (network === 'testnet') {
            watchWalletData()
            gatherFeeData()
            initMonitoring()
            recoverTrades()
        }

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
        store.set('spaceError', true)
    }

    return
}

export const setNetwork = async function(network) {
    const {
        store
    } = this.props
    store.set('selectedNetwork', network)
    store.set('showNetworkMenu', false)

    setAddresses.bind(this)()
    resetWallet.bind(this)()
}

export const setAddresses = async function() {
    const {
        store
    } = this.props
    const network = store.get('selectedNetwork')
    if (network === 'testnet') {
        store.set('zbtcAddress', ZBTC_TEST)
        store.set('btcShifterAddress', BTC_SHIFTER_TEST)
        store.set('adapterAddress', ADAPTER_TEST)
    } else {
        store.set('zbtcAddress', ZBTC_MAIN)
        store.set('btcShifterAddress', BTC_SHIFTER_MAIN)
        store.set('adapterAddress', ADAPTER_MAIN)
    }
}

export const abbreviateAddress = function(walletAddress) {
    if (!walletAddress || typeof walletAddress !== 'string') {
        return ''
    } else {
        return (walletAddress.slice(0,7) + '...' + walletAddress.slice(walletAddress.length - 5))
    }
}

window.setWbtcAllowance = setWbtcAllowance

export default {
    resetWallet,
    setNetwork,
    updateBalance,
    abbreviateAddress
}
