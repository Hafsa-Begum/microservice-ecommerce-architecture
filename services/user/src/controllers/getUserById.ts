import prisma from "@/prisma";
import { User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";


type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
// /users/:id?fields=id|authUserId
const getByUserId:AsyncRequestHandler = async(req, res, next)=>{
    try {
        const {id} = req.params;
        const field = req.query.field as string;
        let user: User | null = null;
        if(field === 'authUserId'){
            user = await prisma.user.findUnique({
                where: { authUserId: id}
            })
        }
        else{
            user = await prisma.user.findUnique({
                where: { id }
            })
        }
        if(!user){
            res.status(404).json({message: 'User not found.'})
            return;
        }
        res.status(201).json(user)
        return;
    } catch (error) {
        next(error)
    }
}

export default getByUserId;