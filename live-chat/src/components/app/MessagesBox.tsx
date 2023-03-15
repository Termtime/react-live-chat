import React from "react";
import { useHistory } from "react-router-dom";
import { MessageContainer } from "./MessageContainer";
import { OwnMessageContainer } from "./OwnMessageContainer";
import exit from "../resources/img/exit.svg";
import Image from "next/image";
import { Message, User } from "../../types";

interface MessagesBoxProps {
    messages: Message[];
    roomId: string;
    users: User[];
    ownUser: User;
}

export const MessagesBoxBase = ({
    roomId,
    users,
    ownUser,
    messages,
}: MessagesBoxProps) => {
    const history = useHistory();
    function disconnect() {
        history.push("/");
    }

    return (
        <div className="col messageBox-container">
            <div className="row messageBox-container-header">
                <div className="col">
                    <p>Room: {roomId} </p>
                </div>
                <div className="col text-right">
                    <div className="row right text-right">
                        <p style={{ lineHeight: "3vh" }}>
                            {users.length}{" "}
                            {`${users.length === 1 ? "user" : "users"}`} online
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
                        if (msg.user.id === ownUser.id) {
                            return (
                                <OwnMessageContainer key={i} message={msg} />
                            );
                        } else {
                            return (
                                <MessageContainer
                                    key={i}
                                    message={msg}
                                    user={msg.user}
                                />
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};
