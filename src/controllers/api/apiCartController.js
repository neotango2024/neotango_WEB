import db from '../../database/models/index.js';
import { populateSize, populateTaco } from '../../utils/helpers/populateStaticDb.js';
import { findProductsInDb } from './apiProductController.js';
import { v4 as UUIDV4 } from 'uuid';
const { TempCartItem } = db;

const controller = {
    handleGetCartItems: async (req, res) => {
        try {
            const userId = req.params.userId;
            if(!userId){
                return res.status(400).json({
                    ok: false,
                    msg: 'No user id was provided',
                    data: null
                })
            }
            const tempCartItems = await findTempCartItemsByUserId(userId);
            if(!tempCartItems){
                return res.status(500).json({
                    ok: false,
                    msg: 'Internal server error',
                    data: null
                })
            }
            tempCartItems.forEach(tempItem => {
                const {size_id, taco_id} = tempItem;
                tempItem.size = populateSize(size_id);
                tempItem.taco = populateTaco(taco_id);
            })
            return res.status(200).json({
                ok: true,
                msg: 'Successfully fetched cart',
                data: tempCartItems
            })
        } catch (error) {
            console.log(`Error obtaining cart: ${error}`);
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error',
                data: null
            })
        }
    },
    handleCreateCartItem: async (req, res) => {
        try {
            const userId = req.params.userId;
        if(!userId){
            return res.status(400).json({
                ok: false,
                msg: 'No user id was provided',
                data: null
            })
        }
        const {body} = req;
        const isValidPayload = validateCreateItemPayload(body);
        if(!isValidPayload){
            console.log('invalid payload')
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error',
                data: null
            })
        }
        const {productId} = body;
        const [productExists, product] = await findProductsInDb(productId);
        if(!productExists || !product){
            console.log('failed to fetched product')
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error',
                data: null
            })
        }
        const isCartItemCreated = await createCartItemInDb(body, userId);
        if(!isCartItemCreated){
            console.log('failing creating item')
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error',
                data: null
            })
        }
        return res.status(200).json({
            ok: false,
            msg: 'Succesfully added item to cart'
        })
        } catch (error) {
            console.log(`error creating cart item: ${error}`);   
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error',
                data: null
            })
        }
        
    },
    handleDeleteCartItem: async (req, res) => {
        try {
            const cartItemId = req.params.cartItemId;
            if(!cartItemId){
                return res.status(500).json({
                    msg: 'Internal server error',
                    ok: false,
                })
            }
            const isDeleted = await deleteCartItemInDb(cartItemId);
            if(!isDeleted){
                return res.status(500).json({
                    msg: 'Internal server error',
                    ok: false,
                })
            }
            return res.status(200).json({
                msg: 'Succesfully deleted item',
                ok: false,
            })
        } catch (error) {
            console.log(`Error deleting cart item`);
            return res.status(500).json({
                msg: 'Internal server error',
                ok: false,
            })
        }
    }
}

export default controller;

async function findTempCartItemsByUserId(userId){
    try {
        const tempCartItems = await TempCartItem.findAll({
            where: {
                user_id: userId
            },
            include: [
                'product',
                'user'
            ]
        })
        if(!tempCartItems) return [];
        return tempCartItems;
    } catch (error) {
        console.log(`Error finding cart in db: ${error}`);
        return [];
    }
}

function validateCreateItemPayload(body) {
    return body.productId && body.quantity && body.tacoId && body.sizeId ? true : false;
}

async function createCartItemInDb(payload, userId){
    try {
        const {productId, sizeId, tacoId, quantity} = payload;
        const objectToCreate = {
            id: UUIDV4(),
            product_id: productId,
            size_id: sizeId,
            taco_id: tacoId,
            user_id: userId,
            quantity
        }
        await TempCartItem.create(objectToCreate);
        return true;
    } catch (error) {
        console.log(`Error creating cart item: ${error}`);
        return false;
    }
}

async function deleteCartItemInDb(cartItemId){
    try {
        const itemsDeleted = await TempCartItem.destroy({
            where: {
                id: cartItemId
            }
        })
        return itemsDeleted > 0;
    } catch (error) {
        console.log(`Error deleting item in db: ${error}`);
        return false;
    }
}