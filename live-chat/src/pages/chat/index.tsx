import React, { useCallback, useEffect, useRef } from "react";
import { MessagesBox, MessageTextArea, UserList } from "@/components";
import { useRouter } from "next/router";
import { Message, RoomHandshake, User } from "../../types";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/toolkit/store";
import { UserEncryptedMessage } from "../../types/global";
import {
    userStartedTyping,
    joinRoom,
    leaveRoom,
    userStoppedTyping,
    userLeft,
    userJoined,
    receivedMessage,
} from "../../redux/toolkit/features/chatSlice";

const ChatPage = () => {
    const router = useRouter();
    const {
        socket,
        roomId,
        user: ownUser,
        users,
        typingUsers,
    } = useSelector((state: RootState) => state.chat);

    const onReceivedMessage = useCallback((message: UserEncryptedMessage) => {
        if (typeof window !== "undefined") {
            receivedMessage(message);
            document
                .querySelector("#messages")
                ?.scrollTo(
                    0,
                    document?.querySelector("#messages")?.scrollHeight || 0
                );
        }
    }, []);

    useEffect(() => {
        //if roomId or username is not set, then return to homepage and clear redux state
        if (!roomId || !ownUser) {
            router.push("/");
            leaveRoom();
            return;
        }
    }, [ownUser, roomId, router]);

    useEffect(() => {
        if (socket) {
            socket.on("userJoined", (user: User) => userJoined(user));

            socket.on("userLeft", (user: User) => userLeft(user));

            socket.on("message", (message: UserEncryptedMessage) =>
                onReceivedMessage(message)
            );

            socket.on("userStartedTyping", (user: User) =>
                userStartedTyping(user)
            );

            socket.on("userStoppedTyping", (user: User) =>
                userStoppedTyping(user)
            );
        }

        return () => {
            if (socket && roomId) {
                socket?.emit("leaveRoom", roomId);
                socket.close();
                leaveRoom();
            }
        };
    }, [socket, users, roomId, ownUser, onReceivedMessage]);

    const renderTypingUsers = () => {
        let string: string | React.ReactElement = "";
        if (typingUsers.length === 1) {
            string = typingUsers.map((user) => user.username) + " is typing...";
        } else if (typingUsers.length > 1) {
            let usersMinusLast = [...typingUsers.map((user) => user.username)];
            usersMinusLast.pop();
            console.log(usersMinusLast);
            string =
                usersMinusLast.join(",") +
                " and " +
                typingUsers[usersMinusLast.length].username +
                " are typing...";
        } else if (typingUsers.length > 5) {
            string = "Multiple people are typing...";
        } else {
            string = <div>&nbsp;</div>;
        }
        return string;
    };

    return (
        <div className="flex-container col App ">
            <div id="app">
                <div className="row">
                    <MessagesBox />
                    <UserList />
                </div>

                <div id="typingStatus">
                    <small key="users-typing" className="text-white">
                        {renderTypingUsers()}
                    </small>
                </div>
                <MessageTextArea />
            </div>
        </div>
    );
};

export default ChatPage;
