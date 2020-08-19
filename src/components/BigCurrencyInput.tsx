import React from "react";
import Numeral from "numeral";
import NumberFormat from "react-number-format";
import classNames from "classnames";
import { Styles, withStyles } from "@material-ui/styles";

const styles: Styles<any, any> = () => ({
  container: {
    width: "100%",
    textAlign: "center",
    "& input": {
      fontFamily: "inherit",
      color: "#3F3F48",
    },
  },
  large: {
    "& input": {
      fontSize: 52,
    },
  },
  medium: {
    "& input": {
      fontSize: 42,
    },
  },
  small: {
    "& input": {
      fontSize: 32,
    },
  },
  smallest: {
    "& input": {
      fontSize: 22,
    },
  },
  input: {
    fontSize: 52,
    width: "100%",
    outline: "none",
    textAlign: "center",
    border: "0px solid transparent",
  },
  grayText: {
    color: "#D0D2D9",
  },
});

class BigCurrencyInput extends React.PureComponent<any> {
  ref: React.RefObject<any>;
  input: any;

  constructor(props: any) {
    super(props);
    this.ref = React.createRef();
    this.input = null;
  }

  componentDidMount() {
    const inputRef = this.props.inputRef;
    if (this.props.inputRef) {
      this.ref = inputRef;
    }

    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const {
      classes,
      className,
      onChange,
      symbol,
      usdValue,
      value,
      placeholder,
    } = this.props;

    const val = value ? String(value) : "";
    const ref = this.ref;
    const change = onChange || (() => {});

    const chars = val.replace(".", "").replace(` ${symbol}`, "");

    let size = "large";
    if (chars.length > 5 && chars.length <= 7) {
      size = "medium";
    } else if (chars.length > 7 && chars.length <= 9) {
      size = "small";
    } else if (chars.length > 9) {
      size = "smallest";
    }

    return (
      <div className={classNames(classes.container, classes[size])}>
        <NumberFormat
          value={val}
          ref={ref}
          thousandSeparator={true}
          allowLeadingZeros={true}
          allowNegative={false}
          suffix={" " + symbol}
          onValueChange={change}
          getInputRef={(input: any) => {
            this.input = input;
          }}
          className={classNames(classes.input, className)}
          placeholder={placeholder}
        />

        {
          <p className={usdValue ? classes.grayText : ""}>
            = {Numeral(usdValue).format("$0,0.00")}
          </p>
        }
      </div>
    );
  }
}

export default withStyles(styles)(BigCurrencyInput);
