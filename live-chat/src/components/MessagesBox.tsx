import React from "react";
import { useRouter } from "next/router";
import { MessageContainer } from "./MessageContainer";
import { OwnMessageContainer } from "./OwnMessageContainer";
import exit from "../img/exit.svg";
import Image from "next/image";
import { Message, User } from "../types";
import { MessagesBoxConnection } from "../redux/connections/MessagesBox";

interface MessagesBoxProps {
    messages: Message[];
    roomId: string | null;
    users: User[];
    ownUser: User | null;
}

const MessagesBoxBase = ({
    roomId,
    users,
    ownUser,
    messages,
}: MessagesBoxProps) => {
    const router = useRouter();
    function disconnect() {
        router.push("/");
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
                        if (msg.user.id === ownUser?.id) {
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

export const MessagesBox = MessagesBoxConnection(MessagesBoxBase);
