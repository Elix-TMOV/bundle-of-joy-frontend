import { useState, useEffect, useRef } from "react";

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext.jsx";
import Chessboard from "../chessboard/Chessboard.jsx";
import FakeArtistBoard from "../fakeArtistBoard/FakeArtistBoard.jsx";
import PlayersList from "./playersList.jsx";
import SetupComponent from "./setupComponent.jsx";
import ShobuBoard from "../shobu/ShobuBoard.jsx";
import ChatBox from "../ChatBox.jsx";
import { toast } from 'react-toastify';
import { callLeaveRoom } from "../../helpefunctions/roomApiFunctions.js";


export default function WaitingRoom(){
    const [requiredParticipants, setRequiredParticipants] = useState('')
    const [players, setPlayersJoined] = useState([])
    const [startGame, setStartGame] = useState(false)
    const navigate = useNavigate()
    const [gameComponent, setGameComponent] = useState(null);
    const playerLeft = useRef(false)
    const timerStarted = useRef(false)
    const [timer, setTimer] = useState(120)
    const [err, setErr] = useState(null)
    const {gameName, roomSocketId} = useParams()
    const { currentUser } = useContext(AuthContext)
    const socket = useContext(SocketContext)
    const timerId = useRef(null)
    const handleStart = () => {
        switch (gameName) {
            case 'Chess': {
                socket.emit('setup-chess', roomSocketId)
                break;
            }
            case 'Fake-Artist': {
                socket.emit("setup-fake-artist", roomSocketId)
                break
            }
            case 'Shobu': {
                socket.emit('setup-shobu', roomSocketId)
                break
            }
        }   
    }

    if (timer == 0 && players.length != requiredParticipants) {
        navigate('/')
    }



    const createGameComponent = () => {
        switch (gameName) {
            case 'Chess': {
                setRequiredParticipants(2);
             
                setGameComponent(<Chessboard roomSocketId={roomSocketId}/>);
                break;
            }
            case 'Fake-Artist': {
                setRequiredParticipants(5)
                setGameComponent(<FakeArtistBoard roomSocketId={roomSocketId}/>)
                break
            }
            case 'Shobu': {
                setRequiredParticipants(2)
                setGameComponent(<ShobuBoard roomSocketId={roomSocketId}/>)
                break
            }
        }
    }

    const startTimer = () => {
        if (players.length == requiredParticipants || timer == 0) {      
            return 
        }
        setTimer((prevTimer) => {
            return prevTimer - 1
        })
        timerId.current = setTimeout(startTimer, 1000);
    };
    
    useEffect(() => {
        if (players.length < requiredParticipants && startGame && !timerStarted.current){
            // const timeSince = new Date() - JSON.parse(localStorage.getItem("playerLeftAt"))/60000
            const currentTime = new Date().toLocaleTimeString().split(" ")[0]
            const playerLeftAt = JSON.parse(localStorage.getItem('playerLeftAt')).split(" ")[0]
            let [hours1, minutes1, seconds1] = currentTime.split(":").map(Number)
            let [hours2, minutes2, seconds2] = playerLeftAt.split(":").map(Number)
            let timeSince = (hours1*3600 + minutes1*60 + seconds1) - (hours2*3600 + minutes2*60 + seconds2)
            setTimer(prevTimer => {
                return prevTimer - timeSince
            })
            startTimer()
            timerStarted.current = true
        }
        if (players.length == requiredParticipants && timer < 120) {
            clearTimeout(timerId.current)
            setTimer(120)
            playerLeft.current = false
            timerStarted.current = false
        }
    }, [players])

    
    useEffect(()=>{
        setGameComponent('')
        createGameComponent()

        socket.on('start-game', () => {
            setStartGame(true)
        })

        socket.emit('join-room', roomSocketId)

        // Listen for the 'players-updated' event
        socket.on('player-joined', (players, hasStarted) => {
            setPlayersJoined(players);
            if (hasStarted) {
                setStartGame(true)
            }
        })

        socket.on('update-players', updatedPlayers => {
            setPlayersJoined(updatedPlayers)
            toast.success(`A player left the room !`, {
                position: "top-right",
                autoClose: 1000,
                backgroundColor: "255, 0, 0",
                style: {
                    backgroundColor: '#fffb84',
                },            
                progressStyle: { 
                    backgroundColor: '#ff8489',
                },
                icon: <span style={{ fontSize: '1.4em' }}>🚩</span>
            })
            if (!playerLeft.current) {
                const leftAtTime = new Date().toLocaleTimeString()
                localStorage.setItem('playerLeftAt', JSON.stringify(leftAtTime))
                playerLeft.current = true
            }

        })

        socket.on('error', (err) => {
            setErr(err)
        })

        const handleBeforeUnload = (e) => {
            callLeaveRoom(roomSocketId, currentUser.id);
        };
    
        // Handle navigation events
        const handlePopState = () => {
            callLeaveRoom(roomSocketId, currentUser.id);
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
    
        // Clean up the event listener when the component unmounts
        return () => {
            socket.off('start-game')
            socket.off('error')
            socket.off('update-players');
            socket.off('player-joined')
            socket.off('disconnect')
            socket.emit('leave-room', roomSocketId, currentUser.id)
            callLeaveRoom(roomSocketId, currentUser.id)
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        }
    }, [])

    
    return (
        (players.length > 0) && 
        <div className="lg:grid grid-cols-[70%_30%] p-2 h-[100vh] bg-secondary-blue overflow-auto">
            <div className="grid grid-rows-[10%_90%] place-content-center h-full lg:mb-0">
                <div className="flex items-center justify-between">
                    <PlayersList players={players}/>
                </div>
                <div className="bg-primary-blue rounded-lg aspect-square relative">
                    {
                        startGame ? gameComponent : <SetupComponent roomSocketId={roomSocketId} handleStart={handleStart} gameName={gameName} isHost={currentUser.id == players[0]._id} canStart = {players.length == requiredParticipants}/>
                    }
                    {
                        (startGame && players.length < requiredParticipants) &&
                        <div className="flex items-center justify-center w-full h-full absolute top-0 text-3xl font-semibold gap-1" style={{ lineHeight: '8' }}>
                            <div>
                                Waiting for player to re-join
                            </div>
                            <p>{`⏰ ${Math.floor(timer/60)}:${timer%60}`}</p>
                        </div>
                    }
                </div>
            </div>
            <ChatBox roomSocketId ={roomSocketId}/>
        </div>
    )
}
