import { EMAIL_SERVICE } from '@/config';
import prisma from '@/prisma';
import { EmailVerificationSchema} from '@/schemas';
import axios from 'axios';
import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction)=> Promise<void>;

const verifyEmail:AsyncRequestHandler = async(req, res, next)=>{
    try {
        //validate request body
        const parsedBody = EmailVerificationSchema.safeParse(req.body);
        if(!parsedBody.success){
            res.status(400).json({
                error: parsedBody.error.errors
            })
            return;
        }

        //check if user exist with email
        const user = await prisma.user.findUnique({
            where:{ email: parsedBody.data?.email}
        })
        if(!user){
            res.status(404).json({
                message: 'User not found.'
            })
            return;
        }
        //find verification code
        const verificationCode = await prisma.verificationCode.findFirst({
            where:{
                userId: user.id,
                code: parsedBody.data.code
            }
        })
        if(!verificationCode){
            res.status(404).json({
                message: 'Invalid verification code.'
            })
            return;
        }
        //if code has expired
        if(verificationCode.expiredAt < new Date()){
            res.status(400).json({
                message: 'Verification code expired.'
            })
            return;
        }
        //update user status to verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verified: true,
                status: 'ACTIVE'
            }
        })
        //send success email
        await axios.post(`${EMAIL_SERVICE}/emails/send`,{
            recipient: user.email,
            subject: 'Email Verified',
            body: 'Your email has been verified successfully.',
            source: 'verify-email'
        })
        res.status(200).json({
            message: 'Email verified successfully.'
        });
        return;
    } catch (error) {
        next(error)
    }
}

export default verifyEmail;