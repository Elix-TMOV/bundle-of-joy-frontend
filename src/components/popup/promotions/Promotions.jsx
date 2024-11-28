import React, { useState } from "react";
import './Promotions.css'
export default function Promotions(props){
    const { onClick, promotionPawn } = props
    const pieces = ['bishop', 'queen', 'rook', 'knight']
    console.log(promotionPawn)
    const getPromotionBoxPos =() =>{
        const style = {}
        if (promotionPawn.color == 'w'){
            style.top = 400
        } else {
            style.top = 0
        }
        const tile = document.querySelector(".tile")

        style.left = (promotionPawn.file - 1) * tile.offsetWidth
        return style
    }

    return (
        <div className="popup-contants" style={getPromotionBoxPos()}>
            <div className="promotions-box">
                {pieces.map(piece => <div className='promotions-box--piece' key={piece} onClick={()=>onClick(piece)}><img src={`/assets/${promotionPawn.color}_${piece}.png`}/></div>)}
            </div>
        </div>
    )
}
