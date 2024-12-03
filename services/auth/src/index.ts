import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { userLogin, userRegistration, verifyAccessToken } from './controllers';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))



app.get('/health', (req, res)=>{
    res.status(200).json({status:'Up'})
})

//control access to api via origin
// app.use((req, res, next) => {
// 	const allowedOrigins = ['http://localhost:8082', 'http://127.0.0.1:8082'];
// 	const origin = req.headers.origin || '';

// 	if (allowedOrigins.includes(origin)) {
// 		res.setHeader('Access-Control-Allow-Origin', origin);
// 		next();
// 	} else {
// 		res.status(403).json({ message: 'Forbidden' });
// 	}
// });

//routes
app.post('/auth/register', userRegistration);
app.post('/auth/login', userLogin);
app.post('/auth/verify-token', verifyAccessToken);


app.use((_req, res)=>{
    res.status(404).json({message:'Not found'})
})
app.use((err,_req, res, _next)=>{
    console.error(err.stack)
    res.status(500).json({message:'Internal server error'})
})

const port = process.env.PORT || 4003
const serviceName = process.env.SERVICE_NAME || 'Auth-Service'

app.listen(port,()=>{
    console.log(`${serviceName} is running on port ${port}`)
})