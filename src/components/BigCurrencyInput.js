import React from 'react';
import Numeral from 'numeral'
import NumberFormat from 'react-number-format'
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
    this.ref = React.createRef()
    this.input = null
  }

  componentDidMount() {
      const inputRef = this.props.inputRef
      if (this.props.inputRef) {
        this.ref = inputRef
      }

      if (this.input) {
          this.input.focus()
      }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   const nextData = {
  //       symbol: nextProps.symbol,
  //       value: nextProps.value,
  //   }
  //
  //   const currentData = {
  //       symbol: this.props.symbol,
  //       value: this.props.value
  //   }
  //
  //   return nextData !== currentData
  // }

  render() {
    const {
        classes,
        className,
        onChange,
        symbol,
        usdValue,
        value,
        inputRef,
        placeholder
    } = this.props

    const asset = symbol || ''
    const val = value ? String(value) : ''
    const ref = this.ref
    const change = onChange || (() => {})

    const chars = val.replace('.', '').replace(` ${symbol}`, '')

    let size = 'large'
    if (chars.length > 5 && chars.length <= 7) {
        size = 'medium'
    } else if (chars.length > 7 && chars.length <= 9) {
        size = 'small'
    } else if (chars.length > 9){
        size = 'smallest'
    }

    // console.log(value, val)

    return <div className={classNames(classes.container, classes[size])}>
        <NumberFormat value={val}
          ref={ref}
          thousandSeparator={true}
          allowLeadingZeros={true}
          allowNegative={false}
          suffix={' ' + symbol}
          onValueChange={change}
          getInputRef={(input) => {
              this.input = input
          }}
          className={classNames(classes.input, className)}
          placeholder={placeholder} />

        {<p className={usdValue ? classes.grayText : ''}>
            = {Numeral(usdValue).format('$0,0.00')}
          </p>}
    </div>
  }
}

export default withStyles(styles)(BigCurrencyInput);
