import React, { useState } from "react";

let timeout = null;
let isTyping = false;
export const MessageTextAreaBase = (props) => {
    const [message, setMessage] = useState("");
    function sendMessage(e) {
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
    }

    function stoppedTyping() {
        isTyping = false;
        props.socket.current.emit("clientStoppedTyping", props.ownUser.id);
        timeout = null;
    }

    function handleChange(e) {
        if (timeout) {
            clearTimeout(timeout);
        } else {
            props.socket.current.emit("isTyping");
        }
        timeout = setTimeout(stoppedTyping, 3000);
        setMessage(e.target.value);
    }

    function handleKeyDown(e) {
        if (e.keyCode == 13 && !e.shiftKey) {
            if (timeout) clearTimeout(timeout);
            stoppedTyping();
            sendMessage();
            if (e) e.preventDefault();
        }
    }
    return (
        <form
            style={{ alignItems: "flex-end" }}
            className="row form-inline"
            onSubmit={sendMessage}
        >
            <textarea
                id="msgInput"
                rows="1"
                className="form-control"
                value={message}
                onInput={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Write something..."
            ></textarea>
            <button type="submit" className="btn btn-primary">
                Send
            </button>
        </form>
    );
};
