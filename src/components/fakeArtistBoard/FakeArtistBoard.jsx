import React, { useEffect, useRef, useContext, useState } from "react";
import p5 from "p5";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTurn } from "../../context/useTurn";


export default function FakeArtistBoard(props) {
    const [gameState, setGameState] = useState(null)
    const { currentUser } = useContext(AuthContext)
    const [hasVoted, setHasVoted] = useState(false)
    const [canvasResize, setCanvasResize] = useState(false)
    const [startVote, setStartVote] = useState(false)
    const setUpComplete = useRef(false)
    const [result, setResult] = useState(null)
    const currentTurn = useRef()
    const { roomSocketId } = props
    const color = useRef(null)
    const sketchRef = useRef();
    const socket = useContext(SocketContext)
    const navigate = useNavigate()
    const p5Ref = useRef()
    const { updateTurn } = useTurn()
    

    if (gameState && gameState.turnsLeft == 0 && !startVote) {
        setGameState(preState => {
            return {
                ...preState,
                picture: p5Ref.current.get().canvas.toDataURL()
            }
        })
        setCanvasResize(true)
        setStartVote(true)
    }

    const handleVote = (color) => {
        socket.emit('fake-artist-vote', roomSocketId, color)
        setHasVoted(true)
    }


    useEffect(() => {
        socket.emit('player-game-setup', roomSocketId, currentUser.id)

        socket.on('results', data => {
            if (data && data.finalMessage) {
                setResult(data);
            }
        });

        socket.on('get-player-setup', (gameState) => {
            const gameStateObj = JSON.parse(gameState)
            let wasInTheRoom = JSON.parse(localStorage.getItem('room'))
            if (wasInTheRoom && wasInTheRoom.roomId == roomSocketId && wasInTheRoom.turn){
                color.current = wasInTheRoom.turn
            }
            else {
                color.current = gameStateObj.turnsAndPlayers[currentUser.id].turn
                localStorage.setItem('room', JSON.stringify({
                    roomId: roomSocketId,
                    turn: color.current
                }))
            }
            currentTurn.current = gameStateObj.turn
            updateTurn(gameStateObj.turn);
            setGameState(gameStateObj)
            setUpComplete.current = true
        })

        socket.on('next-turn', (nextTurn, turnsLeft) => {

            currentTurn.current = nextTurn
            updateTurn(nextTurn); // Add this line
            setGameState(preState => {
                return {
                    ...preState,
                    turnsLeft: turnsLeft
                }
            })
        })
         
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

        // Cleanup function to remove the sketch on unmount
        return () => {
            socket.off('next-turn')
            socket.off('get-player-setup')
            socket.off('roomTimeRanOut')
        }
    }, []);

    useEffect(()=>{
        let sketchInstance
        if (gameState){      
            sketchInstance = new p5(p => {
                p5Ref.current = p
                let wasDrawing
                p.setup = () => {
                    p.createCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
                    p.background(255);
                    p.strokeWeight(10)
                    wasDrawing = false
    
                    if (gameState != null){
                        p.loadImage(gameState.picture, (img)=> {
                            img.resize(p.width, p.height)
                            p.image(img, 0, 0, p.width, p.height)
                        })    
                    }
                    
                    socket.on('draw', (data) => {
                      
                        p.stroke(data.color)
                        p.line(data.px, data.py, data.x, data.y)
                    })
                                   
                };
    
                p.draw = () => {
                    if (p.mouseIsPressed && (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height)) {
                        if (color.current && currentTurn.current == currentUser.id && gameState.turnsLeft != 0) {
                            wasDrawing = true
                            p.stroke(color.current)
                            p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
                            socket.emit('draw', {px: p.pmouseX, py: p.pmouseY, x: p.mouseX, y: p.mouseY, color: color.current}, roomSocketId)
                        }
                    }
                };
    
                p.mouseReleased = () => {
                    if (wasDrawing) {
                        wasDrawing = false;
                        let base64Image = p.get().canvas.toDataURL()
                        socket.emit('change-turn', currentUser.id, roomSocketId, base64Image);
                    }
                }
            }, sketchRef.current);

            return() => {
                socket.off('draw')
                socket.off('vote-results')
                sketchInstance.remove()
            }
        }
    }, [canvasResize, setUpComplete.current])

    return (
        gameState && 
        <div className={`grid ${startVote ? "grid-rows-[10%_60%_30%]" : "grid-rows-[10%_90%]"} items-center h-full`}> 
            <div className="font-semibold text-lg grid grid-cols-[1fr_auto_1fr] items-center px-7">
                <div className="">
                    Turns-Left: {gameState.turnsLeft}
                </div>
                {
                    <div className="flex flex-row gap-1 bg-white rounded-md px-2 py-1">
                        <p>
                            {gameState.category} -
                        </p>
                        <p>
                            {!result ? currentUser.id == gameState.fake ? 'Fake': gameState.word : gameState.word}
                        </p>
                    </div>
                }
            </div>

            <div ref={sketchRef} className="w-full h-full rounded-lg overflow-hidden">
            
            </div>    
            {
                (startVote) &&
                <div className="grid grid-rows-[30%_70%] h-full w-full gap-2">
                    <div className="flex flex-col items-center justify-center font-bold text-2xl">
                        {
                            (!hasVoted && !result) &&
                            "Time To Vote"
                        }
                        {
                            result &&
                            <>
                                <div>
                                    {result.votedOutColor} was voted out
                                </div>
                                <div>
                                    {result.finalMessage}
                                </div>
                            </>
                        }
                    </div>
                    <div className="grid grid-cols-[repeat(5,minmax(0,auto))] grid-rows-[repeat(2,minmax(0,50px))] gap-4 h-full w-full justify-center">
                        {   (!hasVoted && !result) &&
                            Object.keys(gameState.turnsAndPlayers).map(player => {
                                return <button className={`bg-${gameState.turnsAndPlayers[player].turn}-500 rounded-md px-2 py-1 items-center justify-center flex`} onClick={() => handleVote(gameState.turnsAndPlayers[player].turn)}>{gameState.turnsAndPlayers[player].username}</button>
                            })
                        }
                        {   result &&
                            Object.keys(gameState.turnsAndPlayers).map(player => {
                                return <div className={`bg-${gameState.turnsAndPlayers[player].turn}-500 rounded-md px-2 py-1 items-center justify-center flex`}>{gameState.turnsAndPlayers[player].username} - {player == gameState.fake ? "Fake" : "Artist"}</div>
                            })    
                        }
                    </div>            
                </div>
            } 
        </div>
    );
}
