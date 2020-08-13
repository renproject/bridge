import React from "react";

import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/styles";

const DarkTooltip = withStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
  },
}))(Tooltip);

export default DarkTooltip;
