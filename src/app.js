
import express from 'express';
const app = express();
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config.js"; // En ESM se importa asi
import session from 'express-session';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import mainRouter from './routes/mainRouter.js';
import apiUserRouter from './routes/api/apiUserRouter.js';
<<<<<<< HEAD
import apiProductRouter from './routes/api/apiProductRouter.js';
=======
import apiAddressRouter from './routes/api/apiAddressRouter.js';

>>>>>>> 86f6f95408ee59a6d8c31643bc8cfc861c0a4b37

// way to replace __dirname in es modules 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine','ejs');
app.set('views',path.resolve(__dirname,'./views'))
app.use(express.static('./public'))

// Para capturar el body
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// Express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Cookie-parser
app.use(cookieParser());

// Mehtod-override --> Para usar put y delete (?_method=...)
app.use(methodOverride('_method'));

// Rutas
app.use('/api/user',apiUserRouter);
<<<<<<< HEAD
app.use('/api/product',apiProductRouter);
=======
app.use('/api/address',apiAddressRouter);
>>>>>>> 86f6f95408ee59a6d8c31643bc8cfc861c0a4b37
app.use('/',mainRouter);

const PORT = process.env.PORT || 3500;

app.listen(PORT,()=>{
    console.log(" 🚀 Se levanto proyecto en htpp://localhost:"+PORT)
})

