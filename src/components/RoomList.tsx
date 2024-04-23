import {Avatar, Button, Flex, Text, Tooltip} from "@chakra-ui/react";
import {useAppDispatch, useAppSelector} from "../redux/toolkit/store";
import {RoomListItem} from "./RoomListItem";
import {setCurrentRoomId} from "../redux/toolkit/features/chatSlice";
import {ghostButtonStyles} from "../styles/styles";
import {AddComment, ChevronLeft} from "@mui/icons-material";
import {
  setChatListOpen,
  setNewRoomModalOpen,
} from "../redux/toolkit/features/uiSlice";
import {useEffect, useState} from "react";
import {css} from "@emotion/react";

const roomListStyles = css`
  overflow-y: auto;
  height: 95dvh;
  @media (max-width: 768px) {
    height: 90dvh;
  }
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #374045 #111b21;
  background-color: #111b21;
`;
export const RoomList = () => {
  const {rooms, currentRoomId} = useAppSelector((state) => state.chat);
  const {authUser} = useAppSelector((state) => state.chat);
  const {isExpanded: isChatListExpanded} = useAppSelector(
    (state) => state.ui.chatList
  );
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    if (!isChatListExpanded) {
      setTimeout(() => {
        setShouldHide(true);
      }, 300);
    } else {
      setShouldHide(false);
    }
  }, [isChatListExpanded]);
  const dispatch = useAppDispatch();

  const roomListResponsiveStyles = css`
    margin-right: ${isChatListExpanded ? 0 : "-25dvw"};
    width: 25dvw;
    max-width: 25dvw;
    @media (max-width: 768px) {
      margin-right: ${isChatListExpanded ? 0 : "-50dvw"};
      width: 50dvw;
      max-width: 50dvw;
    }
  `;
  return (
    <Flex
      css={roomListResponsiveStyles}
      flexDir="column"
      backgroundColor="#222e35"
      flex={1}
      transition="margin-right 0.3s ease"
      visibility={shouldHide ? "hidden" : "visible"}
      borderRight={isChatListExpanded ? "1px solid #374045" : "none"}
    >
      <Flex
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        height="4rem"
        padding={4}
      >
        <Flex alignItems="center">
          <Avatar name={authUser?.username} size="sm" bg="gray.300" />
          <Text
            display={{base: "none", md: "block"}}
            ml={2}
            color="white"
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {authUser?.username}
          </Text>
        </Flex>
        <Flex>
          <Tooltip label="Add new room">
            <Button
              variant="solid"
              css={ghostButtonStyles}
              onClick={() => dispatch(setNewRoomModalOpen(true))}
            >
              <AddComment
                sx={{
                  transform: "scale(-1,1)",
                }}
              />
            </Button>
          </Tooltip>
          <Button
            variant="solid"
            css={ghostButtonStyles}
            onClick={() => {
              dispatch(setChatListOpen(false));
            }}
          >
            <ChevronLeft />
          </Button>
        </Flex>
      </Flex>
      <Flex css={roomListStyles}>
        {authUser &&
          rooms.map((room) => (
            <RoomListItem
              key={room.id}
              room={room}
              isActive={room.id === currentRoomId}
              me={authUser}
              onClick={() => {
                dispatch(setCurrentRoomId(room.id));
              }}
            />
          ))}
      </Flex>
    </Flex>
  );
};
