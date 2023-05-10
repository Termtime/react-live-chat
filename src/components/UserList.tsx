import {Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useAppSelector} from "../redux/toolkit/store";
import PersonIcon from "@mui/icons-material/Person";

export const UserList = () => {
  const {users, user: ownUser} = useAppSelector((state) => state.chat);
  const {isExpanded} = useAppSelector((state) => state.ui.userList);

  const userListStyles = css`
    background-color: #752c2c;
    flex-direction: column;
    align-items: center;
    color: white;
    border-bottom-left-radius: 0.5rem;
    padding: 1rem;
    display: flex;
    overflow-y: auto;
    width: 15rem;
    &::-webkit-scrollbar {
      width: 0.5rem;
    }
    &::-webkit-scrollbar-track {
      background: #752c2c;
    }
    &::-webkit-scrollbar-thumb {
      background: #b33b3b;
    }
    display: ${isExpanded ? "flex" : "none"};

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

  return (
    <Flex css={userListStyles}>
      <Text>
        {`${users.length === 1 ? "User" : "Users"}`} online: {users.length}
      </Text>
      <Flex direction="column" alignItems="flex-start" width="100%">
        {users.map((user) => (
          <Flex key={user.id} css={userStyles}>
            <PersonIcon />
            <Text margin={0}>
              {user.username} {user.id === ownUser?.id && "(You)"}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
