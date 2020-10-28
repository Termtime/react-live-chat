import React from 'react';
import { MessageContainer } from './MessageContainer';
import { OwnMessageContainer } from './OwnMessageContainer';

export const MessagesBoxBase = (props) =>{
    return (
        <div id="chatbox" className="row messageBox-container">
          <div id="messages" className="col">
            {
              props.messages.map((msg, i) => {
                if(msg.user.id === props.ownUser.id){
                  return (
                    <OwnMessageContainer key={i} message={msg}/>
                  );
                }else{
                  return (
                    <MessageContainer key={i} message={msg} user={msg.user}/>
                  )
                }
              }
              )
            }
          </div>
      </div>
    );
}