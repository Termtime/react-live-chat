import {Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useRouter} from "next/router";
import {leaveRoom} from "../redux/toolkit/features/chatSlice";
import {useAppSelector, useAppDispatch} from "../redux/toolkit/store";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";
import {toggleUserList} from "../redux/toolkit/features/uiSlice";

export const ChatHeader = () => {
  const {roomId} = useAppSelector((state) => state.chat);
  const {isExpanded} = useAppSelector((state) => state.ui.userList);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const disconnect = async () => {
    await router.push("/");
    dispatch(leaveRoom());
  };

  const headerStyles = css`
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    background-color: #752c2c;
    padding: 1rem;
    color: white;
    box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.2);
    align-items: center;
    flex: none;
  `;

  const titleStyles = css`
    align-self: center;
    margin: 0;
  `;

  const titleWrapperStyles = css`
    align-items: center;
    flex: 1;
  `;

  const arrowButtonStyles = css`
    cursor: pointer;
    flex-direction: column;
    border-radius: 50%;
    padding: 0.5rem;
    transition: background-color 0.2s ease-in-out;
    &:hover {
      background-color: #b33b3b;
    }
  `;

  const groupIconStyles = css`
    ${arrowButtonStyles}
    background-color: ${isExpanded ? "#b33b3b" : "transparent"};
  `;

  return (
    <Flex css={headerStyles}>
      <Flex css={arrowButtonStyles} onClick={disconnect}>
        <ArrowBackIcon />
      </Flex>
      <Flex css={groupIconStyles} onClick={() => dispatch(toggleUserList())}>
        <GroupIcon />
      </Flex>
      <Flex direction="column" css={titleWrapperStyles}>
        <Text css={titleStyles}>Room: {roomId}</Text>
      </Flex>
    </Flex>
  );
};
