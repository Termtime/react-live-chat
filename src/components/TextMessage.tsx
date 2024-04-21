import {Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useAppSelector} from "../redux/toolkit/store";
import {Message} from "../types";

export const TextMessage = ({message}: {message: Message}) => {
  const {authUser: user} = useAppSelector((state) => state.chat);
  const usernameColor = message.user.color;

  const messageStyles = css`
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;
    background-color: #202c33;
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
  `;
  const otherMessageStyles = css`
    ${messageStyles}
    align-self: flex-start;
  `;

  const timestampStyles = css`
    align-self: flex-end;
    margin-bottom: 5px;
    color: #9dab99;
  `;

  return (
    <Flex
      css={message.user.id === user?.id ? ownMessageStyles : otherMessageStyles}
    >
      {message.user.id !== user?.id && (
        <Text fontSize="sm" color={usernameColor}>
          {message.user.username}
        </Text>
      )}
      <Text margin={0}>{message.body}</Text>
      <Text margin={0} fontSize="xs" css={timestampStyles}>
        {message.time}
      </Text>
    </Flex>
  );
};
