import React from 'react';
import { withStore } from '@spyna/react-store'
import { withStyles } from '@material-ui/styles';
import theme from '../theme/theme'
import classNames from 'classnames'
// import RenSDK from "@renproject/ren";
import { removeTx, initConvertFromEthereum } from '../utils/txUtils'
import { initLocalWeb3, resetWallet, setNetwork, MINI_ICON_MAP } from '../utils/walletUtils'
import ConversionStatus from '../components/ConversionStatus';
import ConversionActions from '../components/ConversionActions';
import ActionLink from '../components/ActionLink';


import Web3 from "web3";
import EthCrypto from 'eth-crypto'
import Box from '3box';
import Portis from '@portis/web3';
import Torus from "@toruslabs/torus-embed";

import RoundaboutIcon from '../assets/roundabout.svg';
import AccountIcon from '@material-ui/icons/AccountCircle';
import WifiIcon from '@material-ui/icons/Wifi';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import BTC from '../assets/btc.png'
import ETH from '../assets/eth.png'
import ZEC from '../assets/zec.jpg'
import DAI from '../assets/dai.png'
import USDC from '../assets/usdc.png'

const styles = () => ({
    container: {
        background: '#fff',
        border: '0.5px solid ' + theme.palette.divider,
        minHeight: 200,
        height: '100%'
    },
    titleWrapper: {
      paddingBottom: theme.spacing(2)
    },
    actionsCell: {
      minWidth: 150
    },
    emptyMessage: {
      display: 'flex',
      paddingTop: theme.spacing(8),
      justifyContent: 'center',
      height: '100%'
    }
})

class TransactionsTableContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
    }

    cancel() {

    }

    render() {
        const {
            classes,
            store
        } = this.props

        const transactions = store.get('convert.transactions')
        const localWeb3Address = store.get('localWeb3Address')
        const space = store.get('space')
        const spaceError = store.get('spaceError')

        return <div className={classes.container}>
          {/*<div className={classes.titleWrapper}>
            <Typography variant='subtitle1'><b>Conversions</b></Typography>
          </div>*/}
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell align="left">Transaction</TableCell>
                <TableCell>Status</TableCell>
                {/*<TableCell align="left">Date</TableCell>*/}
                <TableCell><div className={classes.actionsCell}></div></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localWeb3Address && space && transactions.map((tx, i) => {
                const destAsset = tx.destAsset.toUpperCase()
                const sourceAsset = tx.sourceAsset.toUpperCase()
                return <TableRow key={i}>
                  <TableCell align="left"><Typography variant='caption'>{tx.amount} {sourceAsset} → {destAsset}</Typography></TableCell>
                  <TableCell><Typography variant='caption'><ConversionStatus tx={tx} /></Typography></TableCell>
                  <TableCell>
                      <Grid container justify='flex-end'>
                        <ConversionActions tx={tx} />
                      </Grid>
                  </TableCell>
                </TableRow>
              })}
            </TableBody>
          </Table>
          {!localWeb3Address && <div className={classes.emptyMessage}>
              <Typography variant='caption'>Please <ActionLink onClick={initLocalWeb3}>connect wallet</ActionLink> to view transactions</Typography>
          </div>}
          {localWeb3Address && !space && <div className={classes.emptyMessage}>
              {spaceError ? <Typography variant='caption'>Connection to 3box failed. <ActionLink onClick={initLocalWeb3}>Retry</ActionLink></Typography> : <Typography variant='caption'>Loading transactions...</Typography>}
          </div>}
          {localWeb3Address && space && !transactions.length && <div className={classes.emptyMessage}>
              <Typography variant='caption'>No transactions</Typography>
          </div>}
        </div>
    }
}

export default withStyles(styles)(withStore(TransactionsTableContainer))
