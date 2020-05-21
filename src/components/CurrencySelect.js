import React from 'react';
import theme from '../theme/theme'
import classNames from 'classnames'
import { withStyles } from '@material-ui/styles';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import { MINI_ICON_MAP, NAME_MAP } from '../utils/walletUtils'

const styles = () => ({
    amountField: {
        width: '100%',
    },
    endAdornment: {
        '& p': {
        }
    },
    item: {
        display: 'flex',
        fontSize: 14,
        alignItems: 'center',
        minWidth: 55,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        '& div': {
            display: 'flex',
            // fontSize: 14
        },
        justifyContent: 'flex-start'
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
        width: 32,
        height: 'auto',
        marginRight: 10,
    },
    button: {
        fontSize: 14,
        color: '#585861',
        display: 'flex',
        justifyContent: 'flex-start'
    },
    arrow: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        '& svg': {
            width: 22,
            height: 'auto',
            marginLeft: theme.spacing(0.75)
        }
    },
    balance: {
        fontSize: 12,
        marginTop: -2,
        color: '#585861'
    },
    menu: {

    }
})

class CurrencySelect extends React.Component {
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
            items,
            className,
            active
        } = this.props

        const {
            currency,
            open
        } = this.state

        const selected = active || items[0]

        return <div className={className || ''}>
            <Button fullWidth className={classes.button} ref={this.anchorEl} aria-controls="menu" aria-haspopup="true" onClick={this.handleOpen.bind(this)}>
                <img src={MINI_ICON_MAP[selected.toLowerCase()]} className={classes.icon} />
                <span>{selected}</span>
                <div className={classes.arrow}>
                  <ArrowDropDown />
                </div>
            </Button>
            <Menu
               id="menu"
               anchorEl={this.anchorEl.current}
               keepMounted
               className={classes.menu}
               open={open}
               onClose={this.handleClose.bind(this)}
             >
               {items.map((i, index) => {
                 const balance = this.props[`${i}Balance`]

                 return <MenuItem className={classes.item} onClick={() => {
                     this.handleClose.bind(this)({
                        target: {
                            value: i
                        }
                     })
                   }} key={index} value={i}>
                       <div><img src={MINI_ICON_MAP[i.toLowerCase()]} className={classes.icon} /></div>
                       <Grid container direction='column' alignItems='flex-start'>
                         <span>{i}</span>
                         <span className={classes.balance}>{balance ? `${balance} ${i}` : NAME_MAP[i.toLowerCase()]}</span>
                       </Grid>
                   </MenuItem>
                 })}
             </Menu>
          </div>
    }
}

export default withStyles(styles)(CurrencySelect);
