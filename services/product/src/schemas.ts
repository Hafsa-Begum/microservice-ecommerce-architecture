import {Status} from '@prisma/client'
import {z} from 'zod'

const ProductCreateDTOSchema = z.object({
    sku: z.string().min(3).max(10),
    name: z.string().min(3).max(256),
    description: z.string().max(1000).optional(),
    price: z.number().optional().default(0),
    status: z.nativeEnum(Status).optional().default(Status.DRAFT)
})