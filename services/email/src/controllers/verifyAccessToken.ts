import prisma from '@/prisma';
import { AccessTokenSchema } from '@/schemas';
import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction)=> Promise<void>;

const verifyAccessToken:AsyncRequestHandler = async(req, res, next)=>{
    try {
        //validate request body
        const parsedBody = AccessTokenSchema.safeParse(req.body);
        if(!parsedBody.success){
            res.status(400).json({
                error: parsedBody.error.errors})
            return;
        }

        const {accessToken} = parsedBody.data;
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string)

        const user = await prisma.user.findUnique({
            where: {id: (decoded as any).userId},
            select:{
                id: true,
                email: true,
                name: true,
                role: true
            }
        })
        if(!user){
            res.status(401).json({message: 'Unauthorised.'})
            return;
        }
        res.status(200).json({message: 'Authorised.', user})
            return;
        
    } catch (error) {
        next(error)
    }
}

export default verifyAccessToken;