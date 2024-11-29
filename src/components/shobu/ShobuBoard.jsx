import React, { useContext, useEffect, useState } from "react"
import Tile from "../tiles/Tile"
import Piece from "../Piece"
import { DndProvider } from "react-dnd"
import { useRef } from "react"
import Shobu from "../../models/Shobu.js"
import PopUp from "../popup/PopUp.jsx";
import GameOverModal from "../popup/GameOver/GameOver.jsx";
import { HTML5Backend } from 'react-dnd-html5-backend'
import { SocketContext } from "../../context/SocketContext.jsx"
import { AuthContext } from "../../context/AuthContext.jsx"
import { useTurn } from "../../context/useTurn.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

let result;
export default function ShobuBoard(props){
    const shobu = useRef()
    const turnsAndPlayers = useRef()
    const [pieces, setPieces] = useState([])
    const [popUp, setPopUp] = useState(false)
    const { roomSocketId } = props
    const navigate = useNavigate()
    let whiteTiles1 = []
    let whiteTiles2 = []
    let blackTiles1 = []
    let blackTiles2 = []
    const socket = useContext(SocketContext)
    const { currentUser } = useContext(AuthContext);
    const { updateTurn } = useTurn();
    const moveSound = new Audio("/assets/piece.mp3");
    const renderMovedPiece = (prePieces) => {
        const newPieces = prePieces != null ? prePieces : shobu.current.getPieces()
        socket.emit('set-game-state', JSON.stringify({
            turn: shobu.current.playerTurn,
            pieces: newPieces,
            moveType: shobu.current.moveType,
            passiveMoveIn: shobu.current.passiveMoveIn,
        }), roomSocketId)
        setPieces(newPieces)
        updateTurnUI()
    }

    const updateTurnUI = () => {
        let idOfTheNextGuy;
        for (let key in turnsAndPlayers.current) {
            if (turnsAndPlayers.current[key].turn == shobu.current.playerTurn){
                idOfTheNextGuy = key;
                break
            }
        }
        updateTurn(idOfTheNextGuy);
    }

    const onDrop = (piece, tileFile, tileRank) => {
        shobu.current.movePiece(piece.pieceR, piece.pieceF, tileRank, tileFile)
        socket.emit("pieceDropped", piece.pieceR, piece.pieceF, tileRank, tileFile, roomSocketId)
        renderMovedPiece()
        moveSound.play();
        checkGameOver()
    }

    const checkGameOver = () => {
        let gamestatus = shobu.current.isGameOver();
        if (gamestatus.isOver) {
            result = gamestatus.message;
            setPopUp(true)
        }
    }

    useEffect(()=>{
        // shobu.current = new Shobu('w')
        result = "";
        socket.emit("player-game-setup", roomSocketId, currentUser.id)

        socket.on('get-player-setup', (gameState) => {
            
            const gameStateObj = JSON.parse(gameState)
            turnsAndPlayers.current = gameStateObj.turnsAndPlayers;
            const turn = gameStateObj.turnsAndPlayers[currentUser.id].turn
            let wasInTheRoom = JSON.parse(localStorage.getItem(`room`))
            if (wasInTheRoom && wasInTheRoom.roomId == roomSocketId && wasInTheRoom.turn){
                shobu.current = new Shobu(wasInTheRoom.turn)
            }
            else {
                // this impIies a fresh room joining so for this the pIayer needs a new turn
                // setPlayerTurn(turn)
                shobu.current = new Shobu(turn)
                localStorage.setItem(`room`, JSON.stringify({
                    roomId: roomSocketId,
                    turn: turn
                }))
            }

            if (gameStateObj && gameStateObj.pieces){
                shobu.current.setState(gameStateObj)
                renderMovedPiece(gameStateObj.pieces)
            }
            else {
                renderMovedPiece();
            }


        })

        socket.on("opponentDropped", (frmR, frmF, toR, toF) => {
        
            shobu.current.movePiece(frmR, frmF, toR, toF, roomSocketId);
            renderMovedPiece()
            moveSound.play();
            checkGameOver()
        })

        socket.on('roomTimeRanOut', ()=> {
            toast.success(`Room time ran out !`, {
                position: "top-right",
                autoClose: 2000,
                backgroundColor: "255, 0, 0",
                style: {
                    backgroundColor: '#fffb84',
                },            
                progressStyle: { 
                    backgroundColor: '#ff8489',
                },
                icon: <span style={{ fontSize: '1.4em' }}>🚩</span>
            })
            navigate('/')
        })
        
        return () => {
            socket.off("opponentDropped");
            socket.off('roomTimeRanOut');
        }
    }, [])

    const canDragPiece = (color, pieceF, pieceR) => {
        if (shobu.current.playerColor == color && shobu.current.playerTurn == shobu.current.playerColor) {
            return true
        }
        return false
    }

    if (shobu.current && pieces) {
        for (var i = shobu.current.playerColor == "w" ? 0 : 7; shobu.current.playerColor == "w" ? i < 8 : i >= 0; shobu.current.playerColor == "w" ? i++ : i--) {
            for (var j = 0; j < 8; j++) {
                let color = j < 4 ? 'w' : 'b';
                let list;
                if (color == 'w') {
                    if (shobu.current.playerColor == "w"){
                        list = i < 4 ? whiteTiles1 : whiteTiles2;
                    }
                    else {
                        list = i < 4 ? whiteTiles2 : whiteTiles1;
                    }
                } else {
                    if (shobu.current.playerColor == "b") {
                        list = i < 4 ? blackTiles1 : blackTiles2;
                    }
                    else {
                        list = i < 4 ? blackTiles2 : blackTiles1;
                    }
                }
                const piece = pieces.find(p => p.rank === i && p.file === j);
                const item = piece ? <Piece key={`piece${i}${j}`} pieceImage={piece.image} pieceName={piece.name} pieceR={piece.rank} pieceF={piece.file} canDragPiece={canDragPiece} /> : null;
                list.push(
                    <Tile
                        key={`${i}${j}`}
                        inCheck={false}
                        isWhite={color == 'w' ? true : false}
                        rank={i}
                        file={j}
                        onDrop={onDrop}
                        piece={item}
                        isValid={shobu.current.isValidMove}
                    />
                );
            }
        }
    }
    

    return (
        <DndProvider backend={HTML5Backend}>
            {
                popUp &&
                <PopUp
                    contants = {<GameOverModal result={result} />}
                />
            }
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-x-2 gap-y-2">
                <div className="bg-black grid grid-cols-4 grid-rows-4 gap-x-1 gap-y-1">{whiteTiles1}</div>
                <div className="bg-black grid grid-cols-4 grid-rows-4 gap-x-1 gap-y-1">{blackTiles2}</div>       
                <div className="bg-black grid grid-cols-4 grid-rows-4 gap-x-1 gap-y-1">{whiteTiles2}</div>
                <div className="bg-black grid grid-cols-4 grid-rows-4 gap-x-1 gap-y-1">{blackTiles1}</div>
            </div>
        </DndProvider>
    )
}