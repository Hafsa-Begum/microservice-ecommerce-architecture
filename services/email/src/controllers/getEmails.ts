import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const getEmails:AsyncRequestHandler = async (_req, res, next) => {
	try {
		const emails = await prisma.email.findMany();
		res.json(emails);
        return;
	} catch (error) {
		next(error);
	}
};

export default getEmails;