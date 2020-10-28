import React from 'react';

export const MessageContainer = (props) => {
    return (
        <div className="row message">
            <div className="col">
                <div className="row">
                    <small className="username">{props.user.username}</small>
                </div>
                <div className="row ">
                    <p className="wrap messageText">
                        {props.message.body}
                    </p>
                </div>
                <div className="row timeStamp">
                    <small>{props.message.time}</small>
                </div>
            </div>
        </div>
    );
}