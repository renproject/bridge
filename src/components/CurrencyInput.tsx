import React from "react";
import theme from "../theme/theme";
import { Styles, withStyles } from "@material-ui/styles";

import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";

import { MINI_ICON_MAP } from "../utils/walletUtils";

const styles: Styles<any, any> = () => ({
  amountField: {
    width: "100%",
  },
  endAdornment: {
    "& p": {
      color: "#000",
    },
  },
  item: {
    display: "flex",
    fontSize: 14,
    alignItems: "center",
    minWidth: 55,
    paddingLeft: theme.spacing(1),
    "& div": {
      display: "flex",
      // fontSize: 14
    },
    justifyContent: "flex-end",
  },
  select: {
    display: "flex",
    "& div": {
      display: "flex",
      // fontSize: 14
    },
    "& MuiInput-underline:before": {
      display: "none",
    },
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: theme.spacing(0.75),
  },
});

interface Props {
  onCurrencyChange: (newCurrency: string) => void;
  onAmountChange: (newAmount: number) => void;
  items: string[];
  classes: { [key in string]: string };
  disabled?: boolean;
}

class CurrencyInput extends React.Component<Props> {
  anchorEl: React.RefObject<any>;
  state = {
    currency: "",
    open: false,
  };
  constructor(props: any) {
    super(props);
    this.state = {
      currency: "",
      open: false,
    };
    this.anchorEl = React.createRef();
  }

  handleOpen() {
    this.setState({
      open: true,
    });
  }

  handleClose(event: any) {
    // console.log(event, event.target, event.target.value)
    const value = event.target.value;
    if (value) {
      this.props.onCurrencyChange(value);
      this.setState({ currency: value });
    }
    this.setState({ open: false });
  }

  render() {
    const { classes, onAmountChange, items } = this.props;

    const { currency, open } = this.state;

    const selected = currency || items[0];

    return (
      <TextField
        id=""
        className={classes.amountField}
        placeholder="Convert Amount"
        margin="dense"
        variant="outlined"
        onChange={(event) => {
          if (onAmountChange) {
            onAmountChange(Number(event.target.value));
          }
        }}
        type="number"
        InputProps={{
          endAdornment:
            items && items.length && items.length > 1 ? (
              <InputAdornment position="end">
                <Button
                  ref={this.anchorEl}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={this.handleOpen.bind(this)}
                >
                  <img
                    src={MINI_ICON_MAP[selected.toLowerCase()]}
                    alt={selected}
                    className={classes.icon}
                  />
                  <span>{selected}</span>
                </Button>
                <Menu
                  id="simple-menu"
                  anchorEl={this.anchorEl.current}
                  keepMounted
                  open={open}
                  onClose={this.handleClose.bind(this)}
                >
                  {items.map((i, index) => (
                    <MenuItem
                      onClick={() => {
                        this.handleClose.bind(this)({
                          target: {
                            value: i,
                          },
                        });
                      }}
                      key={index}
                      value={i}
                    >
                      <img
                        src={MINI_ICON_MAP[i.toLowerCase()]}
                        alt={i}
                        className={classes.icon}
                      />
                      <span>{i}</span>
                    </MenuItem>
                  ))}
                </Menu>
              </InputAdornment>
            ) : (
              <InputAdornment className={classes.endAdornment} position="end">
                {
                  <div className={classes.item}>
                    {
                      <img
                        src={MINI_ICON_MAP[items[0].toLowerCase()]}
                        alt={items[0]}
                        className={classes.icon}
                      />
                    }
                    <span>{items[0]}</span>
                  </div>
                }
              </InputAdornment>
            ),
        }}
        inputProps={{
          "aria-label": "bare",
          disabled: this.props.disabled,
        }}
      />
    );
  }
}

export default withStyles(styles)(CurrencyInput);
