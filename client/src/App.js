import React, { useEffect, useRef } from "react";
import "./css/App.css";
import io from "socket.io-client";
import { MessagesBox } from "./containers/MessagesBox";
import { MessageTextArea } from "./containers/MessageTextArea";
import { UserList } from "./containers/UserList";
import { useHistory } from "react-router-dom";
export const App = (props) => {
    const history = useHistory();
    const socketREF = useRef();
    const usersREF = useRef();

    useEffect(() => {
        require("dotenv").config();
        let url =
            process.env.NODE_ENV !== "production"
                ? "http://localhost:8000"
                : "https://termtime-live-chat.herokuapp.com";
        //if roomId or username is not set, then return to homepage and clear redux state
        if (!props.roomId || !props.ownUser.username) {
            history.push("/");
            props.disconnect();
            return;
        }

        socketREF.current = io.connect(url);
        props.initialize(socketREF);
        socketREF.current.on("own-id", (id) => {
            var userInfo = {
                username: props.ownUser.username,
                id: id,
                room: props.roomId,
            };

            props.connect(userInfo);
            socketREF.current.emit("presentation", userInfo);
        });

        socketREF.current.on("userlist-update", (updatedUserList) => {
            props.updateUserlist(updatedUserList);
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
                props.addTypingUser(typingUser);
            }
        });

        socketREF.current.on("stoppedTyping", (id) => {
            console.log(`${id} stopped typing...`);
            //search user in user array
            var stoppedTypingUser = usersREF.current.find(
                (obj) => obj.id === id
            );
            if (stoppedTypingUser !== undefined) {
                props.removeTypingUser(id);
            }
        });
        return () => {
            socketREF.current.emit("leave", props.roomId);
            socketREF.current.close();
        };
    }, []);

    const renderTypingUsers = () => {
        let string = "";
        if (props.typingUsers.length === 1) {
            string =
                props.typingUsers.map((user) => user.username) +
                " is typing...";
        } else if (props.typingUsers.length > 1) {
            let usersMinusLast = [
                ...props.typingUsers.map((user) => user.username),
            ];
            usersMinusLast.pop();
            console.log(usersMinusLast);
            string =
                usersMinusLast.join(",") +
                " and " +
                props.typingUsers[usersMinusLast.length].username +
                " are typing...";
        } else if (props.typingUsers.length > 5) {
            string = "Multiple people are typing...";
        } else {
            string = <div>&nbsp;</div>;
        }
        return string;
    };
    const receivedMessage = (message) => {
        props.receivedMessage(message);
        document
            .querySelector("#messages")
            .scrollTo(0, document.querySelector("#messages").scrollHeight);
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
