import systemMessages from '../../utils/staticDB/systemMessages.js';



import { paymentTypes } from '../../utils/staticDB/paymentTypes.js';
import { shippingTypes } from '../../utils/staticDB/shippingTypes.js';
import countries from '../../utils/staticDB/countries.js';
import tacos from '../../utils/staticDB/tacos.js';
import sizes from '../../utils/staticDB/sizes.js';




const {productMsg} = systemMessages;
const { fetchFailed, notFound, fetchSuccessfull, createFailed, updateFailed, deleteSuccess, createSuccessfull, deleteFailed } = productMsg;


const controller = {
    getPaymentTypes: async (req, res) => {
        try {
            return res.status(200).json({
                ok: true,
                data: paymentTypes
            })
        } catch (error) {
            console.log(`error in getPaymentTypes:`);
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: fetchFailed.en
            })
        }
    },
    getShippingTypes: async (req, res) => {
        try {
            return res.status(200).json({
                ok: true,
                data: shippingTypes
            })
        } catch (error) {
            console.log(`error in getShippingTypes:`);
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: fetchFailed.en
            })
        }
    },
    getCountries: async (req, res) => {
        try {
            return res.status(200).json({
                ok: true,
                data: countries
            })
        } catch (error) {
            console.log(`error in getCountries:`);
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: fetchFailed.en
            })
        }
    },
    getTacos: async (req, res) => {
        try {
            return res.status(200).json({
                ok: true,
                data: tacos
            })
        } catch (error) {
            console.log(`error in getTacos:`);
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: fetchFailed.en
            })
        }
    },
    getSizes: async (req, res) => {
        try {
            
            return res.status(200).json({
                ok: true,
                data: sizes
            })
        } catch (error) {
            console.log(`error in getSizes:`);
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: fetchFailed.en
            })
        }
    },
};

export default controller;
