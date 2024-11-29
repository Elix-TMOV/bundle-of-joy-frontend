import GameCard from "./GameCards";
import RoomCard from "./RoomCard";
import Header from "./Header";
import { useEffect, useState } from "react";
import { API_URL } from "../../config";
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { callLeaveRoom } from "../../helpefunctions/roomApiFunctions";
import { toast } from 'react-toastify';

const Games = [
    {name: "Chess", requiredPlayers: 2, poster: "/assets/Chess-Poster.png", turns: ['w', 'b']},
    {name: "Fake-Artist", requiredPlayers: 5, poster: "/assets/Fake-Artist-Poster.png", turns: ['yellow', 'green', 'red', 'blue', 'purple']},
    {name: "Shobu", requiredPlayers: 2, poster: "/assets/Shobu-Poster.png", turns: ['w', 'b']}
];

// when adding the room browsing uncomment the fetchRooms function in useEffects and add the room card component
export default function HomePage(){
    // fetch all the empty rooms
    const { currentUser } = useContext(AuthContext)
    const [rooms, setRooms] = useState([]);

    const fetchRooms = async () => {
        try {
            const rooms = await axios.get(`${API_URL}/api/room/get-rooms`);
            setRooms([...rooms.data]);
        } catch (err) {
            console.log(err)
        }
    };

    useEffect(() => {
        if (currentUser) {
            toast.success(`Welcome, ${currentUser.username}!`, {
                position: "top-right",
                autoClose: 1000,
                backgroundColor: "255, 0, 0",
                style: {
                    backgroundColor: '#b7ddff',
                },            
                progressStyle: { 
                    backgroundColor: '#84c6ff',
                },
                icon: <span style={{ fontSize: '1.4em' }}>🎉</span>
            })
        }
    }, [currentUser])

    useEffect(() => {
        const leaveRoomAndFetch = async () => {
            const room = JSON.parse(localStorage.getItem('room'));
            if (currentUser && currentUser.id && room) {
                await callLeaveRoom(room.roomId, currentUser.id);
            }
            // fetchRooms();
        };
        leaveRoomAndFetch();
    }, []);    
    
    return (
        <div className='flex flex-col h-screen bg-[#cfe9ff]'>
            <Header/>
            {/* when adding the room browsing add lg:grid-cols-[70%_30%] instead of lg:grid-cols-[100%] and add md:grid-cols-2*/}
            <div className='grid lg:grid-cols-[100%] grid-cols-1 flex-grow-1 overflow-y-auto'>
                <div className="overflow-x-hidden overscroll-auto">
                    <div className='dynamic-grid gap-6 p-8 overflow-x-hidden'>
                        {Games.map((game) => {
                            return <GameCard key={game.name} gameInfo={game}/>
                        })}
                        <div className="p-4 bg-primary-blue flex flex-col h-full w-full gap-2 rounded-xl">
                            <div className="flex flex-col h-full w-full justify-center items-center p-8">
                                <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
                                <ul className="list-disc pl-6 space-y-2 text-lg mb-8">
                                    <li>Stratego board game</li>
                                    <li>Timers for turns</li>
                                    <li>Room browsing</li>
                                </ul>
                            </div>
                            <hr />

                            <div className="flex flex-col gap-4">
                                <button 
                                    className="flex items-center justify-center gap-2 back-drop-button bg-red-500 hover:bg-red-600 rounded-xl w-full h-10 button-font focus:outline-none text-white"
                                >
                                    💖
                                    Donate
                                </button>
                                <p className="text-sm text-center text-gray-700">
                                    Donate to keep the servers up and help me with college tuition
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="overscroll-auto sticky top-0 overflow-x-hidden p-8 md:flex hidden gap-6 flex-col">
                    {rooms.map(room => {
                        return <RoomCard key={room.hostSocketId} host={room.participants[0]} roomSocketId={room.hostSocketId} requiredPlayers={room.requiredParticipants} currentPlayers={room.participants.length} game={room.gameBeingPlayed}/>
                    })}
                </div> */}
            </div>
        </div>
    );
}
