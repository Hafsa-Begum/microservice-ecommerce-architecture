import { Request, Response, NextFunction } from "express";
import {ProductCreateDTOSchema} from '@/schemas'
import prisma from "@/prisma";
import axios from 'axios'
import { INVENTORY_URL } from "@/config";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const createProduct:AsyncRequestHandler = async(req, res, next) =>{
    try {
        const parsedBody = ProductCreateDTOSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({
                message: 'Invalid request body',
                error: parsedBody.error.errors})
            return;
        }
        //check if product with same sku already exist
        const existProduct = await prisma.product.findFirst({
            where: { sku: parsedBody.data.sku}   
        })

        if(existProduct){
            res.status(400).json({message: 'Product with same SKU already exist.'})
            return;
        }

        //create product
        const product = await prisma.product.create({
            data: parsedBody.data
        })
        console.log('product created successfully', product.id)

        //create inventory for the product
        const {data: inventory} = await axios.post(`${INVENTORY_URL}/inventories`,
        {
            productId: product.id,
            sku: product.sku
        })
        console.log('inventory created successfully', inventory.id)

        //update product, store inventory id
        await prisma.product.update({
            where: { id: product.id},
            data:{
                inventoryId: inventory.id
            }
        })
        res.status(201).json({...product, inventoryId: inventory.id})
        return;
    } catch (error) {
        next(error)
    }
}
export default createProduct;