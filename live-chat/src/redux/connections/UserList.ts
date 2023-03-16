import { connect } from "react-redux";
import { AppState } from "../../types/global";
import { Dispatch } from "react";

const mapStateToProps = (state: AppState) => {
    return {
        users: state.users,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
    return {};
};

export const UserListConnection = connect(mapStateToProps, mapDispatchToProps);
