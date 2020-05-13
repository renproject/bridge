import React from 'react';
import theme from '../theme/theme'
import classNames from 'classnames'
import { withStyles } from '@material-ui/styles';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';

import { MINI_ICON_MAP } from '../utils/walletUtils'

const styles = () => ({
    amountField: {
        width: '100%',
        // marginBottom: theme.spacing(2)
    },
    endAdornment: {
        '& p': {
            color: '#000'
        }
    },
    item: {
        display: 'flex',
        fontSize: 14,
        alignItems: 'center',
        minWidth: 55,
        paddingLeft: theme.spacing(1),
        '& div': {
            display: 'flex',
            // fontSize: 14
        },
        justifyContent: 'flex-end'
    },
    select: {
        display: 'flex',
        '& div': {
            display: 'flex',
            // fontSize: 14
        },
        '& MuiInput-underline:before': {
            display: 'none'
        }
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: theme.spacing(0.75),
    },
})

class CurrencyInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: '',
            open: false
        }
        this.anchorEl = React.createRef();
    }

    handleOpen() {
        this.setState({
            open: true
        })
    }

    handleClose(event) {
        // console.log(event, event.target, event.target.value)
        const value = event.target.value
        if (value) {
            this.props.onCurrencyChange(value)
            this.setState({ currency: value })
        }
        this.setState({ open: false })
    }

    render() {
        const {
            classes,
            onCurrencyChange,
            onAmountChange,
            items
        } = this.props

        const {
            currency,
            open
        } = this.state

        // console.log(currency)

        const selected = currency || items[0]

        return <TextField
            id=""
            className={classes.amountField}
            placeholder='Convert Amount'
            margin="dense"
            variant="outlined"
            onChange={(event) => {
                if (onAmountChange) {
                    onAmountChange(Number(event.target.value))
                }
            }}
            type='number'
            InputProps={{
                endAdornment: items && items.length && items.length > 1 ? <InputAdornment position="end">
                      <Button ref={this.anchorEl} aria-controls="simple-menu" aria-haspopup="true" onClick={this.handleOpen.bind(this)}>
                          <img src={MINI_ICON_MAP[selected.toLowerCase()]} className={classes.icon} />
                          <span>{selected}</span>
                      </Button>
                      <Menu
                         id="simple-menu"
                         anchorEl={this.anchorEl.current}
                         keepMounted
                         open={open}
                         onClose={this.handleClose.bind(this)}
                       >
                         {items.map((i, index) => <MenuItem onClick={() => {
                           this.handleClose.bind(this)({
                              target: {
                                  value: i
                              }
                           })
                         }} key={index} value={i}>
                             <img src={MINI_ICON_MAP[i.toLowerCase()]} className={classes.icon} />
                             <span>{i}</span>
                         </MenuItem>)}

                       </Menu>
                        {/*<Select
                          className={classes.select}
                          variant='outlined'
                          value={currency || items[0]}
                          onChange={(event) => {
                              onCurrencyChange(event.target.value)
                              this.setState({ currency: event.target.value })
                          }}
                          inputProps={{
                              disableUnderline: true
                          }}
                        >
                        {items.map((i, index) => <MenuItem key={index} value={i}>
                            <img src={MINI_ICON_MAP[i.toLowerCase()]} className={classes.icon} />
                            <span>{i}</span>
                        </MenuItem>)}
                        </Select>*/}
                    </InputAdornment> : <InputAdornment className={classes.endAdornment} position="end">{<div className={classes.item}>
                        {<img src={MINI_ICON_MAP[items[0].toLowerCase()]} className={classes.icon} />}
                        <span>{items[0]}</span>
                    </div>}
                </InputAdornment>
            }}
            inputProps={{
                'aria-label': 'bare',
                disabled: this.props.disabled
            }}
          />
    }
}

export default withStyles(styles)(CurrencyInput);
