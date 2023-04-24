import React from "react";
import {Message, User} from "../types";
import Color from "color";

export interface MessageContainerProps {
  message: Message;
}

export const MessageContainer = ({message}: MessageContainerProps) => {
  const messageBackgroundColor = message.user.color || "#31287e";
  const foregroundColor = Color(messageBackgroundColor).isLight()
    ? "black"
    : "white";

  // use a contrasting color for the timestamp
  const timestampColor = Color(messageBackgroundColor).isLight()
    ? "#555"
    : "#ccc";

  return (
    <div className="row message" style={{backgroundColor: message.user.color}}>
      <div className="col">
        <div className="row">
          <small className="username" style={{color: foregroundColor}}>
            {message.user.username}
          </small>
        </div>
        <div className="row">
          <p className="wrap messageText" style={{color: foregroundColor}}>
            {message.body}
          </p>
        </div>
        <div className="row timeStamp" style={{color: timestampColor}}>
          <small>{message.time}</small>
        </div>
      </div>
    </div>
  );
};
