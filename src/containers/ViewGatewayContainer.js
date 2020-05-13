import React from 'react';
import { withStore } from '@spyna/react-store'
import { withStyles } from '@material-ui/styles';
import theme from '../theme/theme'
import classNames from 'classnames'
// import RenSDK from "@renproject/ren";
import DetectNetwork from "web3-detect-network";
import { initBrowserWallet } from '../utils/walletUtils'
import { removeTx } from '../utils/txUtils'
import Web3 from "web3";
import EthCrypto from 'eth-crypto'
import Box from '3box';
import Portis from '@portis/web3';
import Torus from "@toruslabs/torus-embed";

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
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
    },
    dividerTotal: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    cancelButton: {
        marginTop: theme.spacing(3),
    },
    backButton: {
        marginTop: theme.spacing(1),
    },
    content: {
      fontSize: 14,
      width: '100%'
    },
    address: {
      fontSize: 12,
      marginTop: theme.spacing(2),
      padding: theme.spacing(1),
      border: '1px solid ' + theme.palette.divider,
      width: '100%',
      fontWeight: 'bold'
    }
})

class ViewGatewayContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    goBack() {
        const { store } = this.props

        store.set('showGatewayModal', false)
        store.set('gatewayModalTx', null)
    }

    render() {
        const {
            classes,
            store
        } = this.props

        const showGatewayModal = store.get('showGatewayModal')
        const gatewayModalTx = store.get('gatewayModalTx')

        if (!gatewayModalTx) return null

        // console.log(this.props, this.state)

        return <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={showGatewayModal}
          onClose={() => {
            this.goBack.bind(this)()
          }}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={showGatewayModal}>
            <Grid container className={classes.modalContent}>
                <Grid className={classNames(classes.connectWalletPrompt)} container alignItems='center' justify='center'>

                      <Grid item xs={12}>
                          <Grid container>
                              {<Typography variant='subtitle1' className={classes.title}>
                                  Gateway Address
                              </Typography>}

                              <Typography variant='body1' className={classes.content}>
                                  Send {gatewayModalTx.amount} BTC to:
                              </Typography>

                              <Typography variant='body1' className={classes.address}>
                                  {gatewayModalTx.renBtcAddress}
                              </Typography>

                              <Button
                                  variant="outlined"
                                  size='large'
                                  fullWidth={true}
                                  className={classNames(classes.cancelButton)}
                                  onClick={this.goBack.bind(this)}
                                  >
                                  Close
                              </Button>
                          </Grid>
                      </Grid>
                </Grid>
            </Grid>
          </Fade>
        </Modal>
    }
}

export default withStyles(styles)(withStore(ViewGatewayContainer))
