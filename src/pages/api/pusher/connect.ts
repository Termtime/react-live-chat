import type {NextApiRequest, NextApiResponse} from "next";
import {generateLinkedColor, getPusherInstance} from "../../../utils";
import {User} from "../../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pusher = getPusherInstance();

  if (!pusher) {
    res.status(500).json({error: "Pusher is not initialized"});
    return;
  }

  const {roomId, user: userInfo} = req.body;

  const joiningUser: User = {
    id: userInfo.id,
    username: userInfo.username,
    publicKey: userInfo.publicKey,
    color: userInfo.color || generateLinkedColor(userInfo.username),
  };

  console.log("=========== JOIN ROOM ===========\n", {
    roomId,
    user: joiningUser,
  });
  socket.join(roomId);
  // Add the user to the users array, if they are not already in it
  if (!users.find((u) => u.id === joiningUser.id)) {
    users.push(joiningUser);
  }

  //If the room exists, append to the room
  //   let room = rooms.find((room) => room.id === roomId);

  //   if (room) {
  //     // If the user is not already in the room, add them
  //     if (!room.users.find((u) => u.id === joiningUser.id)) {
  //       room.users.push(joiningUser);
  //     }
  //   } else {
  //     // else, create and add the room
  //     room = {
  //       id: roomId,
  //       users: [joiningUser],
  //     };
  //     rooms.push(room);
  //   }

  const room = await firebase
    .database()
    .ref(`rooms/${roomId}`)
    .once("value")
    .then((snapshot) => {
      return snapshot.val();
    });

  // If the room does not exist, create it
  if (!room) {
    await firebase
      .database()
      .ref(`rooms/${roomId}`)
      .set({
        id: roomId,
        users: [joiningUser],
      });
  } else {
    // If the user is not already in the room, add them
    if (!room.users.find((u) => u.id === joiningUser.id)) {
      room.users.push(joiningUser);
    }
  }

  // Acknowledge the user that they have joined the room by sending back the room users
  console.log("Acknowledging user that they have joined the room");
  pusher.trigger(
    `${joiningUser.id}-notification`,
    "handshakeAcknowledge",
    room.users,
    room.id
  );

  // Let the other users in the room know that a new user has joined
  console.log("Notifying other users in the room that a new user has joined");
  pusher.trigger("userJoined", joiningUser);

  console.log("User joined room: ", {roomId, room, users});
}
