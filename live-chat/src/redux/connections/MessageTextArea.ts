import { connect } from "react-redux";
import { AppState } from "../../types";
import { Dispatch } from "react";

const mapStateToProps = (state: AppState) => {
    return {
        socket: state.socket,
        ownUser: state.ownUser,
        roomId: state.roomId,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
    return {};
};

export const MessageTextAreaConnection = connect(
    mapStateToProps,
    mapDispatchToProps
);
