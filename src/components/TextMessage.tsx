import {Avatar, Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useAppSelector} from "../redux/toolkit/store";
import {Message} from "../types";

const messageStyles = css`
  display: flex;
  flex-direction: column;
  color: #e9edef;
  word-break: break-all;
  text-overflow: clip;
  white-space: pre-line;
  align-self: flex-start;
  padding: 10px 10px 0px 10px;
  border-radius: 10px;
  max-width: 20vw;
  min-width: 6vw;
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    max-width: 50vw;
  }
  @media (max-width: 500px) {
    max-width: 80vw;
  }
  @media (max-width: 350px) {
    max-width: 90vw;
  }
  @media (max-width: 300px) {
    max-width: 95vw;
  }
`;
const ownMessageStyles = css`
  ${messageStyles}
  align-self: flex-end;
  background-color: #005c4b;
`;
const otherMessageStyles = css`
  ${messageStyles}
  align-self: flex-start;
  background-color: #222e35;
`;

const timestampStyles = css`
  align-self: flex-end;
  margin-bottom: 5px;
  color: #9dab99;
`;

const messageContainerStyles = css`
  flex-direction: row;
  margin-bottom: 0.25rem;
  gap: 0.5rem;
`;
export const TextMessage = ({
  message,
  isFirstInChain,
}: {
  message: Message;
  isFirstInChain: boolean;
}) => {
  const {authUser} = useAppSelector((state) => state.chat);
  const usernameColor = message.user.color;
  const isOwnMessage = message.user.id === authUser?.id;

  return (
    <Flex
      css={messageContainerStyles}
      alignSelf={isOwnMessage ? "flex-end" : "flex-start"}
    >
      {!isOwnMessage && (
        <Avatar
          visibility={isFirstInChain ? "visible" : "hidden"}
          name={message.user.username}
          size="sm"
          bg={message.user.color}
        />
      )}
      <Flex css={isOwnMessage ? ownMessageStyles : otherMessageStyles}>
        {!isOwnMessage && (
          <Text
            fontSize="sm"
            color={usernameColor}
            display={isFirstInChain ? "flex" : "none"}
          >
            {message.user.username}
          </Text>
        )}
        <Text margin={0}>{message.body}</Text>
        <Text margin={0} fontSize="xs" css={timestampStyles}>
          {new Date(message.time).toLocaleTimeString("en-US")}
        </Text>
      </Flex>
    </Flex>
  );
};
