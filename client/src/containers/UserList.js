import { connect } from "react-redux";
import { UserListBase } from "../components/UserList";
const mapStateToProps = (state) => {
    return {
        users: state.users,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};
const connection = connect(mapStateToProps, mapDispatchToProps);

const connectedComponent = connection(UserListBase);

export { connectedComponent as UserList };
