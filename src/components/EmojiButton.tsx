import React, {useState} from "react";
import Picker, {EmojiClickData, EmojiStyle} from "emoji-picker-react";
import {Button, Flex} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {ghostButtonStyles} from "../styles/styles";
import {EmojiEmotions} from "@mui/icons-material";

export interface EmojiButtonProps {
  onClick?: (emoji: EmojiClickData, event: MouseEvent) => void;
}

export const EmojiButton = ({onClick}: EmojiButtonProps) => {
  const [isActive, setIsActive] = useState(false);
  const emojiPickerStyles = css`
    position: relative;
    bottom: 5rem;
    left: 1.5rem;
  `;
  return (
    <Flex direction="column">
      {isActive && (
        <Flex css={emojiPickerStyles}>
          <Picker onEmojiClick={onClick} emojiStyle={EmojiStyle.NATIVE} />
        </Flex>
      )}
      <Flex direction="row">
        <Button
          css={ghostButtonStyles}
          onClick={(e) => setIsActive(!isActive)}
          isActive={isActive}
        >
          <EmojiEmotions />
        </Button>
      </Flex>
    </Flex>
  );
};
