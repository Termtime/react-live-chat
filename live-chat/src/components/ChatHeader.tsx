import {Flex, Text} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {useRouter} from "next/router";
import {leaveRoom} from "../redux/toolkit/features/chatSlice";
import {useAppSelector, useAppDispatch} from "../redux/toolkit/store";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const ChatHeader = () => {
  const {roomId, users} = useAppSelector((state) => state.chat);
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
  `;

  const titleStyles = css`
    align-self: center;
    margin: 0;
  `;

  const titleWrapperStyles = css``;

  return (
    <Flex css={headerStyles}>
      <Flex direction="column" onClick={disconnect} marginRight={10}>
        <ArrowBackIcon />
      </Flex>
      {/* <Flex>
          <Text css={textStyles}>
            {users.length} {`${users.length === 1 ? "user" : "users"}`} online
          </Text>
        </Flex> */}
      <Flex direction="column" css={titleWrapperStyles}>
        <Text css={titleStyles}>Room: {roomId}</Text>
      </Flex>
    </Flex>
  );
};
