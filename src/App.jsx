
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './components/WebsiteComps/HomePage'
import LogInPage from './components/WebsiteComps/LogInPage'
import SignUpPage from './components/WebsiteComps/SignUpPage'
import { SocketContextProvider } from './context/SocketContext'
import { AuthContextProvider } from './context/AuthContext'
import WaitingRoom from './components/WebsiteComps/WaitingRoom'
import { ToastContainer } from 'react-toastify';



function App() {
  return (
    <AuthContextProvider>
      <SocketContextProvider>
        <BrowserRouter>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path='/sign-up' element={<SignUpPage/>}/>
            <Route path="/login" element={<LogInPage/>}/>
            <Route path="/waiting-room/:gameName/:roomSocketId" element={<WaitingRoom/>}/>
            <Route path="/chess-board/:roomSocketId" element={<WaitingRoom/>}/>
          </Routes>
        </BrowserRouter>
      </SocketContextProvider>
    </AuthContextProvider>
   
  )
}


export default App
