import { categories } from "../utils/staticDB/categories.js";
import sizes from "../utils/staticDB/sizes.js";
import tacos from "../utils/staticDB/tacos.js";
import { findProductsInDb } from "./api/apiProductController.js";
import { getUsersFromDB } from "./api/apiUserController.js";

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
            console.log(`error in main controller product list: ${error}, redirecting...`);
            return res.redirect('/')
        }
    },
    userProfile: async (req, res) => {
        try {
            const {userId} = req.params;
            const userExists = getUsersFromDB(userId);
            if(!userExists){
                console.log(`user with id :${userId} was not found, redirecting...`)
                return res.redirect('/');
            }
            return res.render('userProfile')
        } catch (error) {
            console.log(`Error in user profile: ${error}, redirecting...`);
            return res.redirect('/');
        }
    },
    aboutUs: async (req, res) => {
        try {
            return res.render('aboutUs')
        } catch (error) {
            console.log(`Error in about us: ${error}, redirecting...`);
            return res.redirect('/');
        }
    },
    faq: async (req, res) => {
        try {
            return res.render('faq')
        } catch (error) {
            console.log(`Error in faq: ${error}, redirecting...`);
            return res.redirect('/');
        }
    },
    logout: (req,res)=>{
        let pathToReturn = req.session.returnTo;
        res.clearCookie("userAccessToken");
        res.clearCookie("adminToken");
        req.session.destroy();        
        return res.redirect(`${pathToReturn}`);
    },
};

export default controller;