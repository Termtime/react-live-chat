import React, { useState } from "react";
import { EmojiButton } from "./EmojiButton";
let timeout = null;
export const MessageTextAreaBase = (props) => {
    const [message, setMessage] = useState("");

    const sendMessage = (e) => {
        if (e) e.preventDefault();
        if (message.trim().length === 0) return;
        const messageObject = {
            body: message,
            user: props.ownUser,
            roomId: props.roomId,
            date: new Date(),
            time: new Date().toLocaleTimeString("en-US"),
        };
        setMessage("");
        props.socket.current.emit("send-msg", messageObject);
        stoppedTyping();
    };

    const stoppedTyping = () => {
        props.socket.current.emit("clientStoppedTyping", props.roomId);
        if (timeout) clearTimeout(timeout);
        timeout = null;
    };

    const handleChange = (e) => {
        if (timeout) {
            clearTimeout(timeout);
        } else {
            props.socket.current.emit("isTyping", props.roomId);
        }
        timeout = setTimeout(stoppedTyping, 3000);
        setMessage(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13 && !e.shiftKey) {
            if (timeout) clearTimeout(timeout);
            sendMessage();
            if (e) e.preventDefault();
        }
    };

    const onEmojiSelected = (event, emojiObject) => {
        handleChange({ target: { value: message + emojiObject.emoji } });
    };
    return (
        <form
            style={{ alignItems: "flex-end" }}
            className="row form-inline"
            onSubmit={sendMessage}
        >
            <textarea
                id="msgInput"
                rows="1"
                className="form-control mr-0"
                value={message}
                onInput={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Write something..."
            ></textarea>
            <EmojiButton appendEmoji={onEmojiSelected} />
            <button type="submit" className="btn btn-primary">
                Send
            </button>
        </form>
    );
};
