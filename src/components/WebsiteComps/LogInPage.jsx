import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../../config"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"

export default function LogInPage(){
    const [err, setErr] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const { updateUser } = useContext(AuthContext)
    const handleSubmit = async (e)=>{
        e.preventDefault()
        const formdata = new FormData(e.target)
        const username = formdata.get('username')
        const password = formdata.get('password')
        setErr(null)
        setIsLoading(true)
        try{
            const res = await axios.post(`${API_URL}/api/auth/log-in`, {
                username: username,
                password: password
            }, 
            {
                withCredentials: true
            })
            setIsLoading(false)
            updateUser(res.data)
            navigate('/')
        }
        catch (error) {
            setIsLoading(false)
            setErr(error.response.data.message)
        }
    }

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-[url('/assets/ogin-page-iustration.png')] bg-contain bg-center bg-[#aae9fb] bg-no-repeat">
           <div className="bg-blue-500 p-8 rounded-lg">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
                    <input name="username" type="text" placeholder="Username" className="rounded-lg px-4 py-1 font-semibold text-md outline-none border-white border-2 focus:border-blue-500"/>
                    <input name="password" type="password" placeholder="Password" className="rounded-lg px-4 py-1 font-semibold text-md outline-none border-white border-2 focus:border-blue-500"/>
                    {err && <span className="text-sm text-black font-semibold px-2 py-0">{err}</span>}
                    {!isLoading && <button type="submit" className="back-drop-button mx-auto bg-primary-yellow button-font rounded-md px-4 py-1">Login</button>}
                </form>
                
                <hr />
                <button 
                    onClick={() => navigate('/sign-up')} 
                    className="button-font bg-white mt-4 px-4 py-2 rounded-md w-full back-drop shadow-md shadow-blue-500"
                >
                    Sign Up
                </button>
           </div>
        </div>
    )
}