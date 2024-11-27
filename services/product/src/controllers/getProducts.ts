import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";


type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

const getProducts:AsyncRequestHandler = async(req, res, next) =>{
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                inventoryId: true
            }
        })
        res.status(200).json({data: products})
    } catch (error) {
        next(error)
    }
}

export default getProducts;