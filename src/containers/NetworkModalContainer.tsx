import React from "react";
import { withStore } from "@spyna/react-store";
import { Styles, withStyles } from "@material-ui/styles";
import theme from "../theme/theme";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

const styles: Styles<typeof theme, any> = (theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      overflowY: "scroll",
      overflowX: "hidden",
      alignItems: "flex-start",
    },
  },
  modalContent: {
    backgroundColor: "#fff",
    width: 360,
    maxWidth: "100%",
    padding: theme.spacing(2),
  },
  title: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  titleContainer: {
    marginBottom: theme.spacing(3),
  },
  content: {
    fontSize: 14,
    width: "100%",
  },
});

class NetworkModalContainer extends React.Component<any> {
  constructor(props: any) {
    super(props);
    this.state = props.store.getState();
  }

  render() {
    const { classes, store } = this.props;

    const showNetworkModal = store.get("showNetworkModal");
    const selectedNetwork = store.get("selectedNetwork");

    return (
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={showNetworkModal}
        onClose={() => {
          store.set("showNetworkModal", false);
        }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={showNetworkModal}>
          <Grid container className={classes.modalContent}>
            <Typography variant="subtitle1" className={classes.title}>
              Switch Network
            </Typography>
            <Typography variant="body1" className={classes.content}>
              Please connect wallet to the{" "}
              {selectedNetwork === "testnet" ? "kovan" : "mainnet"} network.
            </Typography>
          </Grid>
        </Fade>
      </Modal>
    );
  }
}

export default withStyles(styles)(withStore(NetworkModalContainer));
