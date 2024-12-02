import prisma from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import {Request, Response, NextFunction} from 'express'

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const createUser:AsyncRequestHandler = async(req, res, next) =>{
    try {
        // validate request body
        const parsedBody = UserCreateSchema.safeParse(req.body);
        if(!parsedBody.success){
            res.status(400).json({message: parsedBody.error.errors})
            return;
        }
        //check if authUserId already exists
        const existingUser = await prisma.user.findUnique({
            where: {authUserId: parsedBody.data.authUserId}
        });
        if(existingUser){
            res.status(400).json({message:'User already exists'})
            return;
        }

        //create a ne user
        const user = await prisma.user.create({
            data: parsedBody.data
        })
        res.status(201).json(user)
        return;
    } catch (error) {
        next(error);
    }
}

export default createUser;