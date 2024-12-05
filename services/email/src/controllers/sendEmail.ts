import { defaultSender, transporter } from "@/config";
import prisma from "@/prisma";
import { EmailCreateSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const sendEmail:AsyncRequestHandler = async(req, res, next)=>{
    try {
        //validate parsedbody
        const parsedBody = EmailCreateSchema.safeParse(req.body);
        if(!parsedBody.success){
            res.status(400).json({
                error: parsedBody.error.errors})
            return;
        }
        //create email option
        const { sender, recipient, source, subject, body} = parsedBody.data;
        const from = sender || defaultSender;
        const emailOptions = {
            from,
            to: recipient,
            subject,
            text: body
        }

        //send email
        const {rejected} = await transporter.sendMail(emailOptions)
        if(rejected.length){
            console.log('Email rejected', rejected)
            res.status(500).json({message: 'Failed.'});
            return;
        }
        await prisma.email.create({
            data:{
                sender: from,
                recipient,
                subject,
                body,
                source
            }
        })
        res.status(200).json({message: 'Email sent.'});
        return;
    } catch (error) {
        next(error);
    }
}

export default sendEmail;