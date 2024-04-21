import {useMemo} from "react";
import {useAppSelector} from "../redux/toolkit/store";

export const useTypingUsers = () => {
  const {currentRoomId, rooms} = useAppSelector((state) => state.chat);

  const typingUsers =
    rooms.find((room) => room.id === currentRoomId)?.typingUsers || [];

  const renderTypingUsers = useMemo(() => {
    let string: string | React.ReactElement = "";
    if (typingUsers.length === 1) {
      string = typingUsers.map((user) => user.username) + " is typing...";
    } else if (typingUsers.length > 1) {
      let usersMinusLast = [...typingUsers.map((user) => user.username)];
      usersMinusLast.pop();
      console.log(usersMinusLast);
      string =
        usersMinusLast.join(", ") +
        " and " +
        typingUsers[usersMinusLast.length].username +
        " are typing...";
    } else if (typingUsers.length > 5) {
      string = "Multiple people are typing...";
    } else {
      string = <div>&nbsp;</div>;
    }
    return string;
  }, [typingUsers]);

  return renderTypingUsers;
};
