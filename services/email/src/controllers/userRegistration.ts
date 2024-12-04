import prisma from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import {Request, Response, NextFunction} from 'express'
import bcrypt from 'bcryptjs'
import axios from 'axios';
import { USER_SERVICE } from '@/config';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const userRegistration: AsyncRequestHandler = async(req, res, next)=>{
    try {
        //validate parsedbody
        const parsedBody = UserCreateSchema.safeParse(req.body);
        if(!parsedBody.success){
            res.status(400).json({
                message: 'Invalid request body',
                error: parsedBody.error.errors})
            return;
        }
        //check if authUserId already exists
        const existingUser = await prisma.user.findUnique({
            where: {email: parsedBody.data.email}
        });
        if(existingUser){
            res.status(400).json({message:'User already exists'})
            return;
        }

        //hash password
        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);

        //create auth user
        const user = await prisma.user.create({
            data: {
                ...parsedBody.data,
                password: hashedPassword
            },
            select:{
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                verified: true
            }
        })
        console.log('User created successfully', user)

        //create user profile by calling user service
        await axios.post(`${USER_SERVICE}/users`, {
            authUserId: user.id,
            name: user.name,
            email: user.email
        })

        res.status(201).json(user);
        return;
    } catch (error) {
        next(error)
    }
}

export default userRegistration;