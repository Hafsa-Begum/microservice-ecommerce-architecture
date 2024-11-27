import { INVENTORY_URL } from "@/config";
import prisma from "@/prisma";
import axios from "axios";
import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const getProductDetails:AsyncRequestHandler = async (req, res, next) =>{
    try {
        const {id} = req.params;
        const product = await prisma.product.findUnique({
            where:{id}
        })
        if(!product){
            res.status(404).json({message: 'Product not found'})
            return;
        }
        if(product?.inventoryId === null){
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
            console.log('product updated with inventory id', inventory.id)
            res.status(200).json({
                ...product,
                inventoryId: inventory.id,
                stock: inventory.quantity || 0,
                stockStatus: inventory.quantity > 0 ? 'In stock' : 'Out of stock'
            })
        }
        //fetch inventory
        const {data: inventory} = await axios.get(`${INVENTORY_URL}/inventories/${product?.inventoryId}`)
        res.status(200).json({
            ...product,
            stock: inventory.quantity || 0,
            stockStatus: inventory.quantity > 0 ? 'In stock' : 'Out of stock'
        })
    } catch (error) {
        next(error)
    }
}
export default getProductDetails;