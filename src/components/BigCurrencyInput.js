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
    },
    grayText: {
        color: '#D0D2D9'
    }
})



class BigCurrencyInput extends React.PureComponent {
  constructor(props) {
    super(props)
    this.defaultRef = React.createRef()
  }

  shouldComponentUpdate(nextProps, nextState) {
    const nextData = {
        symbol: nextProps.symbol,
        value: nextProps.value,
    }

    const currentData = {
        symbol: this.props.symbol,
        value: this.props.value
    }

    return nextData !== currentData
  }

  render() {
    const {
        classes,
        className,
        onChange,
        symbol,
        usdValue,
        value,
        inputRef
    } = this.props

    const asset = symbol || ''
    const val = value ? String(value) : ''
    const ref = inputRef || this.defaultRef
    const change = onChange || (() => {})

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

    return <div className={classNames(classes.container, classes[size])}>
      <NumericInput
        ref={ref}
        style={false}
        value={val}
        className={classNames(classes.input, className)}
        format={format}
        {...this.props}
      />

    {<p className={usdValue ? classes.grayText : ''}>
        = {Numeral(usdValue).format('$0,0.00')}
      </p>}
    </div>
  }
}

export default withStyles(styles)(BigCurrencyInput);
