## Live Demo

A live demo of the app can be found at: https://termtime-live-chat.herokuapp.com/

HomePage:
![homePage](https://i.imgur.com/i39vSDB.jpg)

Chat room:
![chatRoom](https://i.imgur.com/E1nvsYW.jpg)

## User Story
User can:
* Specify username and chat room name
* Send and receive messages
* See the amount of users that are in the same room and their usernames
* Exit the room

## Running the chat app
First run npm install on both the root directory and "client" directory.

Run the server that will handle socket.io connections with `npm run dev` in the root directory to launch the server with nodemon.

Then in the "client" directory you can do `npm start` to launch the app.

Server runs on 8000 port
