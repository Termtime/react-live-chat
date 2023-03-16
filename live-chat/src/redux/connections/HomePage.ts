import { Dispatch } from "react";
import { connect } from "react-redux";
import { JOIN_ROOM } from "../actions";
import { AppState } from "../../types/global";

const mapStateToProps = (state: AppState) => {
    return {};
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
    return {
        setRoom: (roomId: string) =>
            dispatch({ type: JOIN_ROOM, payload: roomId }),
    };
};

export const HomePageConnection = connect(mapStateToProps, mapDispatchToProps);
