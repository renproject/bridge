import React from 'react';
import { withStore } from '@spyna/react-store'
import { withStyles } from '@material-ui/styles';
import theme from '../theme/theme'
import classNames from 'classnames'
// import RenSDK from "@renproject/ren";
import DetectNetwork from "web3-detect-network";
import { initLocalWeb3 } from '../utils/walletUtils'
import { removeTx } from '../utils/txUtils'

import Web3 from "web3";

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MetaMask from '../assets/metamask-intro.svg'


const styles = () => ({
    container: {
        textAlign: 'center',
        paddingTop: theme.spacing(3)
    },
    title: {
        marginBottom: theme.spacing(3),
        fontSize: 48
    },
    metamask: {
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(3),
        '& img': {
            width: 92,
            height: 'auto',
        }
    },
    message: {
        // marginTop: theme.spacing(3),
        marginBottom: theme.spacing(4)
    },
    button: {
        width: '100%',
        maxWidth: 230
    }
})

class IntroContainer extends React.Component {

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

        return <div className={classes.container}>
            <Typography className={classes.title} variant='h2'>
                Bitcoin, Zcash and Bitcoin Cash on&nbsp;Ethereum.
            </Typography>
            <Typography className={classes.subtitle} variant='p'>
                The safe, fast and most secure way to bring cross-chain assets to&nbsp;Ethereum.
            </Typography>
            <Grid className={classes.metamask} container justify='center'>
                <img src={MetaMask} />
            </Grid>
            <Grid container justify='center'>
                <Typography className={classes.message} variant='p'>
                    To mint or release assets, connect your&nbsp;wallet.
                </Typography>
            </Grid>
            <Grid container justify='center'>
                <Button onClick={initLocalWeb3}
                    className={classes.button}
                    size='large'
                    color='primary'
                    variant='contained'>
                    Connect Wallet
                </Button>
            </Grid>
        </div>
    }
}

export default withStyles(styles)(withStore(IntroContainer))
