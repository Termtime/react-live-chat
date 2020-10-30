import React from 'react';
import { useHistory } from 'react-router-dom';
import { MessageContainer } from './MessageContainer';
import { OwnMessageContainer } from './OwnMessageContainer';
import exit from '../resources/img/exit.svg';

export const MessagesBoxBase = (props) =>{

    const history = useHistory();
    function disconnect(){
        props.disconnect();
        history.push("/");
    }

    return (
      <div className="col messageBox-container">
        <div className="row messageBox-container-header">
          <div className="col">
            <p>Room: {props.roomId} </p>
          </div>
          <div className="col text-right">
            <div className="row right text-right">
              <p style={{"lineHeight":"3vh"}}>{props.users.length} {`${props.users.length === 1 ? 'user' : 'users'}`} online</p>
              <img id="exit-btn" src={exit} onClick={disconnect}></img>
            </div>
          </div>
        </div>
        <div id="messages" className="row">
          <div className="col">
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
      </div>
    );
}

// export const MessagesBoxBase = (props) =>{
//   return (
//       <div id="chatbox" className="row messageBox-container">
//         <div id="messages" className="col">
//           {
//             props.messages.map((msg, i) => {
//               if(msg.user.id === props.ownUser.id){
//                 return (
//                   <OwnMessageContainer key={i} message={msg}/>
//                 );
//               }else{
//                 return (
//                   <MessageContainer key={i} message={msg} user={msg.user}/>
//                 )
//               }
//             }
//             )
//           }
//         </div>
//     </div>
//   );
// }