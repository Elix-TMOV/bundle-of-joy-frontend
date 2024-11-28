import { Users2  } from "lucide-react"
import { callJoinRoom } from "../../helpefunctions/roomApiFunctions"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function RoomCard(props){
    const {host, requiredPlayers, currentPlayers, roomSocketId, game} = props
    const { currentUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const joinRoom = async () => {
        const res = await callJoinRoom(roomSocketId, currentUser.id)
        if (res.status) {
            navigate(`/waiting-room/${game}/${roomSocketId}`)
        }
    }
    return (
       
            <div className=" p-2 rounded-lg w-full flex flex-col bg-primary-blue gap-2">
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col">
                        <img src="/assets/defaultProfilePic.jpg" alt="" className="max-h-20 max-w-20 flex-shrink-0 rounded-lg"/>
                    </div>
                    <div className="text-xl">
                        <p>Host: {host.username}</p>
                        <p>Playing: {game}</p>
                    </div>
                </div>
                <hr />
                <div className="flex flex-row justify-between gap-8 items-center">
                    <div className="flex gap-1 text-lg items-center bg-secondary-blue p-0.5 rounded-lg button-font">
                        <Users2 size={25} />{currentPlayers}/{requiredPlayers}
                    </div>
                    <button onClick={joinRoom} className="back-drop-button bg-primary-yellow h-full w-full rounded-lg p-0.5 mb-2 max-w-[100px] button-font">
                        Join
                    </button>
                </div>
            </div>
      
    )
}