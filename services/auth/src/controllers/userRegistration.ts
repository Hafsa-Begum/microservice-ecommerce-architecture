import prisma from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import {Request, Response, NextFunction} from 'express'
import bcrypt from 'bcryptjs'
import axios from 'axios';
import { EMAIL_SERVICE, USER_SERVICE } from '@/config';

const generateVerificationCode = () => {
	// Get current timestamp in milliseconds
	const timestamp = new Date().getTime().toString();

	// Generate a random 2-digit number
	const randomNum = Math.floor(10 + Math.random() * 90); // Ensures 2-digit random number

	// Combine timestamp and random number and extract last 5 digits
	let code = (timestamp + randomNum).slice(-5);

	return code; //
};


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

        // generate verification code
		const code = generateVerificationCode();
		await prisma.verificationCode.create({
            data:{
                userId: user.id,
                code,
                expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
            }
        });
        console.log("verification code:", code)
		// send verification email
		// await axios.post(`${EMAIL_SERVICE}/emails/send`, {
		// 	recipient: user.email,
		// 	subject: 'Email Verification',
		// 	body: `Your verification code is ${code}`,
		// 	source: 'user-registration',
		// });
        res.status(201).json({
            message: 'User created. Check your email for verification code',
            user
        });
        return;
    } catch (error) {
        next(error)
    }
}

export default userRegistration;