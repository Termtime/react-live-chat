import { connect } from 'react-redux';
import { UserListBase } from '../components/UserList';
const mapStateToProps = state => {
    return {
        users: state.users
    }
}

const connection = connect(mapStateToProps, null);

const connectedComponent = connection(UserListBase)

export { connectedComponent as UserList }