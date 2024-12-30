import sizes from "../utils/staticDB/sizes.js";
import tacos from "../utils/staticDB/tacos.js";

// import { NAVBAR_PAGES_LINK, SHOP_CATEGORIES_DROPDOWN, LANGUAGES } from "../utils/staticDB/constants.js"
const controller = {
    index: (req,res)=>{
        return res.render('index')
    },
    cart: (req,res)=>{
        return res.render('cart')
    },
    userVerification: (req,res) =>{
        return res.render('userEmailVerify')
    },
    productDetail: async(req,res) =>{
        try {
            return res.render('productDetail',{tacos, sizes})
        } catch (error) {
            console.log('FALLE EN mainController.productDetail');
            return res.send(error); 
        }
    
    },

};

export default controller;