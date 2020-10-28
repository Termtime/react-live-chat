import React from 'react';
import user from '../resources/img/user.svg';

export const UserItem = (props) => {
    return (
        <div className="userlist-username">
            <img src={user} className="avatar"/>
            <span>{props.user.username}</span>
        </div>
    );
}