import React, { useEffect, useRef } from "react";
import { useDrag, DragPreviewImage } from "react-dnd";
import "./Piece.css";

export default function Piece(props) {
    const { pieceName, pieceImage, pieceR, pieceF, canDragPiece } = props;
    const pieceNameRef = useRef(pieceName);

    useEffect(() => {
        pieceNameRef.current = pieceName;
    }, [pieceName]);

    const [{ isDragging }, drag, preview] = useDrag(() => {
        return ({
            type: 'piece',
            canDrag: () => {
                return canDragPiece(pieceNameRef.current.split("_")[0], pieceF, pieceR);
            },
            item: () => {
                return { type: 'piece', id: pieceNameRef.current, pieceR: pieceR, pieceF: pieceF };
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });
    });

    return (
        <>
            <DragPreviewImage connect={preview} src={pieceImage} />
            <div
                className='piece'
                ref={drag}
                style={{
                    backgroundImage: `url(${pieceImage})`,
                    opacity: isDragging ? 0 : 1,
                    width: '100px',
                    height: '100px',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                }}
            />
        </>
    );
}