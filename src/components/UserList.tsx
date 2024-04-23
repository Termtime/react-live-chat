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
  scrollbar-width: thin;
  scrollbar-color: #374045 #111b21;
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

  const userListResponsiveStyles = css`
    ${userListStyles}
    margin-left: ${isUserListExpanded ? 0 : "-25dvw"};
    width: 25dvw;
    max-width: 25dvw;
    @media (max-width: 768px) {
      margin-left: ${isUserListExpanded ? 0 : "-50dvw"};
      width: 50dvw;
      max-width: 50dvw;
    }
  `;

  return (
    <Flex
      css={userListResponsiveStyles}
      transition="margin-left 0.3s ease"
      visibility={shouldHide ? "hidden" : "visible"}
    >
      <Text
        borderBottom="1px solid #374045"
        padding={2}
        width="100%"
        textAlign="center"
        mb={3}
      >
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
