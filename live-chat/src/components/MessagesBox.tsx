import React from "react";
import {useRouter} from "next/router";
import {MessageContainer} from "./MessageContainer";
import {OwnMessageContainer} from "./OwnMessageContainer";
import exit from "@/../public/resources/img/exit.svg";
import Image from "next/image";
import {useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../redux/toolkit/store";
import {leaveRoom} from "../redux/toolkit/features/chatSlice";

export const MessagesBox = () => {
  const router = useRouter();
  const {
    user: ownUser,
    messages,
    roomId,
    users,
  } = useSelector((state: RootState) => state.chat);
  const dispatch = useAppDispatch();

  function disconnect() {
    router.push("/");
    dispatch(leaveRoom());
  }

  return (
    <div className="col messageBox-container">
      <div className="row messageBox-container-header">
        <div className="col">
          <p>Room: {roomId} </p>
        </div>
        <div className="col text-right">
          <div className="row right text-right">
            <p style={{lineHeight: "3vh"}}>
              {users.length} {`${users.length === 1 ? "user" : "users"}`} online
            </p>
            <Image
              alt="exit-button"
              id="exit-btn"
              src={exit}
              onClick={disconnect}
            />
          </div>
        </div>
      </div>
      <div id="messages" className="row ">
        <div className="col">
          {messages.map((msg, i) => {
            if (msg.user.id === ownUser?.id) {
              return <OwnMessageContainer key={i} message={msg} />;
            } else {
              return <MessageContainer key={i} message={msg} user={msg.user} />;
            }
          })}
        </div>
      </div>
    </div>
  );
};
