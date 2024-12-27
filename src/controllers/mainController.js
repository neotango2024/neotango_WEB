// import { NAVBAR_PAGES_LINK, SHOP_CATEGORIES_DROPDOWN, LANGUAGES } from "../utils/staticDB/constants.js";


const controller = {
    index: (req,res)=>{
        return res.render('index')
    },
    cart: (req,res)=>{
        return res.render('cart')
    }
};

export default controller;