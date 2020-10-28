import { CONNECT, DISCONNECTED, INITIALIZE, RECEIVED_MSG, USER_JOINED, USER_LEFT } from './actions';
import io from 'socket.io-client';
const INITIAL_STATE = {
    ownUser: {},
    socket: {},
    users: [],
    messages: [],
}

function liveChat(state = INITIAL_STATE, action ){
    console.log(state, action);
    switch(action.type){
        case DISCONNECTED:

        case USER_JOINED:
            return{
                ...state, users: action.payload
            }
        case USER_LEFT:

        case CONNECT:
            return {
                ...state, ownUser: action.payload
            }
        case INITIALIZE:            
            return {
                ...state, socket: action.payload
            }
        case RECEIVED_MSG:
            return {...state, messages : [...state.messages, action.payload ]}
        default:
            return state;
    }
}

export { liveChat };