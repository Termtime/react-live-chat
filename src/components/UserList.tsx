import {Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useAppSelector} from "../redux/toolkit/store";
import PersonIcon from "@mui/icons-material/Person";
import {useEffect, useState} from "react";

const userListStyles = css`
  background-color: #111b21;
  flex-direction: column;
  align-items: center;
  color: white;
  border-bottom-left-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  overflow-y: auto;
  width: 15rem;
  scrollbar-width: thin;
  scrollbar-color: #374045 #111b21;

  // Hide the user list when the screen is too small
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const userStyles = css`
  display: flex;
  margin-bottom: 0.5rem;
  word-break: break-all;
`;

export const UserList = () => {
  const {rooms, currentRoomId, authUser} = useAppSelector(
    (state) => state.chat
  );

  const {isExpanded: isUserListExpanded} = useAppSelector(
    (state) => state.ui.userList
  );

  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    if (!isUserListExpanded) {
      setTimeout(() => {
        setShouldHide(true);
      }, 300);
    } else {
      setShouldHide(false);
    }
  }, [isUserListExpanded]);
  const currentRoom = rooms.find((room) => room.id === currentRoomId);
  if (!currentRoom) return null;

  return (
    <Flex
      css={userListStyles}
      marginLeft={isUserListExpanded ? 0 : "-15rem"}
      transition="margin-left 0.3s ease"
      visibility={shouldHide ? "hidden" : "visible"}
    >
      <Text>
        {`Users online: `}
        {currentRoom.users.length}
      </Text>
      <Flex direction="column" alignItems="flex-start" width="100%">
        {currentRoom.users.map((user) => (
          <Flex key={user.id} css={userStyles}>
            <PersonIcon />
            <Text margin={0}>
              {user.username} {user.id === authUser?.id && "(You)"}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
