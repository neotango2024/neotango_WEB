

// import { NAVBAR_PAGES_LINK, SHOP_CATEGORIES_DROPDOWN, LANGUAGES } from "../utils/staticDB/constants.js"
const controller = {
    logout: (req,res)=>{
        let pathToReturn = req.session.returnTo;
        res.clearCookie("userAccessToken");
        res.clearCookie("adminToken");
        req.session.destroy();        
        return res.redirect(`${pathToReturn}`);
    },
    
};

export default controller;