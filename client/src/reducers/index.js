import {
    CONNECT,
    DISCONNECTED,
    INITIALIZE,
    JOIN_ROOM,
    RECEIVED_MSG,
    USER_JOINED,
} from "./actions";
import io from "socket.io-client";
const INITIAL_STATE = {
    ownUser: {},
    socket: {},
    users: [],
    messages: [],
    roomId: "",
};

function liveChat(state = INITIAL_STATE, action) {
    console.log(state, action);
    switch (action.type) {
        case JOIN_ROOM:
            return {
                ...state,
                ownUser: { username: action.payload.username },
                roomId: action.payload.room,
            };
        case DISCONNECTED:
            if (state.socket)
                if (state.socket.current) state.socket.current.close();
            return INITIAL_STATE;
        case USER_JOINED:
            return {
                ...state,
                users: action.payload,
            };
        case CONNECT:
            return {
                ...state,
                ownUser: action.payload,
            };
        case INITIALIZE:
            return {
                ...state,
                socket: action.payload,
            };
        case RECEIVED_MSG:
            return { ...state, messages: [...state.messages, action.payload] };
        default:
            return state;
    }
}

export { liveChat };
