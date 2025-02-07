
import express from 'express';
const app = express();
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config.js"; // En ESM se importa asi
import session from 'express-session';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import mainRouter from './routes/mainRouter.js';
import userRouter from './routes/userRouter.js';
import apiUserRouter from './routes/api/apiUserRouter.js';
import apiProductRouter from './routes/api/apiProductRouter.js';
import apiAddressRouter from './routes/api/apiAddressRouter.js';
import apiPhoneRouter from './routes/api/apiPhoneRouter.js';
import apiCartRouter from './routes/api/apiCartRouter.js'
import apiOrderRouter from './routes/api/apiOrderRouter.js';
import apiTypeRouter from './routes/api/apiTypeRouter.js';
import apiShippingRouter from './routes/api/apiShippingRouter.js';
import apiPaymentRouter from './routes/api/apiPaymentRouter.js';
import { languageMiddleware } from './middlewares/language.js';
import unverifiedUser from './middlewares/unverifiedUser.js';
import apiVariationsRouter from './routes/api/apiVariationRouter.js';

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
app.use('/api/product',apiProductRouter);
app.use('/api/address',apiAddressRouter);
app.use('/api/cart', apiCartRouter);
app.use('/api/phone', apiPhoneRouter);
app.use('/api/order', apiOrderRouter);
app.use('/api/type', apiTypeRouter);
app.use('/api/variation', apiVariationsRouter);
app.use('/api/shipping', apiShippingRouter);
app.use('/api/shipping', apiShippingRouter);
app.use('/api/payment', apiPaymentRouter);
app.use(unverifiedUser); //En todas las consultas de render
app.use('/',mainRouter);
app.use('/user',userRouter);
const PORT = process.env.PORT || 3500;


//404
app.use((req, res, next) => {
    res.status(404);
    return res.redirect('/')
  });

  
app.listen(PORT,()=>{
    console.log(" 🚀 Se levanto proyecto en puerto "+PORT)
})

