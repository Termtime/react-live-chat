import {
  Avatar,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
} from "@chakra-ui/react";
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
import {useState} from "react";

const headerStyles = css`
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  height: 5dvh;
  background-color: #222e35;

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
  align-items: start;
  gap: 1rem;
  text-align: center;
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

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  return (
    <Flex
      css={headerStyles}
      padding={4}
      gap={{
        base: 2,
        md: 4,
      }}
    >
      <Modal
        isOpen={showConfirmLogout}
        onClose={() => setShowConfirmLogout(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent backgroundColor="#222e35">
          <ModalHeader color="white">Log out?</ModalHeader>
          <ModalBody color="white">
            This action will delete all conversations and disconnect you from
            the chat server. Are you sure you want to continue?
          </ModalBody>
          <ModalFooter gap="0.5rem">
            <Button colorScheme="green" onClick={disconnect}>
              Yes
            </Button>
            <Button
              colorScheme="gray"
              onClick={() => setShowConfirmLogout(false)}
            >
              No
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
        css={titleWrapperStyles}
        maxWidth="40dvw"
        overflow="hidden"
        visibility={{
          base: isChatListExpanded ? "hidden" : "visible",
          md: "visible",
        }}
      >
        <Avatar name={currentRoom?.name} size="md" bg="gray.500" />
        <Flex flexDir="column" alignItems="center" gap="0.5rem">
          <Text overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
            {currentRoom?.name ?? ""}
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
      </Flex>
      <Flex
        css={css`
          gap: 1rem;
          margin-left: auto;
        `}
      >
        {currentRoomId && (
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
        )}
        <Tooltip label="Log out">
          <Button
            variant="solid"
            colorScheme="red"
            css={ghostButtonStyles}
            onClick={() => setShowConfirmLogout(true)}
          >
            <LogoutIcon />
          </Button>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
