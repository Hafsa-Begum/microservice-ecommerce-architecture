"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createLoginHistory = async (info) => {
    await prisma_1.default.loginHistory.create({
        data: {
            userId: info.userId,
            ipAddress: info.ipAddress,
            userAgent: info.userAgent,
            attempt: info.attempt
        }
    });
};
const userLogin = async (req, res, next) => {
    try {
        const ipAddress = req.headers['x-forwarded-for'] || req.ip || '';
        const userAgent = req.headers['user-agent'] || '';
        //validate parsedbody
        const parsedBody = schemas_1.UserLoginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({
                error: parsedBody.error.errors
            });
            return;
        }
        //check if authUserId already exists
        const user = await prisma_1.default.user.findUnique({
            where: { email: parsedBody.data.email }
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        //compare password
        const isPasswordMatched = await bcryptjs_1.default.compare(parsedBody.data.password, user.password);
        if (!isPasswordMatched) {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED'
            });
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        if (!user.verified) {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED'
            });
            res.status(400).json({ message: 'User not verified' });
            return;
        }
        if (user.status !== 'ACTIVE') {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: 'FAILED'
            });
            res.status(400).json({ message: `Your account is ${user.status.toLocaleLowerCase()}` });
            return;
        }
        //generate accessToken
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET ?? 'MySuperSecret', { expiresIn: '1h' });
        await createLoginHistory({
            userId: user.id,
            ipAddress,
            userAgent,
            attempt: 'SUCCESS'
        });
        res.status(200).json(accessToken);
    }
    catch (error) {
        next(error);
    }
};
exports.default = userLogin;
//# sourceMappingURL=userLogin.js.map