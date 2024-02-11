import React, {useEffect, useMemo} from "react";
import {MessagesBox, MessageTextArea, UserList, ChatAppBar} from "@/components";
import {useRouter} from "next/router";
import {useAppSelector, getAppDispatch} from "../../redux/toolkit/store";
import {leaveRoom} from "../../redux/toolkit/features/chatSlice";
import {Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";

const ChatPage = () => {
  const router = useRouter();
  const {
    room: roomId,
    authUser: ownUser,
    typingUsers,
    isLoadingRoom: isLoadingroom,
  } = useAppSelector((state) => state.chat);

  useEffect(() => {
    const disconnect = async () => {
      const dispatch = getAppDispatch();
      await router.push("/");
      dispatch(leaveRoom());
    };
    if ((!roomId || !ownUser) && !isLoadingroom) {
      console.log("roomId or username is not set");
      alert("roomId or username is not set");
      disconnect();
    }
  }, [isLoadingroom, ownUser, roomId, router]);

  const renderTypingUsers = useMemo(() => {
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
  }, [typingUsers]);

  const chatAppStyles = css`
    display: flex;
    background-color: #1c2224;
    flex-direction: column;
    padding: 1rem;
    height: 100vh;
  `;

  return (
    <Flex css={chatAppStyles}>
      <ChatAppBar />
      <Flex flex={1} overflowY="auto">
        <UserList />
        <MessagesBox />
      </Flex>
      <Flex direction="column">
        <Text color="white">{renderTypingUsers}</Text>
        <MessageTextArea />
      </Flex>
    </Flex>
  );
};

export default ChatPage;
