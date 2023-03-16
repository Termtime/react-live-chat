import React from "react";
import { User } from "../types";
import { UserItem } from "./UserItem";

export interface UserListProps {
    users: User[];
}

export const UserListBase = ({ users }: UserListProps) => {
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
