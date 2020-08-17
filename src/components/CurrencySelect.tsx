import React from "react";
import theme from "../theme/theme";
import { withStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";

import { MINI_ICON_MAP, NAME_MAP } from "../utils/walletUtils";

const styles = () => ({
  amountField: {
    width: "100%",
  },
  endAdornment: {
    "& p": {},
  },
  item: {
    display: "flex",
    fontSize: 14,
    alignItems: "center",
    minWidth: 55,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    "& div": {
      display: "flex",
    },
    justifyContent: "flex-start",
  },
  select: {
    display: "flex",
    "& div": {
      display: "flex",
    },
    "& MuiInput-underline:before": {
      display: "none",
    },
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  button: {
    fontSize: 14,
    color: "#585861",
    display: "flex",
    justifyContent: "flex-start",
  },
  arrow: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    "& svg": {
      width: 22,
      height: "auto",
      marginLeft: theme.spacing(0.75),
    },
  },
  balance: {
    fontSize: 12,
    marginTop: -2,
    color: "#585861",
  },
  menu: {},
});

type Balances = {
  [key in string]: string | any;
};

interface Props extends Balances {
  onCurrencyChange: (newCurrency: string) => void;
  items: Array<keyof typeof NAME_MAP>;
  className: string;
  classes: { [key in string]: string };
  active?: string;
  disabled?: boolean;
}

class CurrencySelect extends React.Component<Props> {
  anchorEl: React.RefObject<any>;
  state = {
    currency: "",
    open: false,
  };
  constructor(props: Props) {
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
    const { classes, items, className, active } = this.props;

    const { open } = this.state;

    const selected = active || items[0];

    return (
      <div className={className || ""}>
        <Button
          fullWidth
          className={classes.button}
          ref={this.anchorEl}
          aria-controls="menu"
          aria-haspopup="true"
          onClick={this.handleOpen.bind(this)}
        >
          <img
            src={MINI_ICON_MAP[selected.toLowerCase()]}
            alt={selected}
            className={classes.icon}
          />
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
            const balance = this.props[`${i}Balance`];

            return (
              <MenuItem
                className={classes.item}
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
                <div>
                  <img
                    src={MINI_ICON_MAP[i.toLowerCase()]}
                    alt={i}
                    className={classes.icon}
                  />
                </div>
                <Grid container direction="column" alignItems="flex-start">
                  <span>{i}</span>
                  <span className={classes.balance}>
                    {balance
                      ? `${balance} ${i}`
                      : NAME_MAP[i.toLowerCase() as keyof typeof NAME_MAP]}
                  </span>
                </Grid>
              </MenuItem>
            );
          })}
        </Menu>
      </div>
    );
  }
}

export default withStyles(styles)(CurrencySelect);
