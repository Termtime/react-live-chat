import {Flex} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useAppSelector} from "../redux/toolkit/store";
import {TextMessage} from "./TextMessage";

export const MessagesBox = () => {
  const {messages} = useAppSelector((state) => state.chat);

  const messagesBoxStyles = css`
    background-image: linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)),
      url("/resources/img/chat-wallpaper.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 10px;
    border-bottom-right-radius: 1em;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-track {
      box-shadow: 0px 0px 10px 10px transparent;
      border: solid 1px transparent;
    }

    &::-webkit-scrollbar-thumb {
      box-shadow: inset 0 0 20px 10px rgb(71, 65, 65);
      border-radius: 1em;
      border: solid 1px transparent;
    }
  `;

  return (
    <Flex css={messagesBoxStyles}>
      {messages.map((message) => (
        <TextMessage
          key={`${message.user.id}-${message.time}`}
          message={message}
        />
      ))}
    </Flex>
  );
};
