import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import { API_URL } from "../../config"
export default function SignUpPage(){
    const [err, setErr] = useState(null)
    const [imageURL, setImageURL] = useState(null)
    const imageInputTag = useRef(null)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErr(null)
        const formdata = new FormData(e.target)
        const username = formdata.get("username")
        const password = formdata.get("password")
    
        try {
            const response = await axios.post(`${API_URL}/api/auth/sign-up`, {
                username,
                password
            })
            if (response.status == 201){
                navigate("/login")
            }
        } catch (error) {
            setErr(error.response.data.message)
        }
    }
    
    const handleSelectImage = (event) => {
        event.preventDefault()
        imageInputTag.current.click()
    }

    const handleFileChange = (event) => {
        const image = event.target.files[0]
        
        if(image.size <= 2000000){
            const url = URL.createObjectURL(image)
            setImageURL(url)
        }
    }
    return (
        <div className="flex items-center justify-center h-screen w-screen bg-[url('/assets/ogin-page-iustration.png')] bg-contain bg-center bg-[#aae9fb] bg-no-repeat">
           <div className="bg-blue-500 p-8 rounded-lg">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
                    <input name="username" type="text" placeholder="Username" required maxLength={12} className="rounded-lg px-4 py-1 font-semibold text-md outline-none border-white border-2 focus:border-blue-500"/>
                    <input name="password" type="password" placeholder="Password" required className="rounded-lg px-4 py-1 font-semibold text-md outline-none border-white border-2 focus:border-blue-500"/>
                    {err && <span className="text-sm text-black font-semibold px-2">{err}</span>}
                    {/* IMAGE UPLOAD  uncomment when adding image upload */}
                    {/* <div className="p-4 w-full bg-white rounded-lg">
                        <input name="image" ref={imageInputTag} type="file" id="image" accept="image/*" className="hidden" onChange={handleFileChange}/>
                        <div className="aspect-square relative w-full h-[220px] gap-2 mb-4 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 flex-col" data-img="">
                            <p className="text-lg font-semibold">Upload Image</p>
                            <p className="px-8 text-[#999] text-sm font-semibold">Image size must be less than <span>2MB</span></p>
                            {imageURL && <img src={imageURL} alt="Selected" className="absolute top-0 w-full h-full left-0 transition ease-out delay-100 hover:scale-110 duration-300"/>}
                        </div>
                        <button onClick={handleSelectImage} className="select-image bg-primary-yellow block w-full px-[16px] py-[8px] rounded-lg font-semibold text-lg cursor-pointer transition ease-out delay-100 hover:scale-110 hover:bg-yellow-200 duration-300">Select Image</button>
                    </div> */}
                    <button type="submit" className="back-drop-button mx-auto bg-primary-yellow button-font rounded-md px-4 py-1 focus:outline-none">Sign-Up</button>
                </form>
                <hr />
                <button 
                    onClick={() => navigate('/login')} 
                    className="button-font bg-white mt-4 px-4 py-2 rounded-md w-full back-drop shadow-md shadow-blue-500"
                >
                    LogIn
                </button>
           </div>
        </div>
    )
}
