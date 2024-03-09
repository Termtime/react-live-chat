import React, {useEffect, useMemo} from "react";
import {MessagesBox, MessageTextArea, UserList, ChatAppBar} from "@/components";
import {useRouter} from "next/router";
import {
  useAppSelector,
  getAppDispatch,
  AppDispatch,
} from "../../redux/toolkit/store";
import {joinRoom, leaveRoom} from "../../redux/toolkit/features/chatSlice";
import {
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useDispatch} from "react-redux";

const ChatPage = () => {
  const router = useRouter();
  const {
    room,
    authUser: ownUser,
    typingUsers,
    isLoadingRoom,
  } = useAppSelector((state) => state.chat);

  const [needsToSelectRoom, setNeedsToSelectRoom] = React.useState(!room);
  const [roomIdInput, setRoomIdInput] = React.useState("");
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const disconnect = async () => {
      await router.push("/");
      dispatch(leaveRoom());
    };
    if (!ownUser && !isLoadingRoom) {
      console.log("User is not authenticated");
      alert("You are not authenticated, please log in");
      disconnect();
    }
  }, [dispatch, isLoadingRoom, ownUser, router]);

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
  const handleJoinRoom = async () => {
    await dispatch(joinRoom(roomIdInput));
    setNeedsToSelectRoom(false);
    setRoomIdInput("");
  };

  return (
    <Flex css={chatAppStyles}>
      <Modal
        onClose={() => setNeedsToSelectRoom(false)}
        isOpen={needsToSelectRoom}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a room to join</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            test!
            <Input
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleJoinRoom}>
              Join room
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
