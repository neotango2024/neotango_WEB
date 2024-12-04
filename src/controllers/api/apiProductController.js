import Product from '../../database/models/Product';
import { INTERNAL_SERVER_ERROR_RESPONSE } from '../../utils/constants/constants';

export const controller = {
    getAllProducts: () => {
        try {
            const products = Product.findAll();
            return {
                statusCode: 200,
                data: products,
                message: 'Succesfully fetched all products'
            }
        } catch (error) {
            console.log(`error in getAllProducts: ${e}`);
            return INTERNAL_SERVER_ERROR_RESPONSE;
        }
    },
    getOneProduct: (productId) => {
        try {
            const product = Product.findByPk(productId);
            if(!product){
                return {
                    statusCode: 404,
                    data: null,
                    message: `Product with id ${productId} not found`
                }
            }
        } catch (error) {
            console.log(`error in getOneProduct: ${e}`);
            return INTERNAL_SERVER_ERROR_RESPONSE;
        }
    },
};