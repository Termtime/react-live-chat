import {Button, Flex, Text, Tooltip} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useRouter} from "next/router";
import {useAppSelector, useAppDispatch} from "../redux/toolkit/store";
import GroupIcon from "@mui/icons-material/Group";
import {
  setChatListOpen,
  setUserListOpen,
} from "../redux/toolkit/features/uiSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import {logout} from "../redux/toolkit/features/chatSlice";
import {useTypingUsers} from "../hooks/useTypingUsers";
import {ghostButtonStyles} from "../styles/styles";
import {Menu} from "@mui/icons-material";

const headerStyles = css`
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  background-color: #222e35;
  height: 5dvh;
  @media (max-width: 768px) {
    height: 10dvh;
  }
  color: white;
  box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.2);
  align-items: center;
  flex: none;
`;

const titleWrapperStyles = css`
  flex: 2;
  align-items: center;
  justify-content: center;
  text-align: start;
`;

export const ChatAppBar = () => {
  const {rooms, currentRoomId, authUser} = useAppSelector(
    (state) => state.chat
  );
  const {isExpanded: isChatListExpanded} = useAppSelector(
    (state) => state.ui.chatList
  );

  const {isExpanded: isUserListExpanded} = useAppSelector(
    (state) => state.ui.userList
  );

  const typingUsers = useTypingUsers();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentRoom = rooms.find((room) => room.id === currentRoomId);
  const usersMinusMe =
    currentRoom?.users.filter((user) => user.id !== authUser?.id!) || [];
  const myUsernameInList =
    usersMinusMe.length <= 5 && usersMinusMe.length > 0
      ? ", you"
      : usersMinusMe.length === 0
      ? "you"
      : "";

  const disconnect = async () => {
    await router.push("/");
    dispatch(logout());
  };

  return (
    <Flex
      css={headerStyles}
      padding={4}
      gap={{
        base: 2,
        md: 4,
      }}
    >
      {!isChatListExpanded && (
        <Button
          variant="solid"
          css={ghostButtonStyles}
          colorScheme="green"
          onClick={() => {
            dispatch(setChatListOpen(!isChatListExpanded));
          }}
        >
          <Menu />
        </Button>
      )}
      <Flex
        flexDirection="column"
        css={titleWrapperStyles}
        maxWidth="40dvw"
        margin="auto"
        overflow="hidden"
        visibility={{
          base: isChatListExpanded ? "hidden" : "visible",
          md: "visible",
        }}
      >
        <Text overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
          Room: {currentRoom?.name ?? ""}
        </Text>
        <Text
          fontSize="xs"
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        >
          {typingUsers ??
            (currentRoomId &&
              usersMinusMe?.map((u) => u.username.split(" ")[0]).join(", ") +
                myUsernameInList)}
        </Text>
      </Flex>
      <Flex
        style={{
          gap: "1rem",
        }}
      >
        <Tooltip label="User list">
          <Button
            variant="solid"
            css={ghostButtonStyles}
            colorScheme="red"
            onClick={() => dispatch(setUserListOpen(!isUserListExpanded))}
          >
            <GroupIcon />
          </Button>
        </Tooltip>
        <Tooltip label="Log out">
          <Button
            variant="solid"
            colorScheme="red"
            css={ghostButtonStyles}
            onClick={disconnect}
          >
            <LogoutIcon />
          </Button>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
