import React from "react";
import {Message} from "../types";
import Color from "color";

export interface OwnMessageContainerProps {
  message: Message;
}

export const OwnMessageContainer = ({message}: OwnMessageContainerProps) => {
  const messageBackgroundColor = message.user.color || "#31287e";
  const messageColor = Color(messageBackgroundColor).isLight()
    ? "black"
    : "white";

  // use a slighly different color for the timestamp
  const timestampColor = Color(messageBackgroundColor).isLight()
    ? "#555"
    : "#ccc";

  return (
    <div
      className="row ownMessage"
      style={{backgroundColor: message.user.color}}
    >
      <div className="col">
        <div className="row">
          <p className="wrap messageText" style={{color: messageColor}}>
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
