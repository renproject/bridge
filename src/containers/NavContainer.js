import React from 'react';
import { withStore } from '@spyna/react-store'
import { withStyles } from '@material-ui/styles';
import theme from '../theme/theme'
import classNames from 'classnames'
import { initLocalWeb3 } from '../utils/walletUtils'

import RenLogo from '../assets/ren-logo-black.svg';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';


const styles = () => ({
    navContainer: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        minHeight: 52,
        [theme.breakpoints.down('sm')]: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
        }
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
      color: '#3F3F48',
      '& svg': {
        marginRight: theme.spacing(1)
        },
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            marginTop: theme.spacing(2)
      },
      display: 'inline-block',
      [theme.breakpoints.down('sm')]: {
          display: 'none'
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
    },
    disabled: {
        // pointerEvents: 'none',
        cursor: 'auto'
    },
    circle: {
        width: 8,
        height: 8,
        backgroundColor: '#3CBC98',
        borderRadius: 4,
        float: 'left',
        marginTop: 6.85,
        marginRight: 6
    },
    walletLabel: {
        marginRight: theme.spacing(1)
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

        return <Grid item xs={12} className={classes.navContainer}>
            <Container size='lg'>
              {<Grid  container alignItems='center'>
                <Grid item xs={12} sm={8}>
                    <Grid container alignItems='center'>
                          <img className={classes.logo} src={RenLogo} />
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Grid container justify='flex-end' alignItems='center'>
                        {<Button disableRipple={walletAddress.length}
                          color={''}
                          onClick={() => {
                              if (!walletAddress) {
                                  initLocalWeb3()
                              }
                          }} variant="outlined" className={classNames(classes.accountButton, walletAddress && classes.disabled)}>
                          {walletAddress ? <div>
                            <div className={classes.circle}></div>
                            <span>{(walletAddress.slice(0,7) + '...' + walletAddress.slice(walletAddress.length - 5))}</span>
                          </div> : <span>Connect Wallet<span className={classes.hideMobile}></span></span>}
                        </Button>}
                    </Grid>
                </Grid>
              </Grid>}
            </Container>
        </Grid>
    }
}

export default withStyles(styles)(withStore(NavContainer))
