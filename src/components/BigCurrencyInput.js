import React from 'react';
import Numeral from 'numeral'
import NumericInput from 'react-numeric-input'
import theme from '../theme/theme'
import classNames from 'classnames'
import { withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

const styles = () => ({
    container: {
        width: '100%',
        textAlign: 'center',
        // fontWeight: 'bold'
    },
    input: {
        fontSize: 52,
        width: '100%',
        outline: 'none',
        textAlign: 'center',
        border: '0px solid transparent'
        // textDecoration: 'underline',
        // cursor: 'pointer',
    },
    grayText: {
        color: '#D0D2D9'
    }
})



const BigCurrencyInput = function(props) {
    const {
        children,
        classes,
        className,
        onChange,
        symbol,
        usdValue,
        inputRef
    } = props

    const change = onChange || (() => {})
    const asset = symbol || ''

    function format(n = '') {
        console.log(n)
        return n + ' ' + asset
    }

    return <div className={classes.container}>
      <NumericInput
        ref={inputRef}
        style={false}
        className={classNames(classes.input, className)}
        format={format}
        {...props}
      />

    {<p className={usdValue ? classes.grayText : ''}>
        = {Numeral(usdValue).format('$0,0.00')}
      </p>}
    </div>
}

export default withStyles(styles)(BigCurrencyInput);
