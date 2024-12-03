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
import {EmojiButton} from "./EmojiButton";

const roomListStyles = css`
  overflow-y: auto;
  height: 95dvh;
  @media (max-width: 768px) {
    height: 90dvh;
  }
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #374045 #222e35;
  background-color: #222e35;
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
    margin-right: ${isChatListExpanded ? 0 : "-27dvw"};
    width: 27dvw;
    max-width: 27dvw;
    @media (max-width: 768px) {
      margin-right: ${isChatListExpanded ? 0 : "-50dvw"};
      width: 50dvw;
      max-width: 50dvw;
    }
  `;
  const responsiveHeaderStyles = css`
    height: 5dvh;
    gap: 0.5rem;
    @media (max-width: 768px) {
      height: 10dvh;
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
        css={responsiveHeaderStyles}
        padding={4}
      >
        <Flex alignItems="center">
          <Tooltip label={authUser?.username}>
            <Avatar name={authUser?.username} size="sm" bg="gray.500" />
          </Tooltip>
        </Flex>
        <Flex gap="0.5rem">
          {authUser && rooms.length > 0 && (
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
          )}
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
