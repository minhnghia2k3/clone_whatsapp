import getPrismaInstance from "../utils/PrismaClient.js"

export const checkUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        const prisma = getPrismaInstance();
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