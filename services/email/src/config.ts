import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'host.docker.internal',
	port: parseInt(process.env.SMTP_PORT || '1025'),
});