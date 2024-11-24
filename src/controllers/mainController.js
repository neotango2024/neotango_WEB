import { NAVBAR_PAGES_LINK, SHOP_CATEGORIES_DROPDOWN, LANGUAGES } from "../utils/staticDB/constants.js";

const controller = {
    index: (req,res)=>{
        return res.render('index', {navbarLinks: NAVBAR_PAGES_LINK, shopCategories: SHOP_CATEGORIES_DROPDOWN, languages: LANGUAGES})
    }
};

export default controller;