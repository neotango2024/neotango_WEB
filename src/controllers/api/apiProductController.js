import Product from '../../database/models/Product';
import { INTERNAL_SERVER_ERROR_RESPONSE } from '../../utils/constants/constants';

export const controller = {
    getAllProducts: (req, res) => {
        try {
            const products = Product.findAll();
            return res.status(200).json
        } catch (error) {
            console.log(`error in getAllProducts: ${e}`);
            return INTERNAL_SERVER_ERROR_RESPONSE;
        }
    },
    getOneProduct: (req, res) => {
        try {
            const {productId} = req.query;
            const product = Product.findByPk(productId);
            if(!product){
                return res.status(404).json({
                    data: null,
                    message: `Product with id ${productId} was not found`
                })
            }
            return res.status(200).json({
                data: product,
                message: 'Successfully fetched product'
            })
        } catch (error) {
            console.log(`error in getOneProduct: ${e}`);
            return INTERNAL_SERVER_ERROR_RESPONSE;
        }
    },
};