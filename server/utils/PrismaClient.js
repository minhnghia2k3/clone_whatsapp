import { PrismaClient } from "@prisma/client";

// PrismaClient ia a util allows us to connect to the database, provides ORM functionality

let prismaInstance = null;

function getPrismaInstance() {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient();
    }
    return prismaInstance;
}
export default getPrismaInstance;
