import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { createInventory,
updateInventory,
getInventoryById,
getInventoryDetails
} from './controllers';



dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))



app.get('/health', (req, res)=>{
    res.status(200).json({status:'Up'})
})

//routes
app.get('/inventories/:id/details', getInventoryDetails)
app.get('/inventories/:id', getInventoryById)
app.put('/inventories/:id', updateInventory)
app.post('/inventories', createInventory)

app.use((_req, res)=>{
    res.status(404).json({message:'Not found'})
})
app.use((err,_req, res, _next)=>{
    console.error(err.stack)
    res.status(500).json({message:'Internal server error'})
})

const port = process.env.PORT || 4002
const serviceName = process.env.SERVICE_NAME || 'Inventory-Service'

app.listen(port,()=>{
    console.log(`${serviceName} is running on port ${port}`)
})