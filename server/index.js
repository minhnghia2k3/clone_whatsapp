import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js"
import MessageRoutes from "./routes/MessageRoutes.js"
import { Server } from "socket.io";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


// Router

app.use("/uploads/recordings", express.static("uploads/recordings"))
app.use("/uploads/images", express.static("uploads/images")) // pointing to uploads/images folder
app.use('/api/auth', AuthRoutes) // /api/auth/check-user
app.use('/api/messages', MessageRoutes)

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on http://localhost:${process.env.PORT} !`)
})

const io = new Server(server, {
    cors: {
        origin: "*" // IMPORTANT
    }
})

global.onlineUsers = new Map();
io.on("connection", socket => {
    global.chatSocket = socket

    // [SOCKET.ON] listen event 'add-user' from client
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    })

    socket.on("send-msg", (data) => {
        // get socket id of user to send message
        const sendUserSocket = onlineUsers.get(data.to);
        // if user is online emitting event to user
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("receive-msg", {
                from: data.from,
                message: data.message
            })
        }
    })

    socket.on("outgoing-voice-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("incoming-voice-call", {
                from: data.from,
                roomId: data.roomId,
                callType: data.callType
            })
        }
    })

    socket.on("outgoing-video-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.to)
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("incoming-video-call", {
                from: data.from,
                roomId: data.roomId,
                callType: data.callType
            })
        }
    })

    socket.on("reject-voice-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.from)
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("voice-call-rejected");
        }
    })

    socket.on("reject-video-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.from)
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("video-call-rejected");
        }
    })

    socket.on("accept-incoming-call", (id) => {
        const sendUserSocket = onlineUsers.get(id);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("accept-call");
        }
    })
})