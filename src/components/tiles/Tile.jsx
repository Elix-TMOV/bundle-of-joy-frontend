import React, { useRef, useEffect, useMemo } from 'react'
import "./Tile.css"
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd'

export default function Tile(props){
    const { rank, file, onDrop, piece, isValid, inCheck } = props
    const pieceRef = useRef(piece);

    useEffect(() => {
        pieceRef.current = piece;
    }, [piece]);

    
    const [{ isOver, canDrop }, drop] = useDrop(()=>({
        accept: 'piece',
        canDrop: (item) => {
            return isValid(item.id, item.pieceR, item.pieceF, rank, file);
        },
        drop: (item) => {
            if (item.pos != file+rank) {
                onDrop(item, file, rank)
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    }))
    
    
    
    return (
        <>
            <div
                className={`tile flex items-center justify-center ${props.isWhite ? "bg-[#d3c9b7]":"bg-[#a47449]"} ${canDrop ? "highligted-tile" : ""} ${piece ? 'has-piece' : ""} ${inCheck ? "bg-red-500" : ""}`}
                ref={drop}
            >
                {piece}
            </div>
        </>
    )    
}
