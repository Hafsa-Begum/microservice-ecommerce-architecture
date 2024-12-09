import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
	// host: process.env.SMTP_HOST || 'host.docker.internal',
	host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
	port: parseInt(process.env.SMTP_PORT || '1025'),
});

export const defaultSender = process.env.DEFAULT_SENDER_EMAIL || 'hafsagood@gmail.com'