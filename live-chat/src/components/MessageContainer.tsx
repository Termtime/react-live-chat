import React from "react";
import { Message, User } from "../types";

export interface MessageContainerProps {
    user: User;
    message: Message;
}

export const MessageContainer = ({ user, message }: MessageContainerProps) => {
    return (
        <div className="row message">
            <div className="col">
                <div className="row">
                    <small className="username">{user.username}</small>
                </div>
                <div className="row ">
                    <p className="wrap messageText">{message.body}</p>
                </div>
                <div className="row timeStamp">
                    <small>{message.time}</small>
                </div>
            </div>
        </div>
    );
};
