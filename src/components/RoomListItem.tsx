import {Flex, Avatar, Box, Text} from "@chakra-ui/react";
import {RoomV2} from "../redux/toolkit/features/chatSlice";
import {AuthUser} from "../types";
import moment from "moment";

export interface RoomListItemProps {
  room: RoomV2;
  isActive: boolean;
  onClick: () => void;
  me: AuthUser;
}

export const RoomListItem = ({
  me,
  room,
  isActive,
  onClick,
}: RoomListItemProps) => {
  const date = room.lastMessage ? moment(room.lastMessage?.time) : undefined;

  const timeText = date
    ? date.isValid() && date.diff(moment().subtract(1, "d"), "d", false) > 0
      ? date.fromNow()
      : date.format("h:mm a")
    : "";
  return (
    <Flex
      gap={3}
      bg={isActive ? "#2a3942" : "#222e35"}
      cursor="pointer"
      color="white"
      onClick={onClick}
      _hover={{bg: isActive ? "#2a3942" : "#111b21"}}
      alignItems="center"
    >
      <Avatar ml={4} name={room.name} size="md" bg="gray.500" />
      <Flex
        flexDirection="column"
        overflow="hidden"
        flex={1}
        p={4}
        pl={1}
        mr={1}
        gap={1}
        borderBottom={isActive ? undefined : "1px solid #222d34"}
      >
        <Flex justifyContent="space-between" flex={1} gap={1} flexWrap="wrap">
          <Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
            {room.name}
          </Text>
          <Text fontSize="sm" color="gray.300">
            {timeText}
          </Text>
        </Flex>

        <Flex flexDir={"row"} overflow="hidden" flexWrap="nowrap">
          <Text
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            flexWrap="nowrap"
            overflow="hidden"
            fontSize="sm"
          >
            {room.lastMessage?.user.username
              ? room.lastMessage.user.id === me.id
                ? "You: "
                : room.lastMessage.user.username + ": "
              : ""}
            {room.lastMessage?.body ?? <br />}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
