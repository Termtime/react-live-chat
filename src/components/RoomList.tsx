import {Flex} from "@chakra-ui/react";
import {useAppDispatch, useAppSelector} from "../redux/toolkit/store";
import {RoomListItem} from "./RoomListItem";
import {setCurrentRoomId} from "../redux/toolkit/features/chatSlice";

export const RoomList = () => {
  const {rooms, currentRoomId} = useAppSelector((state) => state.chat);
  const {authUser} = useAppSelector((state) => state.chat);
  const {isExpanded: isChatListExpanded} = useAppSelector(
    (state) => state.ui.chatList
  );
  const dispatch = useAppDispatch();
  return (
    <Flex
      flexDir="column"
      backgroundColor="#752c2c"
      maxWidth="350px"
      flex={1}
      display={isChatListExpanded ? "flex" : "none"}
    >
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
  );
};
