import prisma from "@/prisma";
import { UserLoginSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginAttemt } from "@prisma/client";

type LoginHistory = {
    userId: string;
    ipAddress: string | undefined;
    userAgent: string | undefined;
    attempt: LoginAttemt
}

const createLoginHistory = async(info:LoginHistory)=>{
    await prisma.loginHistory.create({
        data:{
            userId: info.userId,
            ipAddress: info.ipAddress,
            userAgent: info.userAgent,
            attempt: info.attempt
        }
    })
}

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction)=> Promise<void>;

const userLogin:AsyncRequestHandler = async(req, res, next)=>{
    try {
        const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || '';
        const userAgent = req.headers['user-agent'] || '';
        //validate parsedbody
        const parsedBody = UserLoginSchema.safeParse(req.body);
        if(!parsedBody.success){
            res.status(400).json({
                error: parsedBody.error.errors})
            return;
        }
        //check if authUserId already exists
        const user = await prisma.user.findUnique({
            where: {email: parsedBody.data.email}
        });
        if(!user){
            res.status(400).json({message:'Invalid credentials'})
            return;
        }

        //compare password
        const isPasswordMatched = await bcrypt.compare(parsedBody.data.password, user.password)
        if(!isPasswordMatched){
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED'
            })

            res.status(400).json({message:'Invalid credentials'})
            return;
        }

        if(!user.verified){
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED'
            })
            res.status(400).json({message:'User not verified'})
            return;
        }

        if(user.status !== 'ACTIVE'){
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED'
            })
            res.status(400).json({message:`Your account is ${user.status.toLocaleLowerCase()}`})
            return;
        }

        //generate accessToken
        const accessToken = jwt.sign(
            {userId: user.id, email: user.email, name:user.name, role: user.role},
            process.env.JWT_SECRET ?? 'MySuperSecret',
            {expiresIn: '1h'}
            )
        
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'SUCCESS'
            })
        res.status(200).json(accessToken)
        
        
    } catch (error) {
        next(error)
    }
}

export default userLogin;