import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "jquery/dist/jquery";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import { App } from "./containers/App";
import { HomePage } from "./containers/HomePage";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import { createStore } from "redux";
import { liveChat } from "./reducers";
import { Provider } from "react-redux";

const store = createStore(liveChat);

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <Switch>
                    <Route exact path="/" component={HomePage}></Route>
                    <Route exact path="/room" component={App}></Route>
                </Switch>
            </Provider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
