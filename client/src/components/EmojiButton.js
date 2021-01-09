import React, { useState } from "react";
import Picker from "emoji-picker-react";
export const EmojiButton = ({ appendEmoji }) => {
    const [isActive, setIsActive] = useState(false);
    return (
        <div className="mr-1">
            {isActive ? (
                <div className="d-flex col">
                    <div className="row emojiPicker">
                        <Picker onEmojiClick={appendEmoji} />
                    </div>
                    <div className="row justify-content-end">
                        <button
                            id="emojiBtn"
                            className="btn btn-success"
                            onClick={(e) => setIsActive(!isActive)}
                        >
                            😀
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className="btn btn-secondary"
                    onClick={(e) => setIsActive(!isActive)}
                >
                    😀
                </button>
            )}
        </div>
    );
};
