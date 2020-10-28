import { connect } from 'react-redux';
import { App } from '../App';
import { CONNECT, INITIALIZE, RECEIVED_MSG, USER_JOINED } from '../reducers/actions';
const mapStateToProps = state =>{
    return {
        users : state.users,
        socketREF: state.socket,
        messages: state.messages
    }
}

const mapDispatchToProps = dispatch => {
    return {
        connect : (ownUser) => dispatch({type: CONNECT, payload: ownUser}),
        initialize : (socket) => dispatch({type: INITIALIZE, payload: socket}),
        receivedMessage: (msg) => dispatch({type: RECEIVED_MSG, payload: msg}),
        updateUserlist: (userlist) => dispatch({type: USER_JOINED, payload: userlist})
    }
}

const connection = connect(mapStateToProps, mapDispatchToProps);
const connectedComponent = connection(App);

export { connectedComponent as App};