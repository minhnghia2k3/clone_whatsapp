import getPrismaInstance from "../utils/PrismaClient.js"

const prisma = getPrismaInstance();

export const checkUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.json({ msg: "Email is required.", status: false })
        } else {
            let user = await prisma.user.findUnique({ where: { email } })
            if (!user) {
                res.json({ msg: "User not found.", status: false })
            } else {
                res.json({ msg: "User found.", status: true, data: user })
            }
        }
    } catch (err) {
        next(err);
    }
}

export const onBoardUser = async (req, res, next) => {
    try {
        const { email, name, about, image: profilePicture } = req.body;
        if (!email || !name || !profilePicture) {
            res.send("Email, name and profile picture are required.")
        }
        const user = await prisma.user.create({
            data: { email, name, about, profilePicture }
        })
        res.json({ msg: "User created successfully.", status: true, user })
    } catch (err) {
        next(err)
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        // return Array of users
        const users = await prisma.user.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
                about: true
            }
        })

        const usersGroupedByInitialLetter = {}

        users.forEach(user => {
            const initialLetter = user.name.charAt(0).toUpperCase(); // Nghia => N
            // Example: usersGroupedByInitialLetter["N"] = [Nghia, Nghia2]
            if (!usersGroupedByInitialLetter[initialLetter]) {
                usersGroupedByInitialLetter[initialLetter] = []
            }
            usersGroupedByInitialLetter[initialLetter].push(user)
        })
        // Example data: { N: [Nghia, Nghia2], A: [Anh, Anh2] }
        return res.status(200).send({ users: usersGroupedByInitialLetter })
    } catch (err) {
        next(err)
    }
}