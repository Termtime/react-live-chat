import React, { useState, useEffect, useRef } from "react";
import "./css/App.css";
import io from "socket.io-client";
import { MessagesBox } from "./containers/MessagesBox";
import { MessageTextArea } from "./containers/MessageTextArea";
import { UserList } from "./containers/UserList";
import { useHistory } from "react-router-dom";
export const App = (props) => {
    const [usersTyping, setUsersTyping] = useState([]);
    const history = useHistory();
    const socketREF = useRef();
    const usersREF = useRef();

    useEffect(() => {
        require("dotenv").config();
        let url =
            process.env.NODE_ENV !== "production"
                ? "http://localhost:8000"
                : "https://termtime-live-chat.herokuapp.com";
        console.log(url);
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
            console.log("user list has been updated", usersREF.current);
        });

        socketREF.current.on("msg", (message) => {
            receivedMessage(message);
        });

        socketREF.current.on("isTyping", (id) => {
            //search user in user array
            console.log("someones typing");
            console.log(usersREF.current);
            console.log(id);
            var typingUser = usersREF.current.find((obj) => obj.id === id);
            if (typingUser === undefined) {
                console.log("undefined user found typing, almost crashed");
            } else {
                setUsersTyping([...usersTyping, typingUser]);
            }
        });

        socketREF.current.on("stoppedTyping", (id) => {
            //search user in user array
            var stoppedTypingUser = usersREF.current.find(
                (obj) => obj.id === id
            );
            if (stoppedTypingUser === undefined) {
                console.log(
                    "undefined user found to have stopped typing, almost crashed"
                );
            } else {
                setUsersTyping(usersTyping.filter((user) => user.id !== id));
            }
        });
        return () => {
            socketREF.current.close();
            props.disconnect();
        };
    }, []);

    function receivedMessage(message) {
        props.receivedMessage(message);
        document
            .querySelector("#messages")
            .scrollTo(0, document.querySelector("#messages").scrollHeight);
    }

    return (
        <div className="flex-container col App ">
            <div id="app">
                <div className="row">
                    <MessagesBox />
                    <UserList />
                </div>

                <div id="typingStatus">
                    {usersTyping.map((user, i) => {
                        return (
                            <small key={`${user.id}-typing`}>
                                {user.username} is typing...
                            </small>
                        );
                    })}
                </div>
                <MessageTextArea />
            </div>
        </div>
    );
};
