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
        '& input': {
          fontFamily: 'inherit',
          color: '#3F3F48'
        },
    },
    large: {
      '& input': {
        fontSize: 52,
      }
    },
    medium: {
      '& input': {
        fontSize: 42,
      }
    },
    small: {
      '& input': {
        fontSize: 32,
      }
    },
    smallest: {
      '& input': {
        fontSize: 22,
      }
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
        value,
        inputRef
    } = props

    const change = onChange || (() => {})
    const asset = symbol || ''
    const val = value ? String(value) : ''

    function format(n = '') {
        console.log(n)
        return n + ' ' + asset
    }

    const chars = val.replace('.', '')

    let size = 'large'
    if (chars.length > 5 && chars.length <= 7) {
        size = 'medium'
    } else if (chars.length > 7 && chars.length <= 9) {
        size = 'small'
    } else if (chars.length > 9){
        size = 'smallest'
    }

    console.log(size)

    return <div className={classNames(classes.container, classes[size])}>
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
