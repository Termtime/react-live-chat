import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../css/homePage.css";

export interface HomePageProps {}

const HomePage = (props) => {
    const history = useHistory();
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("");

    function joinRoom(e) {
        if (e) e.preventDefault();
        props.setRoom({ room: room, username: username });
        history.push("/room");
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
                                        <span className="input-group-text">
                                            Username:
                                        </span>
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={username}
                                    onInput={(e) => setUsername(e.target.value)}
                                    placeholder="Termtime"
                                    required
                                />
                            </div>
                        </div>
                        <br />
                        <div className="center form-inline">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <label>
                                        <span className="input-group-text">
                                            Room name:
                                        </span>
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Termtime's room"
                                    value={room}
                                    onInput={(e) => setRoom(e.target.value)}
                                    required
                                />
                                <div className="input-group-append">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <br />
                </div>
                <div className="homepage-bottom">
                    <div className="row center">
                        <div className="col-3">
                            <div className="card ">
                                <div className="card-body text-dark">
                                    <h3 className="card-title ">
                                        <b>What</b> do we do?
                                    </h3>
                                    <hr />
                                    <p>
                                        Offer a free space to chat and talk with
                                        friends or random people about common
                                        topics or interests.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="card">
                                <div className="card-body text-dark">
                                    <h3 className="card-title ">
                                        <b>How</b> do we do it?
                                    </h3>
                                    <hr />
                                    <p>
                                        Using Express and Socket.io with rooms
                                        we can connect people through a simple
                                        WebApp.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="card">
                                <div className="card-body text-dark">
                                    <h3 className="card-title ">
                                        <b>Why</b> do we do it?
                                    </h3>
                                    <hr />
                                    <p>
                                        Because there is always a need to
                                        explore new and fun ways to use and
                                        apply technology in daily life.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
