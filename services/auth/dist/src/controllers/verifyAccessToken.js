"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyAccessToken = async (req, res, next) => {
    try {
        //validate request body
        const parsedBody = schemas_1.AccessTokenSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({
                error: parsedBody.error.errors
            });
            return;
        }
        const { accessToken } = parsedBody.data;
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        if (!user) {
            res.status(401).json({ message: 'Unauthorised.' });
            return;
        }
        res.status(200).json({ message: 'Authorised.', user });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = verifyAccessToken;
//# sourceMappingURL=verifyAccessToken.js.map