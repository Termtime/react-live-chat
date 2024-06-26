import React, {useEffect, useMemo} from "react";
import {ChatWindow, MessageTextArea, UserList, ChatAppBar} from "@/components";
import {useRouter} from "next/router";
import {useAppSelector, AppDispatch} from "../../redux/toolkit/store";
import {joinRoom, login, logout} from "../../redux/toolkit/features/chatSlice";
import {
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useDispatch} from "react-redux";
import {useSession} from "next-auth/react";
import {RoomList} from "../../components/RoomList";
import {setNewRoomModalOpen} from "../../redux/toolkit/features/uiSlice";
import {ghostButtonStyles} from "../../styles/styles";

const chatAppStyles = css`
  display: flex;
  background-color: #222e35;
  flex-direction: column;
  height: 100dvh;
  max-height: 100dvh;
`;

const ChatPage = () => {
  const router = useRouter();
  const {data, status} = useSession({
    required: true,
    onUnauthenticated: () => router.push("/"),
  });

  const {rooms, authUser, currentRoomId} = useAppSelector(
    (state) => state.chat
  );

  const {isOpen: isNewRoomModalOpen} = useAppSelector(
    (state) => state.ui.newRoomModal
  );

  const [roomIdInput, setRoomIdInput] = React.useState("");
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (status === "authenticated" && data.user?.name) {
      dispatch(login(data.user?.name));
    }
  }, [data?.user?.name, status]);

  const handleJoinRoom = async () => {
    await dispatch(joinRoom(roomIdInput));
    dispatch(setNewRoomModalOpen(false));
    setRoomIdInput("");
  };

  if (!authUser) {
    return (
      <Flex css={chatAppStyles}>
        <Text color="white">Loading...</Text>
      </Flex>
    );
  }

  return (
    <Flex css={chatAppStyles}>
      <Modal
        onClose={() => dispatch(setNewRoomModalOpen(false))}
        isOpen={isNewRoomModalOpen && !!authUser}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        isCentered
      >
        <ModalOverlay />
        <ModalContent backgroundColor="#222e35" color="white">
          <ModalHeader>Select a room to join</ModalHeader>
          <ModalBody>
            <Input
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            />
          </ModalBody>

          <ModalFooter>
            {rooms.length > 0 && (
              <Button
                colorScheme="grey"
                variant="ghost"
                onClick={() => dispatch(setNewRoomModalOpen(false))}
              >
                Cancel
              </Button>
            )}
            <Button colorScheme="blue" onClick={handleJoinRoom}>
              Join room
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Flex flex={1}>
        <RoomList />
        <Flex flex={1} overflowY="auto" flexDirection="column" zIndex={2}>
          <ChatAppBar />
          <Flex flex={1} overflowY="auto">
            <ChatWindow />
            <UserList />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ChatPage;
