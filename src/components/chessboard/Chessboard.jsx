import { useContext, useEffect, useState, useRef } from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isDesktop } from "react-device-detect"
import Tile from "../tiles/Tile.jsx";
import Piece from "../Piece.jsx";
import Chess from "../../models/Chess2.js";
import PopUp from "../popup/PopUp.jsx";
import Promotions from "../popup/promotions/Promotions.jsx";
import GameOverModal from "../popup/GameOver/GameOver.jsx";
import { SocketContext } from "../../context/SocketContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useTurn } from "../../context/useTurn.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


let promotionPawn
let result
export default function Chessboard(props) {
    const [pieces, setPieces] = useState([])
    const playerColor = useRef(null)
    const [popUp, setPopUp] = useState(false)
    const turnsAndPlayers = useRef();
    const { roomSocketId } = props
    const navigate = useNavigate()
    const chess = useRef()
    const { currentUser } = useContext(AuthContext)
    const board = []
    const socket = useContext(SocketContext)
    const { updateTurn } = useTurn();
    
    const renderMovedPiece = (prePieces) => {
        
        let idOfTheNextGuy;
        for (let key in turnsAndPlayers.current) {
          
            if (turnsAndPlayers.current[key].turn == chess.current.playerTurn){
                idOfTheNextGuy = key;

                break
            }
        }
        updateTurn(idOfTheNextGuy);

        const newPieces = prePieces != null ? prePieces : chess.current.getPieces()
        if (chess.current.playerTurn === chess.current.playerColor) {
            // Emit only when it’s the player's move
            socket.emit('set-game-state', JSON.stringify({
                turn: chess.current.playerTurn,
                pieces: newPieces
            }), roomSocketId);
        }
        setPieces(newPieces)
    }

    useEffect(() => {
        const handleOpponentDrop = (data) => {
            
            const { piece, tileFile, tileRank } = data;
            chess.current.movePiece(piece.pieceR, piece.pieceF, tileRank, tileFile)
            renderMovedPiece()
            checkGameOver()
        }

        const handleOpponentPromotion = (promotingTo) => {
            chess.current.promotePawn(promotingTo)
            renderMovedPiece()
            checkGameOver()
        }

        const handlePlayerSetup = (gameState) => {
            const gameStateObj = JSON.parse(gameState)
            turnsAndPlayers.current = gameStateObj.turnsAndPlayers;
           
            const turn = gameStateObj.turnsAndPlayers[currentUser.id].turn
            
            let wasInTheRoom = JSON.parse(localStorage.getItem(`room`))
            // this impIies the guy is rejoining the rooms
            if (wasInTheRoom && wasInTheRoom.roomId == roomSocketId && wasInTheRoom.turn){
                playerColor.current = wasInTheRoom.turn
                // I could probably use the current turned registered in the gameState It self as that also get updated with the currentTurn every time a player moves
                chess.current = new Chess(wasInTheRoom.turn)
            }
            else {
                // this impIies a fresh room joining so for this the pIayer needs a new turn
                // setPlayerTurn(turn)
                playerColor.current = turn
                chess.current = new Chess(turn)
                localStorage.setItem(`room`, JSON.stringify({
                    roomId: roomSocketId,
                    turn: turn    
                }))
            }    

            if (gameStateObj && gameStateObj.pieces) {
                chess.current.setState(gameStateObj)
                renderMovedPiece(gameStateObj.pieces)
            }
            else {
                renderMovedPiece()
            }
        }

        // Remove all listeners first
   
        // Only set up one listener
        socket.on('piece-moved', handleOpponentDrop)
        socket.on('opponentPromotingPawn', handleOpponentPromotion)
        socket.on('get-player-setup', handlePlayerSetup)
        socket.on('roomTimeRanOut', ()=> {
         
            toast.success(`Room time ran out!`, {
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

        promotionPawn = {color: null, file: null}
        result = null
        
        socket.emit('player-game-setup', roomSocketId, currentUser.id)

        // Cleanup function
        return () => {
            socket.off('piece-moved')
            socket.off('opponentPromotingPawn')
            socket.off('get-player-setup')
            socket.off('roomTimeRanOut')
        }
    }, []); // Make sure the dependency array is empty

    const selectPromotion = (promotingTo) => {
        setPopUp(false)
        socket.emit('promotingPawn', currentUser.id, promotingTo, roomSocketId)
        // send this data to the game state in db
        chess.current.promotePawn(promotingTo)
        renderMovedPiece()
        checkGameOver()
    }


    const checkGameOver = () => {
        let gameStatus = chess.current.isGameOver()
        if (gameStatus.gameOver){
            result = gameStatus.reason
            setPopUp(true)
        }
    }
    

    const onDrop = (piece, tileFile, tileRank) => {
     
        const pieceData = {
            pieceR: piece.pieceR,
            pieceF: piece.pieceF,
            id: piece.pieceName
        }
        socket.emit('pieceDropped', currentUser.id, pieceData, tileFile, tileRank, roomSocketId)
        chess.current.movePiece(piece.pieceR, piece.pieceF, tileRank, tileFile)
        if ((tileRank === '8' || tileRank === '1') && piece.id.split("_")[1] === 'pawn'){
            promotionPawn.color = piece.id.split("_")[0]
            promotionPawn.file = piece.pieceF
            if (piece.id.split('_')[0] == chess.current.playerColor) {
                setPopUp(true)
            }
        }
        else {
            renderMovedPiece()
            checkGameOver()
        }
    }

    const canDragPiece = (color) => {
        if(chess.current.playerTurn == color && chess.current.playerTurn == chess.current.playerColor){
            return true
        }
        return false
    }

    if (chess.current && pieces && playerColor.current) {
        // (let i = playerColor.current == 'w' ? 0 : 7; playerColor.current == 'w' ? i < 8 : i >= 0; playerColor.current == 'w' ? i++ : i--)
        for (let i = playerColor.current == 'w' ? 8 : 1; playerColor.current == 'w' ? i > 0 : i < 9; playerColor.current == 'w' ? i-- : i++){
            for (let j = 1; j < 9; j++){
                let isWhite = (i+j)%2 === 0 ? true : false
                let inCheck = false
                const piece = pieces.find(p => p.rank === i && p.file === j);
                const item = piece ? <Piece pieceImage={piece.image} pieceName={piece.name} pieceR = {piece.rank} pieceF = {piece.file} canDragPiece={canDragPiece}/> : null;
                // if the piece is black or white and it is in check then set it's tile color to red
                if (piece && ((chess.current.blackKingCheck && piece.name=='b_king') || (chess.current.whiteKingCheck && piece.name=='w_king'))){
                    inCheck = 'true'
                }
                board.push(
                    <Tile 
                        key={`${i}${j}`} 
                        inCheck = {inCheck}
                        isWhite={isWhite} 
                        rank={i} 
                        file={j} 
                        onDrop={onDrop}
                        piece={item}
                        isValid = {chess.current.isValidMove}
                    />
                )
            }
        }
    }

    return (
        <div className="flex h-[100%] bg-red-300 items-center justify-center">
            <DndProvider backend={isDesktop ? HTML5Backend : TouchBackend}>
                    <div className="relative grid grid-cols-8 grid-rows-8 h-[100%]">
                        {popUp &&
                            <PopUp
                                contants = {result == null ? <Promotions onClick={selectPromotion} promotionPawn={promotionPawn}/>: <GameOverModal result={result} />}
                            />
                        }
                        {board}
                    </div>
            </DndProvider>
        </div>
    )
}
