import React, { useState, useEffect, useRef} from 'react';
import './App.css';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { OwnMessageContainer } from './components/OwnMessageContainer';
import { MessageContainer } from './components/MessageContainer';
let isTyping = false;
let timeout = null;
export const App = (props) => {
  const [ownId, setOwnId] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);

  const socketREF = useRef();
  // const socketREF = props.socketREF;
  const usersREF = useRef(users);

  useEffect(() => {
    // props.initialize();
    socketREF.current = io.connect("http://localhost:8000");

    socketREF.current.on("own-id", id => {
      setOwnId(id);
      var userInfo = {
        username: "Termtime",
        id: id
      }
      socketREF.current.emit("presentation", userInfo);
    });

    socketREF.current.on("userlist-update", updatedUserList => {
      setUsers(updatedUserList);
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
    setMessages(oldMsgs => [...oldMsgs, message]);
      document.querySelector(".messagesBox").scrollTo(0, document.querySelector(".messagesBox").scrollHeight);
    // window.scrollTo(0, document.querySelector(".messagesBox").scrollHeight);
  }

  function sendMessage(e){
    if(e) e.preventDefault();
    if(message.trim().length === 0) return;
    const messageObject = {
      body: message,
      id: ownId,
      date: new Date(),
      time: new Date().toLocaleTimeString('en-US')
    };
    setMessage("");
    socketREF.current.emit("send-msg", messageObject);
  }

  function stoppedTyping(){
    isTyping = false;
    socketREF.current.emit("clientStoppedTyping", ownId);
    timeout = null;
  }
  function handleChange(e){
    if(timeout){
      clearTimeout(timeout);
    } else{
      socketREF.current.emit("isTyping");
    }
    timeout = setTimeout(stoppedTyping, 3000);
    setMessage(e.target.value);
  }

  function handleKeyDown(e){
    if(e.keyCode == 13 && !e.shiftKey){
      if(timeout) clearTimeout(timeout);
      stoppedTyping();
      sendMessage();
      if(e) e.preventDefault();
    }
  }
  return (
    <div className="flex-container col">
      <div id="chatbox" className="row">
        <div id="messages" className="messagesBox col">
          {messages.map((msg, i) => {
            if(msg.id === ownId){
              return (
                  <OwnMessageContainer key={i} message={msg}/>
              );
            }else{
              var user = users.find(user => user.id === msg.id);
              if(user){
                return (
                    <MessageContainer key={i} message={msg} user={user}/>
                );
              }else{
                return(
                  <div>
                    ERROR displaying message
                  </div>
                )
              }
            }
          })}
        </div>

      </div>
      <div id="typingStatus">
        { usersTyping.map((user, i) => {
            return (
              <small key={`${user.id}-typing`}>{user.username} is typing...</small>
            )
          })
        }
      </div>
      <form onSubmit={sendMessage}>
        <textarea className="form-control" value={message} onInput={ handleChange } onKeyDown={ handleKeyDown } placeholder="Write something...">
          
        </textarea>
        <br/>
        <input type="submit" className="btn btn-primary"/>
      </form>
      
    </div>
  );
}
