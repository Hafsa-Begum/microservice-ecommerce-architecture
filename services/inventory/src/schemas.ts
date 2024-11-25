import {z} from 'zod'

export const InventoryCreateDTOSchema = z.object({
    sku: z.string(),
    productId: z.string(),
    quantity: z.number().int().optional().default(0)
})