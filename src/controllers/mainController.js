import { categories } from "../utils/staticDB/categories.js";
import sizes from "../utils/staticDB/sizes.js";
import tacos from "../utils/staticDB/tacos.js";
import { findProductsInDb } from "./api/apiProductController.js";

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
            let { id } = req.params;
            let productFromDB = await findProductsInDb(id,null,true);
            // return res.send(productFromDB);
            return res.render('productDetail',{tacos, sizes, productFromDB})
        } catch (error) {
            console.log('FALLE EN mainController.productDetail');
            return res.send(error); 
        }
    
    },
    productList: async (req, res) => {
        try {
            const {categoryId} = req.params;
            const categoryExists = categories.find(cat => cat.id === Number(categoryId));
            if(!categoryExists) return res.redirect('/')
            return res.render('productList', {categoryId})
        } catch (error) {
            console.log(`error in main controller product list: ${error}`);
            return res.redirect('/')
        }
    }
};

export default controller;