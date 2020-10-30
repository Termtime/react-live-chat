import React from  'react';
import { UserItem } from './UserItem';
export const UserListBase = (props) => {

    return (
        <div className="userList-container">
            <div className="userList">
                <div id="userlist-title" className="row center">
                    <p>Users</p>
                </div>
                <div id="users">
                    {
                        props.users.map(user => <UserItem user= {user} />) 
                    }
                </div>
            </div>

        </div>
    );
}