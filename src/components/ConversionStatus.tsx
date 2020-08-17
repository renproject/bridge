import React from "react";
import { withStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";

const styles = () => ({});

const ConversionStatus: React.FC<any> = function (props) {
  const { tx } = props;

  return (
    <React.Fragment>
      {tx.destNetwork === "ethereum" ? (
        <Typography variant="caption">
          {tx.awaiting === "btc-init" ? (
            <span>{`Waiting for BTC to be sent`}</span>
          ) : null}
          {tx.awaiting === "btc-settle" ? (
            <span>
              {`BTC transaction confirming (${
                tx.btcConfirmations
              }/${"2"} complete)`}
            </span>
          ) : null}
          {tx.awaiting === "ren-settle" ? (
            <span>{`Submitting to RenVM`}</span>
          ) : null}
          {tx.awaiting === "eth-settle" ? (
            <span>
              {tx.error ? `Submit to Ethereum` : `Submitting to Ethereum`}
            </span>
          ) : null}
          {!tx.awaiting ? <span>{`Complete`}</span> : null}
        </Typography>
      ) : (
        <Typography variant="caption">
          {tx.awaiting === "eth-settle" ? (
            <span>
              {tx.error ? `Submit to Ethereum` : `Submitting to Ethereum`}
            </span>
          ) : null}
          {tx.awaiting === "ren-settle" ? (
            <span>{`Submitting to RenVM`}</span>
          ) : null}
          {!tx.awaiting ? <span>{`Complete`}</span> : null}
        </Typography>
      )}
    </React.Fragment>
  );
};

export default withStyles(styles)(ConversionStatus);
