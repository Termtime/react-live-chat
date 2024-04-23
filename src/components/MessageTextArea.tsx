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
import {ghostButtonStyles} from "../styles/styles";
import ResizeTextarea from "react-textarea-autosize";
import {
  setChatListOpen,
  setUserListOpen,
} from "../redux/toolkit/features/uiSlice";

const textAreaStyles = css`
  flex-grow: 1;
  background-color: #2a3942;
  color: white;
  resize: none;
  max-height: 120px;
  border: 0;

  :focus {
    box-shadow: none;
  }
`;

const messageTextAreaStyles = css`
  flex: 1;
  gap: 5px;
`;

export const MessageTextArea = () => {
  const [text, setText] = useState("");

  const {currentRoomId, rooms, authUser} = useAppSelector(
    (state: RootState) => state.chat
  );
  const currentRoom = rooms.find((room) => room.id === currentRoomId);
  const dispatch = useAppDispatch();

  const stopTypingDebounced = useMemo(
    () => debounce(() => dispatch(stopTyping()), 3000),
    [dispatch, currentRoomId]
  );
  const startTypingDebounced = useMemo(
    () =>
      debounce(() => dispatch(startTyping()), 3000, {
        leading: true,
        trailing: false,
      }),
    [dispatch, currentRoomId]
  );

  const handleSendMessage = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      if (text.trim().length === 0) return;
      if (authUser && currentRoomId && currentRoom) {
        const message: Message = {
          body: text,
          user: {
            id: authUser.id!,
            username: authUser.username,
            color: authUser.color,
          },
          time: Date.now(),
        };
        setText("");
        stopTypingDebounced.flush();
        await dispatch(sendMessage(message));

        // TODO: Scroll to bottom of message after sending
      } else {
        throw new Error(
          "Cannot send message. Check your connection and make sure you are authenticated."
        );
      }
    },
    [text, authUser, currentRoom, stopTypingDebounced, dispatch]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const currentRoom = rooms.find((room) => room.id === currentRoomId);
      if (currentRoom) {
        startTypingDebounced();
        stopTypingDebounced();
      }
      setText(e.target.value);
    },
    [rooms, startTypingDebounced, stopTypingDebounced]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // On desktop, send message on Enter key press
      // On mobile, do nothing
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (e.key === "Enter" && !e.shiftKey && !isMobile) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const onEmojiSelected = useCallback<NonNullable<EmojiButtonProps["onClick"]>>(
    (emojiObject) => {
      handleChange({
        target: {value: text + emojiObject.emoji},
      } as ChangeEvent<HTMLTextAreaElement>);
    },
    [text, handleChange]
  );

  return (
    <Flex css={messageTextAreaStyles}>
      <EmojiButton onClick={onEmojiSelected} />
      <Textarea
        outline={"none"}
        css={textAreaStyles}
        value={text}
        minH="unset"
        overflow="hidden"
        w="100%"
        resize="none"
        minRows={1}
        as={ResizeTextarea}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Write something"
        onFocus={() => {
          console.log("focus", window.innerWidth);
          if (window.innerWidth < 768) {
            console.log("closing in!");
            dispatch(setChatListOpen(false));
            dispatch(setUserListOpen(false));
          }
        }}
      />
      <Button type="submit" onClick={handleSendMessage} css={ghostButtonStyles}>
        <SendIcon />
      </Button>
    </Flex>
  );
};
