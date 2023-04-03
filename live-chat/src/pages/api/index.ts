// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {Server as HTTPServer} from "http";
import type {NextApiRequest, NextApiResponse} from "next";
import type {Socket as NetSocket} from "net";
import type {Server as IOServer} from "socket.io";

import {Socket, Server} from "socket.io";
import {ClientToServerEvents, ServerToClientEvents} from "../../io/events";
import {User} from "../../types";
import NextCors from "nextjs-cors";

interface Room {
  id: string;
  users: User[];
}

interface ServerUser extends User {
  roomIds: string[];
}

const rooms: Room[] = [];
const users: User[] = [];

interface SocketServer extends HTTPServer {
  io?: IOServer<ClientToServerEvents, ServerToClientEvents> | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  console.log("req.method: ", req.method);
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (res.socket?.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    res.socket.server.io = new Server(res.socket.server);
  }

  const io = res.socket.server.io;

  io.on(
    "connection",
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      console.log("New connection: " + socket.id);

      socket.on("joinRoom", ({roomId, user: userInfo}) => {
        const joiningUser: User = {
          id: socket.id,
          username: userInfo.username,
          publicKey: userInfo.publicKey,
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
        let room = rooms.find((room) => room.id === roomId);

        if (room) {
          // If the user is not already in the room, add them
          if (!room.users.find((u) => u.id === joiningUser.id)) {
            room.users.push(joiningUser);
          }
        } else {
          // else, create and add the room
          room = {
            id: roomId,
            users: [joiningUser],
          };
          rooms.push(room);
        }
        // Acknowledge the user that they have joined the room by sending back the room users
        console.log("Acknowledging user that they have joined the room");
        socket.emit("handshakeAcknowledge", room.users, socket.id);

        // Let the other users in the room know that a new user has joined
        console.log(
          "Notifying other users in the room that a new user has joined"
        );
        socket.broadcast.to(roomId).emit("userJoined", joiningUser);

        console.log("User joined room: ", {roomId, room, users});
      });

      socket.on("message", (encryptedMessage) => {
        console.log(
          "=========== MESSAGE ===========\n",
          "encryptedMessage:",
          encryptedMessage
        );
        socket.broadcast
          .to(encryptedMessage.roomId)
          .emit("message", encryptedMessage);
      });

      socket.on("startedTyping", (roomId) => {
        console.log(
          `=========== TYPING ===========\n`,
          `${socket.id} started Typing in room ${roomId}`
        );
        const user = users.find((user) => user.id === socket.id);
        if (user) {
          socket.to(roomId).emit("userStartedTyping", user);
        }
      });

      socket.on("stoppedTyping", (roomId) => {
        console.log(`${socket.id} stopped Typing in room ${roomId}`);
        const user = users.find((user) => user.id === socket.id);
        if (user) {
          socket.to(roomId).emit("userStoppedTyping", user);
        }
      });

      socket.on("disconnecting", (reason) => {
        console.log(`=========== DISCONNECT ===========\n`, socket.id);
        const user = users.find((user) => user.id === socket.id);

        if (user) {
          rooms
            .filter((room) => room.users.includes(user))
            .forEach((room) => {
              const leavingUser = room.users.find(
                (user) => user.id === socket.id
              );
              if (leavingUser) {
                room.users = room.users.filter((user) => user.id !== socket.id);

                // Let users in the room know that a user has left
                io.to(room.id).emit("userLeft", leavingUser);
              }
            });
        }
      });

      socket.on("leaveRoom", (roomId) => {
        console.log(`=========== LEAVE ===========\n`, {
          userId: socket.id,
          roomId,
        });
        socket.leave(roomId);
        //update room clients list
        const room = rooms.find((room) => room.id === roomId);
        if (room) {
          const user = room.users.find((user) => user.id === socket.id);

          if (user) {
            room.users = room.users.filter((user) => user.id !== socket.id);
            // Let users in the room know that a user has left
            io.to(roomId).emit("userLeft", user);
          }
        }
      });
    }
  );
  res.end();
}
