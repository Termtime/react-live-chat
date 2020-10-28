import { connect } from 'react-redux';
import { MessagesBoxBase } from '../components/MessagesBox';

const mapStateToProps = state => {
    return {
        messages: state.messages,
        users: state.users,
        ownUser: state.ownUser
    }
}

const mapDispatchToProps = dispatch => {
    return{
        
    }
}

const connection = connect(mapStateToProps, mapDispatchToProps);

const connectedComponent = connection(MessagesBoxBase);

export { connectedComponent as MessagesBox};
