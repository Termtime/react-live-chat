import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/toolkit/store";
import { UserItem } from "./UserItem";

export const UserList = () => {
    const { users } = useSelector((state: RootState) => state.chat);

    return (
        <div className="userList-container">
            <div className="userList">
                <div id="userlist-title" className="row center">
                    <p>Users</p>
                </div>
                <div id="users">
                    {users.map((user, index) => (
                        <UserItem key={index} user={user} />
                    ))}
                </div>
            </div>
        </div>
    );
};
