import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const getInventoryById:AsyncRequestHandler = async(req, res, next) =>{
    try {
        const {id} = req.params;
        const inventory = await prisma.inventory.findUnique({
            where: { id },
            select: {
                quantity: true
            }
        })

        if(!inventory){
            res.status(404).json({message: "Inventory not found"})
            return;
        }

        res.status(200).json(inventory);
        return;
    } catch (error) {
        next(error)
    }
}
export default getInventoryById;