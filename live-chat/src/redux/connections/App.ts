import { Dispatch } from "react";
import { connect } from "react-redux";
import { AppState, Message, User } from "../../types";
import {
    CONNECT,
    DISCONNECTED,
    INITIALIZE,
    RECEIVED_MSG,
    USER_JOINED,
    IS_TYPING,
    STOPPED_TYPING,
} from "../actions";
const mapStateToProps = (state: AppState) => {
    return {
        users: state.users,
        socketREF: state.socket,
        messages: state.messages,
        roomId: state.roomId,
        ownUser: state.ownUser,
        typingUsers: state.typingUsers,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
    return {
        disconnect: () => dispatch({ type: DISCONNECTED }),
        connect: (ownUser: User) =>
            dispatch({ type: CONNECT, payload: ownUser }),
        initialize: (socket: any) =>
            dispatch({ type: INITIALIZE, payload: socket }),
        receivedMessage: (msg: Message) =>
            dispatch({ type: RECEIVED_MSG, payload: msg }),
        updateUserlist: (userlist: User[]) =>
            dispatch({ type: USER_JOINED, payload: userlist }),
        addTypingUser: (typingUser: User[]) =>
            dispatch({ type: IS_TYPING, payload: typingUser }),
        removeTypingUser: (id: string) =>
            dispatch({ type: STOPPED_TYPING, payload: id }),
    };
};

export const AppConnection = connect(mapStateToProps, mapDispatchToProps);
