import { Users2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { useContext, useRef } from 'react';
import { callCreateRoom, callJoinRoom } from '../../helpefunctions/roomApiFunctions';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function GameCard(props){
    const {name, requiredPlayers, poster, turns} = props.gameInfo
    const roomSocketId = useRef(null)
    const { currentUser } = useContext(AuthContext)
    const navigate = useNavigate()
    
    const createRoom = async () => {
        if (!currentUser) {
            
            navigate(`/login`)
            toast.success(`gotta login`, {
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
        const roomNum = String(Math.floor(Math.random() * 1000000))
        const res = await callCreateRoom(roomNum, name, requiredPlayers, false, currentUser.id, turns)
        if (res.status == 201) {
            navigate(`/waiting-room/${name}/${roomNum}`)
        }
    }

    const joinRoom = async () => {
        // check if it is a re-join will be if the user was in room id == this id       
        const res = await callJoinRoom(roomSocketId.current.value, currentUser.id)
       
        if (res.status == 201) {
            navigate(`/waiting-room/${name}/${roomSocketId.current.value}`)
        }
        else {
            toast.success(`${res.message}`, {
                position: "top-right",
                autoClose: 1000,
                backgroundColor: "255, 0, 0",
                style: {
                    backgroundColor: '#b7ddff',
                },            
                progressStyle: { 
                    backgroundColor: '#84c6ff',
                },
                icon: <span style={{ fontSize: '1.4em' }}>🚩</span>
            })
        }
    }
    
    return (
        <div className="p-4 bg-primary-blue flex flex-col h-full w-full gap-2 rounded-xl">
            <div className="flex flex-col h-full w-full">
                <img src={poster} className="object-contain w-[100%] h-[100%] rounded-lg"  alt="" />
            </div>
            <hr />

            <div className="flex flex-col gap-6">
              
                <button onClick={createRoom} className="flex-shrink back-drop-button bg-primary-yellow rounded-xl w-full h-10  button-font focus:outline-none">Create Room</button>
              
                <div className="flex flex-row gap-1">
                    <button onClick={joinRoom} type="submit" className="flex-shrink whitespace-nowrap back-drop-button bg-primary-yellow rounded-xl h-10 px-2 -translate-y-[8px] button-font focus:outline-none">Join Room</button>
                    <input ref={roomSocketId} type="text" className="rounded-lg px-2 w-full focus:outline-none"/>
                </div>
            </div>
            <hr />

            <div className="flex gap-2 items-center button-font">
                <div className='text-xl bg-secondary-blue whitespace-nowrap rounded-xl py-1 px-2'>
                    {name}
                </div>
                <div className='flex flex-row gap-2 text-xl items-center bg-secondary-blue rounded-xl py-1 px-2'>
                    {requiredPlayers}<Users2 size={24}/>
                </div>
                {/* <div className="flex items-center gap-1 bg-secondary-blue rounded-xl py-1 px-2">
                    <label className="cursor-pointer" htmlFor="private-checkbox">Private</label>
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-primary-yellow cursor-pointer"
                        aria-label="Make room private"
                    />
                </div> */}
            </div>
        </div>
    )
}