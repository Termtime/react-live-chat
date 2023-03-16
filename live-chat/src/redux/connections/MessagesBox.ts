import { connect } from "react-redux";
import { DISCONNECTED } from "../actions";
import { Dispatch } from "react";
import { AppState } from "../../types/global";

const mapStateToProps = (state: AppState) => {
    return {
        messages: state.messages,
        users: state.users,
        ownUser: state.ownUser,
        roomId: state.roomId,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
    return {
        disconnect: () => dispatch({ type: DISCONNECTED }),
    };
};

export const MessagesBoxConnection = connect(
    mapStateToProps,
    mapDispatchToProps
);
