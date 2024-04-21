import {Flex, Avatar, Box, Text} from "@chakra-ui/react";
import {RoomV2} from "../redux/toolkit/features/chatSlice";
import {AuthUser} from "../types";

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
  return (
    <Flex
      p={4}
      gap={3}
      bg={isActive ? "#2a3942" : "#111b21"}
      cursor="pointer"
      color="white"
      onClick={onClick}
      _hover={{bg: isActive ? "#2a3942" : "#202c33"}}
    >
      <Avatar name={room.name} size="sm" bg="gray.300" />
      <Flex flexDirection="column" overflow="hidden">
        <Flex fontWeight="bold">{room.name}</Flex>

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
