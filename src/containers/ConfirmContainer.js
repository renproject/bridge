import React from 'react';
import { withStore } from '@spyna/react-store'
import { withStyles } from '@material-ui/styles';
import theme from '../theme/theme'
import classNames from 'classnames'
// import RenSDK from "@renproject/ren";
import sb from "satoshi-bitcoin"
import AddressValidator from "wallet-address-validator";
import {
    addTx,
    updateTx,
    removeTx,
    initMonitoring,
    initConvertToEthereum,
    initConvertFromEthereum,
    initTransfer,
    gatherFeeData,
    initGJSDeposit,
    initGJSWithdraw
} from '../utils/txUtils'
import { MINI_ICON_MAP, SYMBOL_MAP, initLocalWeb3, setWbtcAllowance, abbreviateAddress } from '../utils/walletUtils'
import Web3 from "web3";
import { ethers } from 'ethers';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import CurrencyInput from '../components/CurrencyInput';
import BigCurrencyInput from '../components/BigCurrencyInput';
import ActionLink from '../components/ActionLink';
import BackArrow from '../assets/back-arrow.svg';
import WalletIcon from '../assets/wallet-icon.svg'

import adapterABI from "../utils/adapterABI.json";

const styles = () => ({
    container: {
        background: '#fff',
        border: '0.5px solid ' + theme.palette.divider
    },
    transferActionTabs: {
        margin: '0px auto',
        // marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        '& div.MuiToggleButtonGroup-root': {
            width: '100%'
        },
        '& button': {
            width: '50%'
        }
    },
    depositAddressContainer: {
        // marginTop: theme.spacing(1)
    },
    depositAddress: {
        width: '100%',
        // marginTop: theme.spacing(1)
    },
    actionButtonContainer: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        textAlign: 'center',
        '& button': {
            // minHeight: 64,
            // borderRadius: theme.spacing(1),
            // background: 'linear-gradient(60deg,#ffc826,#fb8c00)',
            // boxShadow: 'none',
            '&.Mui-disabled': {
                // background: '#eee'
            },
            margin: '0px auto',
            fontSize: 12,
            minWidth: 175,
            padding: theme.spacing(1)
        }
    },
    amountField: {
        width: '100%'
    },
    depositButton: {
        // width: '100%'
    },
    withdrawButton: {
        // width: '100%'
        // margin: '0px auto'
    },
    actions: {
        paddingTop: theme.spacing(1),
        padding: theme.spacing(3)
    },
    transactionsContainer: {
        padding: theme.spacing(3),
        paddingTop: theme.spacing(0),
        marginTop: theme.spacing(2),
        borderTop: '1px solid #EBEBEB'
    },
    actionsContainer: {
        // border: '1px solid #EBEBEB',
        // borderTop: '0px solid transparent',
        // padding: theme.spacing(3),
        // paddingTop: 0,
        // border: '1px solid ' +  theme.palette.grey['300'],
        borderRadius: theme.shape.borderRadius,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    destChooser: {
      width: '100%',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      '& div.MuiToggleButtonGroup-root': {
          width: '100%'
      },
      '& button': {
          width: '50%'
      }
    },
    fees: {
        width: '100%',
        // borderRadius: 4,
        border: '1px solid ' + theme.palette.divider,
        fontSize: 12,
        padding: theme.spacing(1),
        paddingBottom: 0,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3),
        display: 'flex',
        flexDirection:'column',
        '& span': {
            marginBottom: theme.spacing(1)
        }
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: theme.spacing(0.75),
        // marginLeft: theme.spacing(0.75),
    },
    toggle: {
      '& button': {
        minHeight: 'auto',
        border: '0px solid transparent',
        borderBottom: '1px solid ' + theme.palette.divider,
        '&:first-child': {
          borderRight: '1px solid ' + theme.palette.divider
        },
        '&.Mui-selected': {
          borderBottom: '0px solid transparent'
        }
      }
    },
    title: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(3)
    },
    optionsContainer: {
        border: '1px solid ' + theme.palette.divider,
        borderBottom: 'none',
        marginTop: theme.spacing(3)
    },
    option: {
        borderBottom: '1px solid ' + theme.palette.divider,
        padding: theme.spacing(3),
        '& img': {
            height: 'auto',
            width: 24,
            marginRight: theme.spacing(1)
        },
        '& div': {
            display: 'flex',
            alignItems: 'center'
        }
    },
    headerText: {
        textAlign: 'center',
        position: 'relative',
        backgroundColor: '#fbfbfb',
        borderLeft: '1px solid ' + theme.palette.divider,
        borderRight: '1px solid ' + theme.palette.divider,
        borderBottom: '1px solid ' + theme.palette.divider,
        paddingBottom: theme.spacing(6)
    },
    titleAmount: {
        marginTop: theme.spacing(5)
    },
    back: {
        position: 'absolute',
        top: 16,
        left: 16,
        height: 'auto',
        width: 18,
        cursor: 'pointer',
        zIndex: 100000
    }
})

class ConfirmContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.store.getState()
    }

    componentDidMount() {
        // for debugging
        window.addTx = addTx.bind(this)
        window.updateTx = updateTx.bind(this)
        window.removeTx = removeTx.bind(this)
        window.store = this.props.store
    }

    showDepositModal(tx) {
        const { store } = this.props
        store.set('showDepositModal', true)
        store.set('depositModalTx', tx)
    }

    async gatherFeeData() {

    }

    async confirmDeposit() {
        const { store } = this.props
        const confirmTx = store.get('confirmTx')

        initGJSDeposit(confirmTx)
    }

    async confirmWithdraw() {
        const { store } = this.props
        const confirmTx = store.get('confirmTx')

        initGJSWithdraw(confirmTx)
    }

    render() {
        const {
            classes,
            store
        } = this.props

        const walletAddress = store.get('walletAddress')
        const transactions = store.get('transactions')
        const selectedNetwork = store.get('selectedNetwork')
        const selectedTab  = store.get('selectedTab')
        const selectedTransferTab  = store.get('selectedTransferTab')
        const selectedAsset  = store.get('selectedAsset')
        const showAboutModal = store.get('showAboutModal')

        const depositAmount = store.get('depositAmount')
        const withdrawAmount = store.get('withdrawAmount')
        const withdrawAddressValid = store.get('withdrawAddressValid')
        const transferAmount = store.get('transferAmount')
        const transferAddressValid = store.get('transferAddressValid')

        const selectedDirection  = store.get('convert.selectedDirection')

        const localWeb3Address = store.get('localWeb3Address')
        const space = store.get('space')
        const renBTCBalance = store.get('renBTCBalance')

        const amount = store.get('convert.amount')
        const exchangeRate = store.get('convert.exchangeRate')
        const fee = store.get('convert.networkFee')
        const total = store.get('convert.conversionTotal')

        const allowance = store.get('convert.adapterWbtcAllowance')
        const hasAllowance = Number(amount) <= Number(allowance)
        const allowanceRequesting = store.get('convert.adapterWbtcAllowanceRequesting')

        const convertAddressValid = store.get('convert.destinationValid')
        const canConvertTo = amount > 0.00010001
        const canConvertFrom = Number(total) > 0.00010001 && amount <= Number(renBTCBalance)


        const confirmAction = store.get('confirmAction')
        const isDeposit = confirmAction === 'deposit'
        const confirmTx = store.get('confirmTx')

        const sourceAsset = confirmTx.sourceAsset
        const destAsset = confirmTx.destAsset


        // console.log('transfer render', store.getState())

        return <div className={classes.container}>
            <div className={classes.headerText}>
                <img className={classes.back}
                  src={BackArrow}
                  onClick={() => {
                      store.set('confirmTx', null)
                      store.set('confirmAction', '')
                  }}/>
                <Typography variant='overline'>
                    {isDeposit ? 'Minting' : 'Releasing'}
                </Typography>

                <Typography variant='h4' className={classes.titleAmount}>
                    {confirmTx.amount} {SYMBOL_MAP[sourceAsset]}
                </Typography>

                <Typography variant='p' className={classes.usdAmount}>
                    = $0.00
                </Typography>
            </div>
            <div className={classes.actionsContainer}>
                <Grid className={classes.actions}>
                    <Grid container justify='center'>
                        <Grid item xs={12}>
                            <Grid className={classes.optionsContainer} container direction='column'>
                                <Grid container className={classes.option}>
                                    <Grid item xs={6}>
                                        {isDeposit ? 'Minting' : 'Releasing'}
                                    </Grid>
                                    <Grid item xs={6}>
                                        <img src={MINI_ICON_MAP[sourceAsset]}/>{SYMBOL_MAP[sourceAsset]}
                                    </Grid>
                                </Grid>
                                <Grid container className={classes.option}>
                                    <Grid item xs={6}>
                                        Destination
                                    </Grid>
                                    <Grid item xs={6}>
                                        <img src={WalletIcon}/>
                                        {abbreviateAddress(confirmTx.destAddress)}
                                    </Grid>
                                </Grid>
                                <Grid container className={classes.option}>
                                    <Grid item xs={6}>
                                        RenVM Fee
                                    </Grid>
                                    <Grid item xs={6}>

                                    </Grid>
                                </Grid>
                                <Grid container className={classes.option}>
                                    <Grid item xs={6}>
                                        You will receive
                                    </Grid>
                                    <Grid item xs={6}>
                                        <img src={MINI_ICON_MAP[destAsset]}/>0.00 {SYMBOL_MAP[destAsset]}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container justify='center' className={classes.actionButtonContainer}>
                        {selectedDirection === 0 && <Grid item xs={12}>
                            <Button
                                disabled={!canConvertTo}
                                variant={canConvertTo ? 'outlined' : 'contained'}
                                size="small"
                                className={classNames(classes.margin, classes.actionButton)}
                                onClick={this.confirmDeposit.bind(this)}>
                                Confirm
                            </Button>
                        </Grid>}
                        {selectedDirection === 1 && <Grid item xs={12}>
                            <Button
                                disabled={false}
                                variant={canConvertFrom ? 'outlined' : 'contained'}
                                size="small"
                                className={classNames(classes.margin, classes.actionButton)}
                                onClick={this.confirmWithdraw.bind(this)}>
                                Confirm
                            </Button>
                        </Grid>}
                    </Grid>

                </Grid>
            </div>
        </div>
    }
}

export default withStyles(styles)(withStore(ConfirmContainer))
