import { connect } from "react-redux";
import { MessagesBoxBase } from "../components/MessagesBox";
import { DISCONNECTED } from "../reducers/actions";

const mapStateToProps = (state) => {
    return {
        messages: state.messages,
        users: state.users,
        ownUser: state.ownUser,
        roomId: state.roomId,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        disconnect: () => dispatch({ type: DISCONNECTED }),
    };
};

const connection = connect(mapStateToProps, mapDispatchToProps);

const connectedComponent = connection(MessagesBoxBase);

export { connectedComponent as MessagesBox };
