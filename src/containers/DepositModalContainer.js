import React from 'react';
import { withStore } from '@spyna/react-store'
import { withStyles } from '@material-ui/styles';
import theme from '../theme/theme'
import classNames from 'classnames'
// import RenSDK from "@renproject/ren";
import DetectNetwork from "web3-detect-network";
import { initBrowserWallet } from '../utils/walletUtils'
import { initConvertToEthereum, initMint, completeConvertToEthereum } from '../utils/txUtils'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Divider from '@material-ui/core/Divider';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';


const styles = () => ({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(2),
      [theme.breakpoints.down('xs')]: {
          overflowY: 'scroll',
          overflowX: 'hidden',
          alignItems: 'flex-start'
      }
    },
    modalContent: {
      backgroundColor: '#fff',
      width: 360,
      maxWidth: '100%',
      padding: theme.spacing(2)
    },
    signInInput: {
      width: '100%'
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        fontWeight: 'bold'
    },
    arrow: {
        width: 30
    },
    subtitle: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(3)
    },
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    dividerTotal: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    showButton: {
        marginTop: theme.spacing(4),
    },
    snackbar: {
        boxShadow: 'none',
        backgroundColor: '#fb8c00',
        minWidth: 'auto',
        marginTop: theme.spacing(3),
        '& b': {
            textDecoration: 'underline'
        },
        '& svg': {
            color: '#fff'
        }
    },
    connectWalletPrompt: {
        padding: theme.spacing(1),
        // width: '100%',
        // paddingBottom: theme.spacing(1),
        // border: '1px solid ' +  theme.palette.grey['300'],
        borderRadius: theme.shape.borderRadius,
        // borderBottomLeftRadius: 0,
        // borderBottomRightRadius: 0,
        // marginBottom: theme.spacing(2),
        // border: '1px solid #EBEBEB',
        '& img': {
            height: 35,
            width: 'auto',
            marginRight: theme.spacing(1)
        },

        // background: '#141e30',
        // background: '-webkit-linear-gradient(to right, #141e30, #243b55)',
        // background: 'linear-gradient(to right, #141e30, #243b55)'
    },
    receiptTitle: {
        fontSize: 14
    },
    receiptAmount: {
        textAlign: 'right',
        fontSize: 14
    },
    total: {
        fontWeight: 'bold'
    },
    disabled: {
        opacity: 0.5,
        cursor: 'normal',
        pointerEvents: 'none'
    },
    walletOption: {
      padding: theme.spacing(2),
      borderRadius: 5,
      // color: '#fff',
      '& h6': {
          // marginTop: theme.spacing(1)
      },
      '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          // backgroundColor: theme.palette.grey['100'],
          cursor: 'pointer',
      }
    },
    disclosure: {
        // marginTop: theme.spacing(2),

        '& span': {
            fontSize: 14
        }
    },
    netTitle: {
        // marginTop: theme.spacing(2),
        fontSize: 14
    },
    netAmount: {
        // marginTop: theme.spacing(2),
        fontSize: 14,
        textAlign: 'right'
    }
})

class DepositModalContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        window.initConvertToEthereum = initConvertToEthereum.bind(this)
        window.completeConvertToEthereum = completeConvertToEthereum.bind(this)
        window.sdk = this.props.store.get('sdk')
    }

    createDeposit() {
        const { store } = this.props
        const depositModalTx = store.get('depositModalTx')

        initConvertToEthereum.bind(this)(depositModalTx)

        store.set('showDepositModal', false)
        store.set('depositDisclosureChecked', false)
        store.set('depositModalTx', null)

        store.set('showGatewayModal', true)
        store.set('gatewayModalTx', depositModalTx)
    }

    check() {
        const { store } = this.props
        const depositDisclosureChecked = store.get('depositDisclosureChecked')
        store.set('depositDisclosureChecked', !depositDisclosureChecked)
    }

    render() {
        const {
            classes,
            store
        } = this.props

        const showDepositModal = store.get('showDepositModal')
        const depositModalTx = store.get('depositModalTx')
        const btcTxFeeEstimate = store.get('btcTxFeeEstimate')
        const depositDisclosureChecked = store.get('depositDisclosureChecked')

        if (!depositModalTx) return null

        const renFee = Number(depositModalTx.amount * 0.001).toFixed(8)
        const btcFee = Number(btcTxFeeEstimate).toFixed(8)
        const totalFee = (Number(renFee) + Number(btcFee)).toFixed(8)

        // console.log(this.props, this.state)

        const amount = store.get('convert.amount')
        const exchangeRate = store.get('convert.exchangeRate')
        const fee = store.get('convert.networkFee')
        const total = store.get('convert.conversionTotal')

        return <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={showDepositModal}
          onClose={() => {
            store.set('showDepositModal', false)
            store.set('depositModalTx', null)
            store.set('depositDisclosureChecked', false)
          }}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={showDepositModal}>
            <Grid container className={classes.modalContent}>
                <Grid className={classNames(classes.connectWalletPrompt)} container alignItems='center' justify='center'>

                      <Grid item xs={12}>
                          <Grid container>
                              {<Typography variant='subtitle1' className={classes.title}>
                                Confirm Transaction
                              </Typography>}

                              <Grid item xs={12}>
                                <Grid container>
                                    <Grid item xs={6}>
                                         <Typography variant='body1' className={classes.receiptTitle}>
                                            Bitcoin sent
                                         </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant='body1' className={classes.receiptAmount}>
                                            {`${amount} BTC`}
                                        </Typography>
                                    </Grid>
                                </Grid>
                              </Grid>

                              <Grid item xs={12}>
                                <Grid container>
                                    <Grid item xs={6}>
                                         <Typography variant='body1' className={classes.receiptTitle}>
                                            Exchange Rate
                                         </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant='body1' className={classes.receiptAmount}>
                                            {`1 BTC = ${exchangeRate} WBTC`}
                                        </Typography>
                                    </Grid>
                                </Grid>
                              </Grid>

                              <Grid item xs={12}>
                                <Grid container>
                                    <Grid item xs={6}>
                                         <Typography variant='body1' className={classes.receiptTitle}>
                                            RenVM Network Fee
                                         </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant='body1' className={classes.receiptAmount}>
                                            {`${fee} BTC`}
                                        </Typography>
                                    </Grid>
                                </Grid>
                              </Grid>

                              {<Grid item xs={12} className={classes.divider}>
                                  <Divider />
                              </Grid>}

                              <Grid item xs={12}>
                                <Grid container>
                                    <Grid item xs={6}>
                                         <Typography variant='body1' className={classes.netTitle}>
                                            <b>WBTC received</b>
                                         </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant='body1' className={classes.netAmount}>
                                            <b>{`~${total} WBTC`}</b>
                                        </Typography>
                                    </Grid>
                                </Grid>
                              </Grid>

                              {<SnackbarContent
                                className={classes.snackbar}
                                message={<Grid item xs={12}>
                                  <FormControlLabel
                                      className={classes.disclosure}
                                    control={
                                      <Checkbox
                                        checked={depositDisclosureChecked}
                                        onChange={this.check.bind(this)}
                                        value="checkedB"
                                        color="primary"
                                      />
                                    }
                                    label={<span>Send <b>{depositModalTx.amount} BTC</b> in <b>1 bitcoin transaction</b> to the address given. Any additional amounts will be lost.</span>}
                                  />
                                </Grid>}
                              />}

                              {<Button
                                  variant={depositDisclosureChecked ? "outlined" : 'contained'}
                                  disabled={!depositDisclosureChecked}
                                  size='large'
                                  color="primary"
                                  fullWidth={true}
                                  className={classNames(classes.showButton)}
                                  onClick={this.createDeposit.bind(this)}
                                  >
                                  Continue
                              </Button>}
                          </Grid>
                      </Grid>
                </Grid>
            </Grid>
          </Fade>
        </Modal>
    }
}

export default withStyles(styles)(withStore(DepositModalContainer))
