import axios from "axios"
import { API_URL } from "../config"
export const callCreateRoom = async (hostSocketId, gameBeingPlayed, requiredParticipants, isPrivate, hostUserId, turns) => {
    try {
        const res = await axios.post(`${API_URL}/api/room/create-room`, {
            hostSocketId,
            gameBeingPlayed,
            requiredParticipants,
            isPrivate,
            hostUserId,
            turns
        })
        return {status: res.status, message: res.message}
    }
    catch (err) {
        return err
    }
}


export const callJoinRoom = async (hostSocketId, userId) => {
    try {
        const res = await axios.post(`${API_URL}/api/room/join-room`, {
            hostSocketId,
            userId,
        });
        // Return the status and message from the response data
        return { status: res.status, message: res.data.message };
    } catch (err) {
        // Check if the error has a response (indicating it came from the backend)
        if (err.response) {
            // Return the error status and message from the backend
            return { status: err.response.status, message: err.response.data.message };
        } else {
            // Fallback message for network or other unexpected errors
            return { status: 500, message: 'An unexpected error occurred' };
        }
    }
};


export const callLeaveRoom = async (hostSocketId, userId) => {
    try {
        const res = await axios.post(`${API_URL}/api/room/leave-room`, {
            hostSocketId,
            userId
        })
        return {status: res.status, message: res.message}
    }
    catch (err) {
        return err
    }
}
