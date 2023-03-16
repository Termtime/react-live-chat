import Image from "next/image";
import React from "react";
import { User } from "../types";
import userImg from "../resources/img/user.svg";

export interface UserItemProps {
    user: User;
}

export const UserItem = ({ user }: UserItemProps) => {
    return (
        <div className="userlist-username">
            <Image alt="user-icon" src={userImg} className="avatar" />
            <span>{user.username}</span>
        </div>
    );
};
