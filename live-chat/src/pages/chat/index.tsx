import React, { useCallback, useEffect, useRef } from "react";
import { connect as ioConnect, Socket } from "socket.io-client";
import { MessagesBox, MessageTextArea, UserList } from "@/components";
import { useRouter } from "next/router";
import { Message, User } from "../../types";

interface ChatPageProps {
    disconnect: () => void;
    initialize: (socket: any) => void;
    connect: (userInfo: User) => void;
    updateUserlist: (updatedUserList: User[]) => void;
    addTypingUser: (typingUser: User) => void;
    removeTypingUser: (id: string) => void;
    roomId: string | null;
    ownUser: User | null;
    typingUsers: User[];
}

const ChatPage = ({
    roomId,
    ownUser,
    addTypingUser,
    connect,
    disconnect,
    initialize,
    removeTypingUser,
    updateUserlist,
    typingUsers
}: ChatPageProps) => {
    const router = useRouter();
    const socketREF = useRef<Socket | null>(null);
    const usersREF = useRef<User[]>([]);

    const receivedMessage = useCallback((message: Message) => {
        if(typeof window !== "undefined"){
            receivedMessage(message);
            document.querySelector("#messages")?.scrollTo(0, document?.querySelector("#messages")?.scrollHeight || 0);
        }
    }, []);
    
    useEffect(() => {
        require("dotenv").config();
        let url =
            process.env.NODE_ENV !== "production"
                ? "http://localhost:8000"
                : "https://termtime-live-chat.herokuapp.com";
        //if roomId or username is not set, then return to homepage and clear redux state
        if (!roomId || !ownUser?.username) {
            router.push("/");
            disconnect();
            return;
        }

        socketREF.current = ioConnect(url);
        initialize(socketREF);
        socketREF.current.on("own-id", (id) => {
            var userInfo = {
                username: ownUser.username,
                id: id,
                room: roomId,
            };

            connect(userInfo);
            socketREF.current?.emit("presentation", userInfo);
        });

        socketREF.current.on("userlist-update", (updatedUserList) => {
            updateUserlist(updatedUserList);
            usersREF.current = updatedUserList;
        });

        socketREF.current.on("msg", (message) => {
            receivedMessage(message);
        });

        socketREF.current.on("isTyping", (id) => {
            //search user in user array
            console.log(`${id} is typing...`);
            var typingUser = usersREF.current.find((obj) => obj.id === id);
            if (typingUser !== undefined) {
                addTypingUser(typingUser);
            }
        });

        socketREF.current.on("stoppedTyping", (id) => {
            console.log(`${id} stopped typing...`);
            //search user in user array
            var stoppedTypingUser = usersREF.current.find(
                (obj) => obj.id === id
            );
            if (stoppedTypingUser !== undefined) {
                removeTypingUser(id);
            }
        });
        return () => {
            socketREF.current?.emit("leave", roomId);
            socketREF.current?.close();
        };
    }, [addTypingUser, connect, disconnect, initialize, ownUser?.username, receivedMessage, removeTypingUser, roomId, router, updateUserlist]);

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
