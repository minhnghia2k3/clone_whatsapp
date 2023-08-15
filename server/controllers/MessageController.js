
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
            console.log("Request file: ", req.file)
            const date = Date.now();
            const fileName = "uploads/images/" + date + req.file.originalname;
            console.log(req.file.path, fileName)
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