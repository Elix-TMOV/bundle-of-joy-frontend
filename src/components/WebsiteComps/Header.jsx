import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { API_URL } from "../../config"
import axios from "axios"

import { useNavigate, Link } from "react-router-dom"
export default function Header(){
    const { currentUser, updateUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleLogOut = async (e)=>{
        e.preventDefault()
        updateUser(null)
        const res = await axios.get(`${API_URL}/api/auth/log-out`);        console.log(res)
        if (res.status == 200) {
            navigate('/')
        }
    }

    return (
        <header className="flex items-center justify-between px-4 py-2 bg-primary-blue w-full h-24">
            <img src="/assets/bundle-of-joy.png" alt="" className="h-full aspect-video flex flex-shrink-0"/>
            
            <div className="flex gap-4 items-center">
                {!currentUser && <Link to="/login" className="flex-shrink back-drop-button bg-primary-yellow rounded-xl py-3 px-4 button-font">Login</Link>}
                {!currentUser && <Link to="/sign-up" className="flex-shrink bg-primary-yellow back-drop-button box-border rounded-xl py-3 px-4 button-font">Singup</Link>}
                {currentUser && <a onClick={handleLogOut} className="flex-shrink back-drop-button bg-primary-yellow rounded-xl py-3 px-4 button-font">Logout</a>}
                <div className="flex-shrink flex flex-row h-12 bg-secondary-blue items-center justify-center gap-1 rounded-l-full rounded-r-full">
                    <div className="h-10 w-10">
                        <img src="/assets/defaultProfilePic.jpg" alt="" className="object-contain ml-1 rounded-full"/>
                    </div>
                    <p className="px-3 font-semibold text-sm">{currentUser ? currentUser.username : "Guest"}</p>
                </div>
                
            </div>
        </header>
    )
}
