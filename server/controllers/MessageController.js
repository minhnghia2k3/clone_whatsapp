
import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync } from "fs";


const prisma = getPrismaInstance();

export const addMessage = async (req, res, next) => {
    try {
        const { message, from, to } = req.body;
        const getUsers = onlineUsers.get(to);
        // console.log("Get users: ", onlineUsers.get(10))
        if (message && from && to) {
            const newMessage = await prisma.messages.create({
                data: {
                    message,
                    sender: { connect: { id: parseInt(from) } },
                    receiver: { connect: { id: parseInt(to) } },
                    messageStatus: getUsers ? "delivered" : "sent"
                },
                include: {
                    sender: true,
                    receiver: true
                }
            })
            return res.status(201).send({ message: newMessage })
        }
        return res.status(400).send("Message, from and to are required.")
    } catch (err) {
        next(err)
    }
}

export const getMessages = async (req, res, next) => {
    const { from, to } = req.params;
    // example: from: 10 ('Minh Nghia'), to: 3 ('Johnny Depth')
    try {
        const messages = await prisma.messages.findMany({
            where: {
                OR: [
                    {
                        senderId: parseInt(from),
                        receiverId: parseInt(to)
                    },
                    {
                        senderId: parseInt(to),
                        receiverId: parseInt(from)
                    }
                ]
            },
            orderBy: {
                id: 'asc'
            }
        })

        const unreadMessages = [];
        // mark all messages as read
        // minhnghia: 10, johnnydepth: 3
        messages.forEach((message, index) => {
            if (
                message.messageStatus !== "read" &&
                message.senderId === parseInt(to)
            ) {
                messages[index].messageStatus = "read";
                unreadMessages.push(message.id)
            }
        });
        // update unread messages -> read
        await prisma.messages.updateMany({
            // update all messages that have id in unreadMessages
            where: {
                id: { in: unreadMessages }
            },
            data: {
                messageStatus: "read"
            }
        })

        return res.status(200).json({ messages })

    } catch (err) {
        next(err)
    }
}

export const addImageMessage = async (req, res, next) => {
    try {
        if (req.file) {
            const date = Date.now();
            const fileName = "uploads/images/" + date + req.file.originalname;
            renameSync(req.file.path, fileName);

            const { from, to } = req.query;
            if (from && to) {
                const message = await prisma.messages.create({
                    data: {
                        message: fileName,
                        sender: { connect: { id: parseInt(from) } },
                        receiver: { connect: { id: parseInt(to) } },
                        type: "image"
                    }
                });
                return res.status(201).json({ message })
            }
            return res.status(400).send("From and to are required.")
        }
        return res.status(400).send("Image is required.")
    } catch (err) {
        next(err)
    }
}

export const addAudioMessage = async (req, res, next) => {
    try {
        if (req.file) {
            const date = Date.now()
            const fileName = "uploads/recordings/" + date + req.file.originalname;
            renameSync(req.file.path, fileName)

            const { from, to } = req.query
            if (from && to) {
                const message = await prisma.messages.create({
                    data: {
                        message: fileName,
                        sender: { connect: { id: parseInt(from) } },
                        receiver: { connect: { id: parseInt(to) } },
                        type: "audio"
                    }
                })
                return res.status(201).json({ message })
            }
            return res.status(400).send("From and to are required.")
        }
        return res.status(400).send("Audio is required.")

    } catch (err) {
        next(err)
    }
}


// Get the lastest message of each contact
// Example data: {users:[...messages, ...onlineUsers]}
export const getInitialContactswithMessages = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.from);
        // get sent msg & received msg from userId
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                sentMessages: {
                    include: {
                        receiver: true,
                        sender: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                receivedMessages: {
                    include: {
                        sender: true,
                        receiver: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }

            }
        })

        const messages = [...user.sentMessages, ...user.receivedMessages]
        // getTime() return: 1627777777777 (miliseconds)
        messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        // Map(key,value) data structure -> return non-repeat data
        const users = new Map();
        const messageStatusChange = []

        // 1. Minh Nghia
        // 2. Johnny Depth  
        messages.forEach((msg) => {
            const isSender = msg.senderId === userId;
            // if sender is 1. => calculatedId = 2.
            const calculatedId = isSender ? msg.receiverId : msg.senderId;
            if (msg.messageStatus === "sent") {
                messageStatusChange.push(msg.id)
            }
            // users.get(1) = undefined
            const {
                id,
                type,
                message,
                messageStatus,
                createdAt,
                senderId,
                receiverId
            } = msg;
            if (!users.get(calculatedId)) {

                let user = {
                    messageId: id,
                    type,
                    message,
                    messageStatus,
                    createdAt,
                    senderId,
                    receiverId,
                }

                if (isSender) {
                    user = {
                        ...user,
                        ...msg.receiver,
                        totalUnreadMessages: 0,
                    }
                } else {
                    user = {
                        ...user,
                        ...msg.sender,
                        totalUnreadMessages: messageStatus !== "read" ? 1 : 0
                    }
                }
                users.set(calculatedId, { ...user })
            }
            // if receiver didn't read msg
            else if (messageStatus !== "read" && !isSender) {
                const user = users.get(calculatedId);
                users.set(calculatedId, {
                    ...user,
                    totalUnreadMessages: user.totalUnreadMessages + 1,
                });
            }
        })

        if (messageStatusChange.length) {
            await prisma.messages.updateMany({
                where: {
                    id: { in: messageStatusChange }
                },
                data: {
                    messageStatus: "delivered"
                }
            })
        }

        return res.status(200).json({
            // example users: [{id: 1, name: "Minh Nghia", totalUnreadMessages: 0}, {id: 2, name: "Johnny Depth", totalUnreadMessages: 1}]
            users: Array.from(users.values()),
            // example onlineUsers: [1, 2]
            onlineUsers: Array.from(onlineUsers.keys())
        })
    } catch (err) {
        next(err)
    }
}