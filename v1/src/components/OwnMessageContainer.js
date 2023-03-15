import React from "react";

export const OwnMessageContainer = (props) => {
    return (
        <div className="row ownMessage">
            <div className="col">
                <div className="row">
                    <p className="wrap messageText">{props.message.body}</p>
                </div>
                <div className="row timeStamp">
                    <small>{props.message.time}</small>
                </div>
            </div>
        </div>
    );
};
