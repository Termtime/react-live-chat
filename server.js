const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

let rooms = [];

io.on("connection", socket => {
    console.log("New connection: " + socket.id);
    socket.emit("own-id", socket.id);
    socket.on("presentation", clientInfo =>{
        var client = {
            username: clientInfo.username,
            id: clientInfo.id
        };
        // clients.push(clientInfo);
        
        socket.join(clientInfo.room);
        //If the room exists, append to the room
        var room = rooms.find(room => room.id === clientInfo.room);
        if(room){
            room.clients.push(client);
        }else{ //else, add the room
            room = {
                id: clientInfo.room,
                clients: [client]
            }
            rooms.push(room);
        }
        io.to(clientInfo.room).emit("userlist-update", room.clients);

        console.log("Current rooms: ",rooms);
    })

    socket.on("send-msg", msg => {
        console.log("Message sent: " + msg.body)
        console.log("roomID on sent msg:", msg.roomId)
        io.to(msg.roomId).emit("msg", msg);
    });

    socket.on("isTyping", () => {
        console.log("client is typing")
        console.log(socket.rooms);
        var roomId = socket.rooms[Object.keys(socket.rooms)[0]];
        socket.to(roomId).broadcast.emit("isTyping", socket.id)
    });

    socket.on("clientStoppedTyping", id => {
        console.log("client stopped typing");
        var roomId = socket.rooms[Object.keys(socket.rooms)[0]];
        socket.to(roomId).broadcast.emit("stoppedTyping", id);
    })
    socket.on("disconnecting", reason =>{
        console.log("Disconnecting user: " + socket.id);
        var roomId = socket.rooms[Object.keys(socket.rooms)[0]];
        console.log(roomId);
        console.log(rooms);
        if(roomId)
        {
            var room = rooms.find(room => room.id === roomId);
            console.log(room);
            if(room){
                room.clients = room.clients.filter(user => user.id !== socket.id);
                io.to(roomId).emit("userlist-update", room.clients);
            }
        }
    });
});


server.listen(8000, () => console.log("Server running on port 8000"));