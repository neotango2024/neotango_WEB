import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import mainRouter from './routes/mainRouter.js';

const app = express();
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
    secret: "Conf middleware global session",
    resave: false,
    saveUninitialized: false
}));

// Cookie-parser
app.use(cookieParser());

// Mehtod-override --> Para usar put y delete (?_method=...)
app.use(methodOverride('_method'));

// Rutas
app.use('/',mainRouter);


// Correr el servidor

const PORT = process.env.PORT || 3500;

app.listen(PORT,()=>{
    console.log(" 🚀 Se levanto proyecto en htpp://localhost:"+PORT)
})

