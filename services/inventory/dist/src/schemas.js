"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCreateDTOSchema = void 0;
const zod_1 = require("zod");
exports.InventoryCreateDTOSchema = zod_1.z.object({
    sku: zod_1.z.string(),
    productId: zod_1.z.string(),
    quantity: zod_1.z.number().int().optional().default(0)
});
//# sourceMappingURL=schemas.js.map