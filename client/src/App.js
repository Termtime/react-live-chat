import React, { useState, useEffect, useRef} from 'react';
import './App.css';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MessagesBox } from './containers/MessagesBox';
import { MessageTextArea } from './containers/MessageTextArea';
import { UserList } from './containers/UserList';
let isTyping = false;
let timeout = null;

export const App = (props) => {
  const [usersTyping, setUsersTyping] = useState([]);

  const socketREF = useRef();
  
  const usersREF = useRef([]);

  useEffect(() => {
    socketREF.current = io.connect("http://localhost:8000");
    props.initialize(socketREF);
    socketREF.current.on("own-id", id => {
      // setOwnId(id);
      
      var userInfo = {
        username: "Termtime",
        id: id
      }

      props.connect(userInfo);
      socketREF.current.emit("presentation", userInfo);
    });

    socketREF.current.on("userlist-update", updatedUserList => {
      // setUsers(updatedUserList);
      props.updateUserlist(updatedUserList);
      usersREF.current = updatedUserList;
      console.log("user list has been updated", usersREF.current);
    });

    socketREF.current.on("msg", (message) => {
      receivedMessage(message);
    });

    socketREF.current.on("isTyping", id => {
      //search user in user array
      console.log("someones typing");
      console.log(usersREF.current);
      console.log(id);
      var typingUser = usersREF.current.find(obj => obj.id === id);
      if(typingUser === undefined)
      {
        console.log("undefined user found typing, almost crashed");
      }else{
        
        setUsersTyping([...usersTyping, typingUser]);
      }
    })

    socketREF.current.on("stoppedTyping", id => {
      //search user in user array
      var stoppedTypingUser = usersREF.current.find(obj => obj.id === id);
      if(stoppedTypingUser === undefined){
        console.log("undefined user found to have stopped typing, almost crashed");
      }else{
        setUsersTyping(usersTyping.filter(user => user.id !== id));

      }
    })
    return () => {
      socketREF.current.close();
    }
  },[])

  function receivedMessage(message){
    props.receivedMessage(message);
    // setMessages(oldMsgs => [...oldMsgs, message]);
      document.querySelector(".messageBox-container").scrollTo(0, document.querySelector(".messageBox-container").scrollHeight);
  }

  return (
    <div className="flex-container col ">
      <div id="app">
        <div className="row" >
            <MessagesBox/>
            <UserList/>
        </div>

        <div id="typingStatus">
          { usersTyping.map((user, i) => {
              return (
                <small key={`${user.id}-typing`}>{user.username} is typing...</small>
              )
            })
          }
        </div>
        <MessageTextArea/>
      </div>
    </div>
  );
}
