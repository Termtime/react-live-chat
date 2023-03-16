import React from "react";
import { Message } from "../types";

export interface OwnMessageContainerProps {
    message: Message;
}

export const OwnMessageContainer = ({ message }: OwnMessageContainerProps) => {
    return (
        <div className="row ownMessage">
            <div className="col">
                <div className="row">
                    <p className="wrap messageText">{message.body}</p>
                </div>
                <div className="row timeStamp">
                    <small>{message.time}</small>
                </div>
            </div>
        </div>
    );
};
