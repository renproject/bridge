import React from "react";
import { withStore } from "@spyna/react-store";
import { withStyles, Styles } from "@material-ui/styles";
import classNames from "classnames";
import Numeral from "numeral";
import { initGJSDeposit, initGJSWithdraw } from "../utils/txUtils";
import {
  MINI_ICON_MAP,
  SYMBOL_MAP,
  NAME_MAP,
  abbreviateAddress,
} from "../utils/walletUtils";
import theme from "../theme/theme";

import DarkTooltip from "../components/DarkTooltip";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import BackArrow from "../assets/back-arrow.svg";
import WalletIcon from "../assets/wallet-icon.svg";

const styles: Styles<typeof theme, any> = (theme) => ({
  container: {
    background: "#fff",
    border: "1px solid " + theme.palette.divider,
    borderRadius: 4,
    boxShadow: "0px 1px 2px rgba(0, 27, 58, 0.05)",
    maxWidth: 400,
    width: "100%",
    margin: "0px auto " + theme.spacing(1) + "px",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
  },
  transferActionTabs: {
    margin: "0px auto",
    marginBottom: theme.spacing(1),
    "& div.MuiToggleButtonGroup-root": {
      width: "100%",
    },
    "& button": {
      width: "50%",
    },
  },
  depositAddressContainer: {},
  depositAddress: {
    width: "100%",
  },
  actionButtonContainer: {
    padding: theme.spacing(3),
    textAlign: "center",
    "& button": {
      "&.Mui-disabled": {},
      margin: "0px auto",
      fontSize: 12,
      minWidth: 175,
      padding: theme.spacing(1),
    },
  },
  amountField: {
    width: "100%",
  },
  depositButton: {},
  withdrawButton: {},
  actions: {
    paddingTop: theme.spacing(1),
  },
  transactionsContainer: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(0),
    marginTop: theme.spacing(2),
    borderTop: "1px solid #EBEBEB",
  },
  actionsContainer: {
    borderRadius: theme.shape.borderRadius,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  destChooser: {
    width: "100%",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    "& div.MuiToggleButtonGroup-root": {
      width: "100%",
    },
    "& button": {
      width: "50%",
    },
  },
  fees: {
    width: "100%",
    border: "1px solid " + theme.palette.divider,
    fontSize: 12,
    padding: theme.spacing(1),
    paddingBottom: 0,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    "& span": {
      marginBottom: theme.spacing(1),
    },
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: theme.spacing(0.75),
  },
  toggle: {
    "& button": {
      minHeight: "auto",
      border: "0px solid transparent",
      borderBottom: "1px solid " + theme.palette.divider,
      "&:first-child": {
        borderRight: "1px solid " + theme.palette.divider,
      },
      "&.Mui-selected": {
        borderBottom: "0px solid transparent",
      },
    },
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
  optionsContainer: {
    borderBottom: "none",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    "& :last-child": {
      borderBottom: "1px solid transparent",
    },
  },
  option: {
    borderBottom: "1px solid " + theme.palette.divider,
    minHeight: 60,
    fontSize: 14,
    "& img": {
      height: "auto",
      width: 24,
      marginRight: theme.spacing(1),
    },
    "& div": {
      display: "flex",
      alignItems: "center",
    },
  },
  totalOption: {
    minHeight: 60,
    fontSize: 16,
    color: "#3F3F48",
    "& img": {
      height: "auto",
      width: 24,
      marginRight: theme.spacing(1),
    },
    "& div": {
      display: "flex",
      alignItems: "center",
    },
  },
  totalContainer: {
    borderTop: "1px solid " + theme.palette.divider,
    borderBottom: "1px solid " + theme.palette.divider,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  headerText: {
    textAlign: "center",
    position: "relative",
    backgroundColor: "#fbfbfb",
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
    borderBottom: "1px solid " + theme.palette.divider,
    paddingBottom: theme.spacing(6),
    paddingTop: theme.spacing(1),
  },
  titleAmount: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(1),
  },
  navTitle: {
    color: "#87888C",
  },
  back: {
    position: "absolute",
    top: 16,
    left: 16,
    height: "auto",
    width: 18,
    cursor: "pointer",
    zIndex: 100000,
    "&:hover": {
      opacity: 0.75,
    },
  },
  large: {
    fontSize: 52,
  },
  medium: {
    fontSize: 42,
  },
  small: {
    fontSize: 32,
  },
  smallest: {
    fontSize: 22,
  },
  amountCell: {
    wordBreak: "break-word",
  },
  disclosure: {
    width: "100%",
    maxWidth: 370,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    boxShadow: "0px 1px 2px rgba(0, 27, 58, 0.05)",
    padding: theme.spacing(2),
    color: theme.palette.primary.main,
    border: "1px solid " + theme.palette.primary.main,
    fontSize: 12,
    borderRadius: 4,
    lineHeight: "17px",
    marginBottom: theme.spacing(3),
    "& a": {
      color: "inherit",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
  },
});

class ConfirmContainer extends React.Component<any> {
  constructor(props: any) {
    super(props);
    this.state = props.store.getState();
  }

  showDepositModal(tx: any) {
    const { store } = this.props;
    store.set("showDepositModal", true);
    store.set("depositModalTx", tx);
  }

  async gatherFeeData() {}

  async confirmDeposit() {
    const { store } = this.props;
    const confirmTx = store.get("confirmTx");

    initGJSDeposit(confirmTx);
  }

  async confirmWithdraw() {
    const { store } = this.props;
    const confirmTx = store.get("confirmTx");

    initGJSWithdraw(confirmTx);
  }

  render() {
    const { classes, store } = this.props;

    const selectedAsset = store.get("selectedAsset");
    const selectedDirection = store.get("convert.selectedDirection");
    const amount = store.get("convert.amount");
    const renVMFee = store.get("convert.renVMFee");
    const networkFee = store.get("convert.networkFee");
    const total = store.get("convert.conversionTotal");
    const canConvertTo = amount > 0.00010001;
    const confirmAction = store.get("confirmAction");
    const isDeposit = confirmAction === "deposit";
    const confirmTx = store.get("confirmTx");
    const sourceAsset = confirmTx.sourceAsset;
    const destAsset = confirmTx.destAsset;
    const usdValue = Number(store.get(`${selectedAsset}usd`) * amount).toFixed(
      2
    );
    const chars = String(amount).replace(".", "");

    let size = "large";
    if (chars.length > 5 && chars.length <= 7) {
      size = "medium";
    } else if (chars.length > 7 && chars.length <= 9) {
      size = "small";
    } else if (chars.length > 9) {
      size = "smallest";
    }

    return (
      <React.Fragment>
        <Grid container>
          <div className={classes.disclosure}>
            <Typography variant="inherit">
              RenVM is new technology and security audits don't completely
              eliminate risks. Please don’t supply assets you can’t afford
              to&nbsp;lose.
              <br />
              <br />
              <b>
                If you are new to RenBridge, please watch{" "}
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://www.youtube.com/watch?v=kO0672RJL-Q&feature=youtu.be"
                >
                  this
                </a>{" "}
                tutorial before&nbsp;continuing.
              </b>
            </Typography>
          </div>
        </Grid>
        <div className={classes.container}>
          <div className={classes.headerText}>
            <img
              className={classes.back}
              src={BackArrow}
              alt="Back"
              onClick={() => {
                store.set("confirmTx", null);
                store.set("confirmAction", "");
              }}
            />
            <Typography variant="overline" className={classes.navTitle}>
              {isDeposit ? "Minting" : "Releasing"}
            </Typography>

            <Typography
              variant="h4"
              className={classNames(classes.titleAmount, classes[size])}
            >
              {confirmTx.amount}{" "}
              {SYMBOL_MAP[sourceAsset as keyof typeof SYMBOL_MAP]}
            </Typography>

            <Typography variant="body1" className={classes.usdAmount}>
              = {Numeral(usdValue).format("$0,0.00")}
            </Typography>
          </div>
          <div className={classes.actionsContainer}>
            <Grid className={classes.actions}>
              <Grid container justify="center">
                <Grid item xs={12}>
                  <Grid
                    className={classes.optionsContainer}
                    container
                    direction="column"
                  >
                    <Grid container className={classes.option}>
                      <Grid item xs={6}>
                        {isDeposit ? "Minting" : "Releasing"}
                      </Grid>
                      <Grid item xs={6}>
                        <img
                          alt={sourceAsset}
                          src={MINI_ICON_MAP[sourceAsset]}
                        />
                        {SYMBOL_MAP[sourceAsset as keyof typeof SYMBOL_MAP]}
                      </Grid>
                    </Grid>
                    <Grid container className={classes.option}>
                      <Grid item xs={6}>
                        Destination
                      </Grid>
                      <Grid item xs={6}>
                        <DarkTooltip
                          placement="top"
                          title={confirmTx.destAddress}
                          arrow
                        >
                          <div>
                            <img src={WalletIcon} alt="Wallet" />
                            {abbreviateAddress(confirmTx.destAddress)}
                          </div>
                        </DarkTooltip>
                      </Grid>
                    </Grid>

                    <Grid container className={classes.option}>
                      <Grid item xs={6}>
                        RenVM Fee
                      </Grid>
                      <Grid item xs={6} className={classes.amountCell}>
                        <img
                          alt={sourceAsset}
                          src={MINI_ICON_MAP[sourceAsset]}
                        />
                        {renVMFee}{" "}
                        {SYMBOL_MAP[sourceAsset as keyof typeof SYMBOL_MAP]}
                      </Grid>
                    </Grid>

                    <Grid container className={classes.option}>
                      <Grid item xs={6}>
                        {NAME_MAP[selectedAsset as keyof typeof NAME_MAP]}{" "}
                        Network Fee
                      </Grid>
                      <Grid item xs={6} className={classes.amountCell}>
                        <img
                          alt={selectedAsset}
                          src={MINI_ICON_MAP[selectedAsset]}
                        />
                        {networkFee}{" "}
                        {SYMBOL_MAP[selectedAsset as keyof typeof SYMBOL_MAP]}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <div className={classes.totalContainer}>
                <Grid container className={classNames(classes.totalOption)}>
                  <Grid item xs={6}>
                    You will receive
                  </Grid>
                  <Grid item xs={6} className={classes.amountCell}>
                    <img alt={destAsset} src={MINI_ICON_MAP[destAsset]} />
                    {total} {SYMBOL_MAP[destAsset as keyof typeof SYMBOL_MAP]}
                  </Grid>
                </Grid>
              </div>

              <Grid
                container
                justify="center"
                className={classes.actionButtonContainer}
              >
                {selectedDirection === 0 && (
                  <Grid item xs={12}>
                    <Button
                      disabled={!canConvertTo}
                      variant={"contained"}
                      color="primary"
                      size="large"
                      disableRipple
                      fullWidth
                      className={classNames(
                        classes.margin,
                        classes.actionButton
                      )}
                      onClick={this.confirmDeposit.bind(this)}
                    >
                      Confirm
                    </Button>
                  </Grid>
                )}
                {selectedDirection === 1 && (
                  <Grid item xs={12}>
                    <Button
                      disabled={false}
                      variant={"contained"}
                      color="primary"
                      size="large"
                      disableRipple
                      fullWidth
                      className={classNames(
                        classes.margin,
                        classes.actionButton
                      )}
                      onClick={this.confirmWithdraw.bind(this)}
                    >
                      Confirm
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withStore(ConfirmContainer));
