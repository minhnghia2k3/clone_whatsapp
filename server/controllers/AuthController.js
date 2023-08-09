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
        await prisma.user.create({
            data: { email, name, about, profilePicture }
        })
        res.json({ msg: "User created successfully.", status: true })
    } catch (err) {
        next(err)
    }
}