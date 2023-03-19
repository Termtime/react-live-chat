import React, { useCallback, useEffect, useRef } from "react";
import { MessagesBox, MessageTextArea, UserList } from "@/components";
import { useRouter } from "next/router";
import { Message, RoomHandshake, User } from "../../types";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/toolkit/store";
import {
    isTyping,
    joinRoom,
    leaveRoom,
    stoppedTyping,
    updateUserList,
} from "../../redux/toolkit/features/chatSlice";

const ChatPage = () => {
    const router = useRouter();
    const { socket, roomId, ownUser, users, typingUsers } = useSelector(
        (state: RootState) => state.chat
    );

    const receivedMessage = useCallback((message: Message) => {
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
            socket.on("own-id", (userId: string) => {
                var handshakeInfo: RoomHandshake = {
                    username: ownUser!.username,
                    id: userId,
                    roomId: roomId!,
                };

                joinRoom(handshakeInfo);
            });

            socket.on("userlist-update", (updatedUserList: User[]) => {
                updateUserList(updatedUserList);
            });

            socket.on("msg", (message: Message) => {
                receivedMessage(message);
            });

            socket.on("isTyping", (userId: string) => {
                // search user in user array
                console.log(`${userId} is typing...`);
                const typingUser = users.find((obj) => obj.id === userId);
                if (typingUser !== undefined) {
                    isTyping(typingUser);
                }
            });

            socket.on("stoppedTyping", (userId: string) => {
                console.log(`${userId} stopped typing...`);
                //search user in user array
                const stoppedTypingUser = users.find(
                    (obj) => obj.id === userId
                );
                if (stoppedTypingUser !== undefined) {
                    stoppedTyping(stoppedTypingUser);
                }
            });
        }

        return () => {
            if (socket) {
                socket?.emit("leave", roomId);
                socket.close();
            }
        };
    }, [socket, users, receivedMessage, roomId]);

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
