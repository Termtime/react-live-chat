import React, { useState } from "react";
import Picker, { EmojiClickData } from "emoji-picker-react";

export interface EmojiButtonProps {
    onClick?: (emoji: EmojiClickData, event: MouseEvent) => void;
}

export const EmojiButton = ({ onClick }: EmojiButtonProps) => {
    const [isActive, setIsActive] = useState(false);
    return (
        <div className="mr-1">
            {isActive ? (
                <div className="col">
                    <div className="row emojiPicker">
                        <Picker onEmojiClick={onClick} />
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
