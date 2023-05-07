import {Button, Flex, Textarea} from "@chakra-ui/react";
import {css} from "@emotion/react";
import React, {ChangeEvent, useCallback, useMemo, useState} from "react";
import {
  sendMessage,
  startTyping,
  stopTyping,
} from "../redux/toolkit/features/chatSlice";
import {
  RootState,
  useAppSelector,
  useAppDispatch,
} from "../redux/toolkit/store";
import {Message} from "../types";
import {EmojiButton, EmojiButtonProps} from "./EmojiButton";
import SendIcon from "@mui/icons-material/Send";
import debounce from "lodash.debounce";

export const MessageTextArea = () => {
  const [text, setText] = useState("");

  const {roomId, user: ownUser} = useAppSelector(
    (state: RootState) => state.chat
  );
  const dispatch = useAppDispatch();

  const stopTypingDebounced = useMemo(
    () => debounce(() => dispatch(stopTyping(roomId!)), 3000),
    [dispatch, roomId]
  );
  const startTypingDebounced = useMemo(
    () =>
      debounce(() => dispatch(startTyping(roomId!)), 3000, {
        leading: true,
        trailing: false,
      }),
    [dispatch, roomId]
  );

  const onSendMessage = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (text.trim().length !== 0 && ownUser && roomId) {
        const message: Message = {
          body: text,
          user: {
            id: ownUser.id!,
            username: ownUser?.username,
            color: ownUser?.color,
          },
          time: new Date().toLocaleTimeString("en-US"),
        };
        setText("");
        stopTypingDebounced.flush();
        dispatch(sendMessage({message, roomId}));
      } else {
        throw new Error(
          "Cannot send message. Check your connection and make sure you are authenticated."
        );
      }
    },
    [text, ownUser, roomId, stopTypingDebounced, dispatch]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (roomId) {
        startTypingDebounced();
        stopTypingDebounced();
      }
      setText(e.target.value);
    },
    [roomId, startTypingDebounced, stopTypingDebounced]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.keyCode === 13 && !e.shiftKey) {
        onSendMessage();
        if (e) e.preventDefault();
      }
    },
    [onSendMessage]
  );

  const onEmojiSelected = useCallback<NonNullable<EmojiButtonProps["onClick"]>>(
    (emojiObject) => {
      handleChange({
        target: {value: text + emojiObject.emoji},
      } as ChangeEvent<HTMLTextAreaElement>);
    },
    [text, handleChange]
  );

  const textAreaStyles = css`
    flex-grow: 1;
    box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.75);
    background-color: rgba(0, 0, 0, 0.65);
    color: white;
    resize: none;
    max-height: 120px;
    border: 0;
  `;

  const formContainerStyles = css`
    flex: 1;
  `;
  return (
    <form onSubmit={onSendMessage}>
      <Flex css={formContainerStyles}>
        <EmojiButton onClick={onEmojiSelected} />
        <Textarea
          css={textAreaStyles}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write something..."
        />
        <Button type="submit" colorScheme="blue">
          <SendIcon />
        </Button>
      </Flex>
    </form>
  );
};
