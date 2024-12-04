const { validationResult } = require('express-validator');

export const controller = {
    createProduct: async (req, res) => {
        try {     
            const { name, english_description, spanish_description, ars_price, usd_price, sku, category_id, variations } = req.body;
            const images = req.files;
            let errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.render("createProduct", {errors: errors.mapped()})
            }
        } catch (error) {
            console.log(`Error creating product: ${error}`);
            return res.json(error);
        }
    }
}
