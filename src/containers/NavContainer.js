import React from 'react';
import { withStore } from '@spyna/react-store'
import { withStyles } from '@material-ui/styles';
import theme from '../theme/theme'
import classNames from 'classnames'
// import RenSDK from "@renproject/ren";
import { resetWallet, setNetwork, initLocalWeb3 } from '../utils/walletUtils'

import Web3 from "web3";
import EthCrypto from 'eth-crypto'
import Box from '3box';
import Portis from '@portis/web3';
import Torus from "@toruslabs/torus-embed";

import WBTCIcon from '../assets/wbtc-logo.svg';
import RenLogo from '../assets/ren-logo-black.svg';
import AccountIcon from '@material-ui/icons/AccountCircle';
import WifiIcon from '@material-ui/icons/Wifi';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import InfoIcon from '@material-ui/icons/Info';

const styles = () => ({
    navContainer: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        minHeight: 52,
        // borderBottom: '1px solid ' + theme.palette.divider,
        // backgroundColor: '#fff'
    },
    logo: {
        height: 46,
        width: 'auto',
        marginRight: theme.spacing(1),
        // [theme.breakpoints.down('xs')]: {
        //     height: 17,
        //     width: 20,
        // }
    },
    cafe: {
        fontFamily: 'Alex Brush',
        marginLeft: theme.spacing(0.5),
        fontSize: 15
    },
    aboutButton: {
        marginRight: theme.spacing(1),
        '& svg': {
            height: '0.7em',
            marginRight: theme.spacing(0.25)
        }
    },
    accountButton: {
      fontSize: 12,
      '& svg': {
        marginRight: theme.spacing(1)
        },
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            marginTop: theme.spacing(2)
        }
    },
    title: {
      // marginBottom: theme.spacing(0.5),
      fontSize: 16,
      textAlign: 'center'
        // [theme.breakpoints.down('xs')]: {
        //     // fontSize: 16
        //     display: 'none'
        // }
    },
    faq: {
        marginRight: theme.spacing(2)
    },
    hideMobile: {
        [theme.breakpoints.down('xs')]: {
            // fontSize: 16
            display: 'none'
        }
    }
})

class NavContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    anchorRef = React.createRef()

    async componentDidMount() {
    }

    toggleNeworkMenu() {
        const { store } = this.props
        const showNetworkMenu = store.get('showNetworkMenu')
        store.set('showNetworkMenu', !showNetworkMenu)
    }

    render() {
        const {
            classes,
            store
        } = this.props

        const walletAddress = store.get('localWeb3Address')
        const showNetworkMenu = store.get('showNetworkMenu')
        const selectedNetwork = store.get('selectedNetwork')

        const isSignedIn = walletAddress && walletAddress.length
        const balance = store.get('wbtcBalance')

        // console.log(this.props, this.state, this.props.store.getState())

        return <Grid item xs={12} className={classes.navContainer}>
            <Container size='lg'>
              {<Grid  container alignItems='center'>
                <Grid item xs={12} sm={8}>
                    <Grid container alignItems='center'>
                          {<img className={classes.logo} src={RenLogo} />}
                          {/*<Typography className={classes.title}><b>WBTC</b> </Typography>
                        <Typography className={classes.title}><span className={classes.cafe}>Cafe</span></Typography>*/}
                          {/*<Typography variant='caption'> Bitcoin on Ethereum. <a href='javascript:;' onClick={() => { store.set('showAboutModal', true) }}>How it works</a></Typography>*/}
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Grid container justify='flex-end' alignItems='center'>
                        {/*<AssetChooserContainer />*/}
                            {/*<Button
                                variant="outlined"
                                className={classes.networkButton}
                                ref={this.anchorRef}
                                aria-controls={showNetworkMenu ? 'menu-list-grow' : undefined}
                                aria-haspopup="true"
                                onClick={this.toggleNeworkMenu.bind(this)}
                              >
                                <WifiIcon />&nbsp;{selectedNetwork}
                              </Button>
                              <Popper open={showNetworkMenu} anchorEl={this.anchorRef.current} role={undefined} transition disablePortal>
                                {({ TransitionProps, placement }) => (
                                  <Grow
                                    {...TransitionProps}
                                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                                  >
                                    <Paper>
                                      <ClickAwayListener onClickAway={this.toggleNeworkMenu.bind(this)}>
                                        <MenuList autoFocusItem={showNetworkMenu} id="menu-list-grow">
                                          <MenuItem onClick={() => { setNetwork.bind(this)('testnet') }}>Testnet</MenuItem>
                                          <MenuItem onClick={() => { setNetwork.bind(this)('mainnet') }}>Mainnet</MenuItem>
                                        </MenuList>
                                      </ClickAwayListener>
                                    </Paper>
                                  </Grow>
                                )}
                              </Popper>*/}

                              {/*<Button onClick={() => {
                                  store.set('showAboutModal', true)
                              }} size='small' className={classes.aboutButton}>
                                <span>How it works<span className={classes.hideMobile}></span></span>
                              </Button>*/}
                              {/*walletAddress && <div className={classes.faq}>
                                  <Typography variant='caption'>Balance: {balance} WBTC</Typography>
                              </div>*/}
                              {<Button onClick={() => {
                                  initLocalWeb3()
                              }} variant="outlined" size='large' className={classes.accountButton}>
                                {walletAddress ? (walletAddress.slice(0,7) + '...' + walletAddress.slice(walletAddress.length - 5)) : <span>Connect Wallet<span className={classes.hideMobile}></span></span>}
                              </Button>}

                    </Grid>
                </Grid>
              </Grid>}
            </Container>
        </Grid>
    }
}

export default withStyles(styles)(withStore(NavContainer))
