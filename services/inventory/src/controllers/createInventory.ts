import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { InventoryCreateDTOSchema } from "@/schemas";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
const createInventory: AsyncRequestHandler = async( 
    req, 
    res,
    next
    )=>{
    try {
        const parsedBody = InventoryCreateDTOSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({error: parsedBody.error.errors})
            return;
        }

        const inventory = await prisma.inventory.create({
            data:{
                ...parsedBody.data,
                histories:{ 
                create:{
                    actionType: 'IN',
                    quantityChanged: parsedBody.data.quantity,
                    newQuantity: parsedBody.data.quantity,
                    lastQuantity: 0
                }},
            },
            select:{
               id: true,
               quantity: true

            }
        })
        res.status(201).json(inventory)
    } catch (error) {
        next(error)
    }
}

export default createInventory;