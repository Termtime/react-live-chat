import React, {useCallback, useEffect, useRef} from "react";
import {MessagesBox, MessageTextArea, UserList} from "@/components";
import {useRouter} from "next/router";
import {User} from "../../types";
import {
  useAppDispatch,
  useAppSelector,
  getAppDispatch,
} from "../../redux/toolkit/store";
import {UserEncryptedMessage} from "../../types/global";
import {
  userStartedTyping,
  leaveRoom,
  userStoppedTyping,
  userLeft,
  userJoined,
  receivedMessage,
  handshakeAcknowledge,
} from "../../redux/toolkit/features/chatSlice";
import {SocketConnection} from "../../io/connection";
import {AppDispatch} from "../../redux/toolkit/store";

const ChatPage = () => {
  const router = useRouter();
  const {
    roomId,
    user: ownUser,
    typingUsers,
    loading,
  } = useAppSelector((state) => state.chat);

  // Use a ref to store the dispatch function so that it doesn't change between renders
  // and we can use it in the socket event handlers without triggering a re-render
  // and removes the need to include dispatch in the useEffect dependency array
  // const dispatch = useAppDispatch();

  useEffect(() => {
    //if roomId or username is not set, then return to homepage and clear redux state
    const disconnect = async () => {
      const dispatch = getAppDispatch();
      await router.push("/");
      dispatch(leaveRoom());
    };
    console.log(
      "useEffect called",
      roomId,
      ownUser,
      loading,
      (!roomId || !ownUser) && !loading
    );
    if ((!roomId || !ownUser) && !loading) {
      console.log("roomId or username is not set");
      alert("roomId or username is not set");
      disconnect();
    }
  }, [loading, ownUser, roomId, router]);

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
