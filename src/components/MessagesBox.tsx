import {Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useAppSelector} from "../redux/toolkit/store";
import {TextMessage} from "./TextMessage";
import {MessageTextArea} from "./MessageTextArea";

const messagesBoxStyles = css`
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url("/resources/img/chat-wallpaper.jpg");
  background-blend-mode: luminosity;
  background-color: #151d23;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  max-height: 93vh;
`;

const messageTextAreaStyles = css`
  background-color: #202c33;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: fit-content;
`;

const messageListStyles = css`
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: #374045 #111b21;
`;

export const MessagesBox = () => {
  const {currentRoomId, rooms} = useAppSelector((state) => state.chat);
  const currentRoom = rooms.find((room) => room.id === currentRoomId);

  return (
    <Flex css={messagesBoxStyles} zIndex={2}>
      <Flex direction="column" css={messageListStyles}>
        {currentRoom?.messages.map((message) => (
          <TextMessage
            key={`${message.user.id}-${message.time}`}
            message={message}
          />
        ))}
      </Flex>
      <Flex css={messageTextAreaStyles}>
        <MessageTextArea />
      </Flex>
    </Flex>
  );
};
