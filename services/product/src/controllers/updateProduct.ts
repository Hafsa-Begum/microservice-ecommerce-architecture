import prisma from "@/prisma";
import { ProductUpdateDTOSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (req:Request, res: Response, next:NextFunction) => Promise<void>;

const updateProduct:AsyncRequestHandler = async(req, res, next) =>{
    try {
        const {id} = req.params;
        const parsedBody = ProductUpdateDTOSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({
                error: parsedBody.error.errors})
            return;
        }
        const product = await prisma.product.findUnique({
            where:{id}
        })
        if(!product){
            res.status(404).json({message: 'Product not found'})
            return;
        }
        const updatedProduct = await prisma.product.update({
            where: {id},
            data: parsedBody.data
        })
        res.status(200).json({data: updatedProduct})
        return;
    } catch (error) {
        next(error)
    }
}
export default updateProduct;