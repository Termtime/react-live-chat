// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";

import { Socket, Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../io/events";
import { User } from "../../types";

const express = require("express");
const http = require("http");
const app = express();

const port = process.env.PORT || 8000;

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

export default function handler(
    req: NextApiRequest,
    res: NextApiResponseWithSocket
) {
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

            socket.on("joinRoom", ({ roomId, user }, callback) => {
                socket.join(roomId);
                // Add the user to the users array, if they are not already in it
                if (!users.find((u) => u.id === user.id)) {
                    users.push(user);
                }

                //If the room exists, append to the room
                let room = rooms.find((room) => room.id === roomId);
                if (room) {
                    // If the user is not already in the room, add them
                    if (!room.users.find((u) => u.id === user.id)) {
                        room.users.push(user);
                    }
                } else {
                    // else, create and add the room
                    room = {
                        id: roomId,
                        users: [user],
                    };
                    rooms.push(room);
                }
                // Acknowledge the user that they have joined the room by sending back the room users

                callback(room.users);

                // Let the other users in the room know that a new user has joined
                socket.to(roomId).emit("userJoined", user);

                console.log("Current rooms: ", rooms);
            });

            socket.on("message", (encryptedMessage) => {
                io.to(encryptedMessage.roomId).emit(
                    "message",
                    encryptedMessage
                );
            });

            socket.on("startedTyping", (roomId) => {
                console.log(`${socket.id} is Typing in room: ${roomId}`);
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
                console.log(
                    `DISCONNECT - Disconnecting user ${socket.id} from all rooms`
                );
                const user = users.find((user) => user.id === socket.id);

                if (user) {
                    rooms
                        .filter((room) => room.users.includes(user))
                        .forEach((room) => {
                            const leavingUser = room.users.find(
                                (user) => user.id === socket.id
                            );
                            if (leavingUser) {
                                room.users = room.users.filter(
                                    (user) => user.id !== socket.id
                                );

                                io.to(room.id).emit("userLeft", leavingUser);
                            }
                        });
                }
            });

            socket.on("leaveRoom", (roomId) => {
                console.log(
                    `LEAVE - user ${socket.id} leaving room: ${roomId}`
                );
                socket.leave(roomId);
                //update room clients list
                const room = rooms.find((room) => room.id === roomId);
                if (room) {
                    const user = room.users.find(
                        (user) => user.id === socket.id
                    );

                    if (user) {
                        room.users = room.users.filter(
                            (user) => user.id !== socket.id
                        );
                        io.to(roomId).emit("userLeft", user);
                    }
                }
            });
        }
    );
    res.status(200).json({ name: "John Doe" });
}
