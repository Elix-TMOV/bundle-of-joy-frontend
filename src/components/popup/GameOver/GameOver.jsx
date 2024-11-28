import React from "react";
import "./GameOver.css"

export default function GameOverModal(props){
    return (
        <div className="popup-contants gameOverMessage">
            <div className="message">
                <p>{props.result}</p>   
            </div>
        </div>
    )
}