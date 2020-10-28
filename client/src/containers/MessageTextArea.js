import { connect } from 'react-redux';
import { MessageTextAreaBase } from '../components/MessageTextArea';

const mapStateToProps = state => {
    return {
        socket: state.socket,
        ownUser: state.ownUser
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

const connection = connect(mapStateToProps, mapDispatchToProps);

const connectedComponent = connection(MessageTextAreaBase);

export { connectedComponent as MessageTextArea};