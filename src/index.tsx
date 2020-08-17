import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

window.onload = function () {
  // hide 3box iframe
  Array.from(document.getElementsByTagName("iframe")).map((iframe) => {
    if (iframe.src && iframe.src.indexOf("3box") > -1) {
      iframe.style.display = "none";
    } else if (iframe.src && iframe.src.indexOf("portis") > -1) {
      iframe.remove();
    }
  });
};

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
