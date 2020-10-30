import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../css/homePage.css';

export const HomePage = (props) => {

    const history = useHistory();
    const [username, setUsername] = useState("");
    const [newRoom, setNewRoom] = useState("");
    const [room, setRoom] = useState("");

    function joinRoom(e){
        
        if(e) e.preventDefault();
        console.log("pushing route")
        props.setRoom({room: room, username: username});
        history.push("/room");
        console.log("route pushed");
    }

    function createRoom(e){

    }

    return (
        <div className="homepage">
            <div className="">
                <div className="homepage-header">
                    <div className="whiteTxt">
                        <div className="row center">
                            <h1> Welcome to Live-chat!</h1>
                        </div>
                        <div className="row center">
                            <h3> Join chat rooms, and talk to your friends!</h3>
                        </div>
                    </div>

                    <form onSubmit={joinRoom}>
                        <div className="offset-2 col-8 ">
                            <div className="input-group flex-nowrap">
                                <div className="input-group-prepend">
                                    <label>
                                        <span className="input-group-text">Username:</span>
                                    </label>
                                </div>
                                <input type="text" className="form-control" value={username} onInput={(e) => setUsername(e.target.value)} placeholder="Termtime" required/>
                            </div>
                        </div>
                        <br/>
                        <div className="center form-inline">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <label>
                                        <span className="input-group-text">Room name:</span>
                                    </label>
                                </div>
                                <input type="text" className="form-control" placeholder="Termtime's room" value={room} onInput={e => setRoom(e.target.value)} required/>
                                <div className="input-group-append">
                                    <button type="submit" className="btn btn-primary">Join</button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <br/>
                </div>
                <div className="homepage-bottom">
                    <div className="center ">
                        <h2 className="text-center">Dont have a chatroom?</h2>
                    </div>
                    <div className="form-inline center">
                        <button data-toggle="modal" data-target="#roomCreate" className="btn btn-success">Create one!</button>
                    </div>
                </div>
            </div>

            <div id="roomCreate" className="modal fade" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create a new chatroom</h3>
                        </div>
                        <div className="modal-body">
                            <label>Enter room name:</label>
                            <input type="text" value={newRoom} onInput={e => setNewRoom(e.target.value)} className="form-control"/>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-sucess" onClick={createRoom}>Create</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}