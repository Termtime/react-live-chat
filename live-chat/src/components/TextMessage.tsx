import {Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";
import Color from "color";
import {useAppSelector} from "../redux/toolkit/store";
import {Message} from "../types";

export const TextMessage = ({message}: {message: Message}) => {
  const {user} = useAppSelector((state) => state.chat);
  const messageBackgroundColor = message.user.color || "#31287e";
  const messageColor = Color(messageBackgroundColor).isLight()
    ? "black"
    : "white";

  // use a slighly different color for the timestamp
  const timestampColor = Color(messageBackgroundColor).isLight()
    ? "#555"
    : "#ccc";

  const messageStyles = css`
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;
    background-color: ${messageBackgroundColor};
    color: ${messageColor};
    word-break: break-all;
    text-overflow: clip;
    white-space: pre-line;
    align-self: flex-start;
    padding: 10px 10px 0px 10px;
    border-radius: 10px;
    max-width: 20vw;
    min-width: 6vw;
    box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.3);
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
    color: ${timestampColor};
  `;

  return (
    <Flex
      css={message.user.id === user?.id ? ownMessageStyles : otherMessageStyles}
    >
      <small>{message.user.username}</small>
      <Text margin={0}>{message.body}</Text>
      <Text margin={0} css={timestampStyles}>
        {message.time}
      </Text>
    </Flex>
  );
};
