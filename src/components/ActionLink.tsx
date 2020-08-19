import React from "react";
import classNames from "classnames";
import { withStyles } from "@material-ui/styles";

const styles = () => ({
  link: {
    fontSize: 12,
    textDecoration: "underline",
    cursor: "pointer",
    color: "#006FE8",
    "&:hover": {
      color: "#006FE8",
    },
  },
});

interface Props {
  className?: string;
  classes: { [key in string]: string };
  onClick: any;
}

const ActionLink: React.FC<Props> = function (props) {
  const { children, classes, className } = props;

  return (
    <a className={classNames(classes.link, className)} {...props}>
      {children}
    </a>
  );
};

export default withStyles(styles)(ActionLink);
