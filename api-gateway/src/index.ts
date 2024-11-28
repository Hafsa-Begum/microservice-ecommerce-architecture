import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { configureRoutes } from './utils';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))



app.get('/health', (req, res)=>{
    res.status(200).json({status:'Up'})
})

//routes
configureRoutes(app)

app.use((_req, res)=>{
    res.status(404).json({message:'Not found'})
})
app.use((err,_req, res, _next)=>{
    console.error(err.stack)
    res.status(500).json({message:'Internal server error'})
})

const port = process.env.PORT || 8082

app.listen(port,()=>{
    console.log(`Api gateway is running on port ${port}`)
})