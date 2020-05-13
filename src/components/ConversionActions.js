import React from 'react';
import theme from '../theme/theme'
import { withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import { removeTx, initConvertFromEthereum } from '../utils/txUtils'
import { getStore } from '../services/storeService'

const styles = () => ({
    viewLink: {
        fontSize: 12,
        marginRight: theme.spacing(1),
        textDecoration: 'underline',
        cursor: 'pointer',
    }
})

const ConversionActions = function(props) {
    const {
        tx,
        classes
    } = props

    const store = getStore()
    const direction = tx.destNetwork === 'ethereum' ? 'in' : 'out'

    return <React.Fragment>
      <div>
        {tx.txHash ? <a className={classes.viewLink} target='_blank' href={'https://' + (tx.destNetworkVersion === 'testnet' ? 'kovan.' : '') + 'etherscan.io/tx/'+tx.txHash}>View Transaction</a> : null}

        {tx.awaiting === 'btc-init' && !tx.error && <React.Fragment>
            <a className={classes.viewLink} onClick={() => {
                // view modal
                store.set('showGatewayModal', true)
                store.set('gatewayModalTx', tx)
            }}>View Gateway Address</a>
            <a className={classes.viewLink} onClick={() => {
                // TODO: are you sure modal
                removeTx(tx)
            }}>Cancel</a>
        </React.Fragment>}

        {tx.awaiting === 'btc-settle' && tx.btcTxHash && <a className={classes.viewLink} target='_blank' href={`https://live.blockcypher.com/btc${tx.destNetworkVersion === 'testnet' ? '-testnet' : ''}/tx/${tx.btcTxHash}`}>View Transaction</a>}

        {tx.error && tx.awaiting === 'eth-settle' && <React.Fragment>
            <a className={classes.viewLink} onClick={() => {
                initConvertFromEthereum(tx)
            }}>Submit</a>
            {direction === 'out' && <a className={classes.viewLink} onClick={() => {
                removeTx(tx)
            }}>Cancel</a>}
        </React.Fragment>}

        {!tx.awaiting && !tx.error && <a className={classes.viewLink} onClick={() => {
            removeTx(tx)
        }}>Clear</a>}
      </div>
    </React.Fragment>
}

export default withStyles(styles)(ConversionActions);
