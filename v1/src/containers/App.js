import { connect } from "react-redux";
import { App } from "../App";
import {
    CONNECT,
    DISCONNECTED,
    INITIALIZE,
    RECEIVED_MSG,
    USER_JOINED,
    IS_TYPING,
    STOPPED_TYPING,
} from "../reducers/actions";
const mapStateToProps = (state) => {
    return {
        users: state.users,
        socketREF: state.socket,
        messages: state.messages,
        roomId: state.roomId,
        ownUser: state.ownUser,
        typingUsers: state.typingUsers,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        disconnect: () => dispatch({ type: DISCONNECTED }),
        connect: (ownUser) => dispatch({ type: CONNECT, payload: ownUser }),
        initialize: (socket) => dispatch({ type: INITIALIZE, payload: socket }),
        receivedMessage: (msg) =>
            dispatch({ type: RECEIVED_MSG, payload: msg }),
        updateUserlist: (userlist) =>
            dispatch({ type: USER_JOINED, payload: userlist }),
        addTypingUser: (typingUser) =>
            dispatch({ type: IS_TYPING, payload: typingUser }),
        removeTypingUser: (id) =>
            dispatch({ type: STOPPED_TYPING, payload: id }),
    };
};

const connection = connect(mapStateToProps, mapDispatchToProps);
const connectedComponent = connection(App);

export { connectedComponent as App };
