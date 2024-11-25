"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const createInventory = async (req, res, next) => {
    try {
        const parsedBody = schemas_1.InventoryCreateDTOSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }
        const inventory = await prisma_1.default.inventory.create({
            data: {
                ...parsedBody.data,
                histories: {
                    create: {
                        actionType: 'IN',
                        quantityChanged: parsedBody.data.quantity,
                        newQuantity: parsedBody.data.quantity,
                        lastQuantity: 0
                    }
                },
            },
            select: {
                id: true,
                quantity: true
            }
        });
        return res.status(201).json(inventory);
    }
    catch (error) {
        next(error);
    }
};
exports.default = createInventory;
//# sourceMappingURL=createInventory.js.map