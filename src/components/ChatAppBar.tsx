import {Button, Flex, Text, Tooltip} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useRouter} from "next/router";
import {useAppSelector, useAppDispatch} from "../redux/toolkit/store";
import GroupIcon from "@mui/icons-material/Group";
import {
  setChatListOpen,
  setNewRoomModalOpen,
  toggleUserList,
} from "../redux/toolkit/features/uiSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import {logout} from "../redux/toolkit/features/chatSlice";
import {AddComment, ChevronLeft, Menu} from "@mui/icons-material";

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
  justify-content: center;
  align-items: center;
  flex: 2;
`;

const ghostButtonStyles = css`
  background-color: transparent;
  border-radius: 50%;
  padding: 0.5rem;
`;

export const ChatAppBar = () => {
  const {rooms, currentRoomId} = useAppSelector((state) => state.chat);
  const {isExpanded: isUserListExpanded} = useAppSelector(
    (state) => state.ui.userList
  );
  const {isExpanded: isChatListExpanded} = useAppSelector(
    (state) => state.ui.chatList
  );

  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentRoom = rooms.find((room) => room.id === currentRoomId);

  const disconnect = async () => {
    await router.push("/");
    dispatch(logout());
  };

  const userListButtonStyles = css`
    background-color: ${isUserListExpanded ? "#b33b3b" : "transparent"};
    ${ghostButtonStyles}
  `;

  return (
    <Flex css={headerStyles}>
      <Flex
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="350px"
        flex={1}
      >
        <Button
          variant="solid"
          css={ghostButtonStyles}
          colorScheme="green"
          onClick={() => {
            dispatch(setChatListOpen(!isChatListExpanded));
          }}
        >
          {isChatListExpanded ? <ChevronLeft /> : <Menu />}
        </Button>
        <Text>Rooms</Text>
        <Tooltip label="Add new room">
          <Button
            variant="solid"
            css={ghostButtonStyles}
            colorScheme="green"
            onClick={() => dispatch(setNewRoomModalOpen(true))}
          >
            <AddComment
              sx={{
                transform: "scale(-1,1)",
              }}
            />
          </Button>
        </Tooltip>
      </Flex>
      <Flex direction="row" css={titleWrapperStyles}>
        <Text css={titleStyles}>Room: {currentRoom?.name ?? ""}</Text>
      </Flex>
      <Flex
        style={{
          gap: "1rem",
        }}
      >
        <Tooltip label="User list">
          <Button
            variant="solid"
            css={userListButtonStyles}
            colorScheme="red"
            onClick={() => dispatch(toggleUserList())}
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
