const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

let clients = [];

io.on("connection", socket => {
    console.log("New connection: " + socket.id);
    socket.emit("own-id", socket.id);
    socket.on("presentation", clientInfo =>{
        clients.push(clientInfo);
        console.log(clients);
        io.emit("userlist-update", clients);
    })

    socket.on("send-msg", body => {
        console.log("Message sent: " + body.body)
        io.emit("msg", body);
    });

    socket.on("isTyping", () => {
        console.log("client is typing")
        socket.broadcast.emit("isTyping", socket.id)
    });

    socket.on("clientStoppedTyping", id => {
        console.log("client stopped typing");
        socket.broadcast.emit("stoppedTyping", id);
    })
    socket.on("disconnect", reason =>{
        console.log("Disconnecting user via request: " + socket.id);
        clients = clients.filter(user => user.id !== socket.id);
        console.log(clients);
        socket.disconnect(true);
        io.emit("userlist-update", clients);
    });
});


server.listen(8000, () => console.log("Server running on port 8000"));