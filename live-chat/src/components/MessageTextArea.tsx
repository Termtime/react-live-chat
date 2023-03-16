import React, { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { User } from "../types";
import { EmojiButton, EmojiButtonProps } from "./EmojiButton";
let timeout: NodeJS.Timeout | null = null;

interface MessageTextAreaProps {
    socket: React.MutableRefObject<SocketIOClient.Socket>;
    ownUser: User;
    roomId: string;
}

export const MessageTextAreaBase = ({
    socket,
    roomId,
    ownUser,
}: MessageTextAreaProps) => {
    const [message, setMessage] = useState("");

    const stoppedTyping = useCallback(() => {
        socket.current.emit("clientStoppedTyping", roomId);
        if (timeout) clearTimeout(timeout);
        timeout = null;
    }, [socket, roomId]);

    const sendMessage = useCallback(
        (e?: React.FormEvent) => {
            if (e) e.preventDefault();
            if (message.trim().length === 0) return;
            const messageObject = {
                body: message,
                user: ownUser,
                roomId: roomId,
                date: new Date(),
                time: new Date().toLocaleTimeString("en-US"),
            };
            setMessage("");
            socket.current.emit("send-msg", messageObject);
            stoppedTyping();
        },
        [message, ownUser, roomId, socket, stoppedTyping]
    );

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            if (timeout) {
                clearTimeout(timeout);
            } else {
                socket.current.emit("isTyping", roomId);
            }
            timeout = setTimeout(stoppedTyping, 3000);
            setMessage(e.target.value);
        },
        [socket, roomId, stoppedTyping]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.keyCode === 13 && !e.shiftKey) {
                if (timeout) clearTimeout(timeout);
                sendMessage();
                if (e) e.preventDefault();
            }
        },
        [sendMessage]
    );

    const onEmojiSelected= useCallback<NonNullable<EmojiButtonProps["onClick"]>>(
        (emojiObject) => {
            handleChange({ target: { value: message + emojiObject.emoji } } as ChangeEvent<HTMLTextAreaElement>);
        },
        [message, handleChange]
    );

    return (
        <form
            style={{ alignItems: "flex-end" }}
            className="row form-inline"
            onSubmit={sendMessage}
        >
            <textarea
                id="msgInput"
                rows={1}
                className="form-control mr-0"
                value={message}
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
