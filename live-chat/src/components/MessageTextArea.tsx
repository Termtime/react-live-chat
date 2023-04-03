import React, { ChangeEvent, useCallback, useState } from "react";
import { sendMessage, startTyping, stopTyping } from "../redux/toolkit/features/chatSlice";
import { RootState, useAppSelector, useAppDispatch } from '../redux/toolkit/store';
import { Message } from "../types";
import { EmojiButton, EmojiButtonProps } from "./EmojiButton";
let timeout: NodeJS.Timeout | null = null;


export const MessageTextArea = () => {
    const [text, setText] = useState("");

    const { roomId, user: ownUser } = useAppSelector((state: RootState) => state.chat);
    const dispatch = useAppDispatch();


    const onSendMessage = useCallback(
        (e?: React.FormEvent) => {
            if (e) e.preventDefault();
            if (text.trim().length !== 0 && ownUser && roomId){

                const message : Message = {
                    body: text,
                    user: {
                        id: ownUser.id!,
                        username: ownUser?.username,
                    },
                    time: new Date().toLocaleTimeString("en-US"),
                };
                setText("");
                stopTyping(roomId);
                dispatch(sendMessage({message, roomId}));
            }else{
                throw new Error("Cannot send message. Check your connection and make sure you are authenticated.");
            }
            
        },
        [text, ownUser, roomId, dispatch]
    );

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            if(roomId){
                if (timeout) {
                    clearTimeout(timeout);
                } else {
                    startTyping(roomId);
                }
                timeout = setTimeout(() => stopTyping(roomId), 3000);
                setText(e.target.value);
            }
        },
        [roomId]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.keyCode === 13 && !e.shiftKey) {
                if (timeout) clearTimeout(timeout);
                onSendMessage();
                if (e) e.preventDefault();
            }
        },
        [onSendMessage]
    );

    const onEmojiSelected= useCallback<NonNullable<EmojiButtonProps["onClick"]>>(
        (emojiObject) => {
            handleChange({ target: { value: text + emojiObject.emoji } } as ChangeEvent<HTMLTextAreaElement>);
        },
        [text, handleChange]
    );

    return (
        <form
            style={{ alignItems: "flex-end" }}
            className="row form-inline"
            onSubmit={onSendMessage}
        >
            <textarea
                id="msgInput"
                rows={1}
                className="form-control mr-0"
                value={text}
                onInput={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Write something..."
            />
            <EmojiButton onClick={onEmojiSelected} />
            <button type="submit" className="btn btn-primary">
                Send
            </button>
        </form>
    );
};

