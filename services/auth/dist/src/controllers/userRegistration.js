"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@/config");
const userRegistration = async (req, res, next) => {
    try {
        //validate parsedbody
        const parsedBody = schemas_1.UserCreateSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({
                message: 'Invalid request body',
                error: parsedBody.error.errors
            });
            return;
        }
        //check if authUserId already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: parsedBody.data.email }
        });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        //hash password
        const salt = await bcryptjs_1.default.genSaltSync(10);
        const hashedPassword = await bcryptjs_1.default.hash(parsedBody.data.password, salt);
        //create auth user
        const user = await prisma_1.default.user.create({
            data: {
                ...parsedBody.data,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                verified: true
            }
        });
        console.log('User created successfully', user);
        //create user profile by calling user service
        await axios_1.default.post(`${config_1.USER_SERVICE}/users`, {
            authUserId: user.id,
            name: user.name,
            email: user.email
        });
        res.status(201).json(user);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = userRegistration;
//# sourceMappingURL=userRegistration.js.map