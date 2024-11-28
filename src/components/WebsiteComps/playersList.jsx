
import { useTurn } from "../../context/useTurn";

export default function PlayersList(props){
    const players = props.players;
    const { currentTurnId } = useTurn();

    return (
        players.map((player) => {
            return (
                <div 
                    key={player.username} 
                    className={`flex items-center gap-1 rounded-lg p-2 ${
                        currentTurnId == player._id 
                            ? 'bg-red-400 transition-all duration-500 ease-out' 
                            : 'bg-white'
                    }`}
                >
                    <img src="/assets/defaultProfilePic.jpg" alt="" className="rounded-md h-[40px] w-[40px]" />
                    <p className="font-semibold text-sm">{player.username}</p>
                </div>
            );
        })
    );
}
