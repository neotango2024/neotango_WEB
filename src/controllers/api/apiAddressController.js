import db from "../../database/models/index.js";
// Librerias
import Sequelize from "sequelize";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validationResult } from "express-validator";
// way to replace __dirname in es modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// UTILS
import systemMessages from "../../utils/staticDB/systemMessages.js";
import capitalizeFirstLetterOfEachWord from "../../utils/helpers/capitalizeFirstLetterOfString.js";
import getDeepCopy from "../../utils/helpers/getDeepCopy.js";

import countries from "../../utils/staticDB/countries.js";

import { getMappedErrors } from "../../utils/helpers/getMappedErrors.js";

// ENV

const controller = {
  createAddress: async (req, res) => {
    try {
      // Traigo errores
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        let {errorsParams,errorsMapped} = getMappedErrors(errors);
        return res.status(422).json({
            meta: {
                status: 422,
                url: '/api/address',
                method: "POST"
            },
            ok: false,
            errors: errorsMapped,
            params: errorsParams,
            msg: systemMessages.formMsg.validationError.es
        });
      }
      let addressObjToDB = generateAddressObject(req.body);
      // Si llega por default entonces actualizo todas las otras
      if(addressObjToDB.default){
        await db.Address.update({
          default: 0
        },{
          where: {
            user_id: addressObjToDB.user_id
          }
        })
      }
      let createdAddress = await insertAddressToDB(addressObjToDB);
      
      if(!createdAddress)
      return res.status(502).json();
      
      // Le  mando ok con el redirect al email verification view
      return res.status(201).json({
        meta: {
          status: 201,
          url: "/api/address",
          method: "POST",
        },
        ok: true,
        msg: systemMessages.addressMsg.createSuccesfull,
        address: createdAddress,
      });
    } catch (error) {
      console.log(`Falle en apiAddressController.createUser`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  updateAddress: async (req, res) => {
    try {
      // Traigo errores
      // Traigo errores
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        let {errorsParams,errorsMapped} = getMappedErrors(errors);
        return res.status(422).json({
            meta: {
                status: 422,
                url: '/api/address',
                method: "PUT"
            },
            ok: false,
            errors: errorsMapped,
            params: errorsParams,
            msg: systemMessages.formMsg.validationError.es
        });
      }
      // Datos del body
      let { id, street, label, detail, zip_code, city, province, country_id, defaultAddress } = req.body;
      
      let keysToUpdate = {
        street,
        label,
        detail,
        zip_code,
        city,
        province,
        country_id,
        default: defaultAddress
      };
      if(keysToUpdate.default){
        const { user_id } =  req.body
        await db.Address.update({
          default: 0
        },{
          where: {
            user_id
          }
        })
      }
      await updateAddressFromDB(keysToUpdate,id)

      // Le  mando ok con el redirect al email verification view
      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/address",
          method: "PUT",
          redirect: "/user/address"
        },
        ok: true,
        msg: systemMessages.addressMsg.updateSuccesfull,
      });
    } catch (error) {
      console.log(`Falle en apiUserController.updateAddress`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  destroyAddress: async (req, res) => {
    try {
      let { address_id } = req.body;
      // Lo borro de db
      let response = destroyAddressFromDB(address_id);
      if(!response)return res.status(502).json();
      return res.status(200).json({
        meta: {
          status: 201,
          url: "/api/address",
          method: "DELETE",
        },
        ok: true,
        msg: systemMessages.addressMsg.destroySuccesfull,
        redirect: "/",
      });
    } catch (error) {
      console.log(`Falle en apiAddressController.destroyAddress`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
};

export default controller;

let addressIncludeArray = ['user']
export async function insertAddressToDB(obj) {
  try {
    //Lo creo en db
    let createdAddress = await db.Address.create(obj);
    return createdAddress || undefined
  } catch (error) {
    console.log(`Falle en insertAddressToDB`);
    console.log(error);
    return undefined
  }
}
export async function updateAddressFromDB(obj,id) {
  try {
    if(!obj || !id)return undefined

    //Lo updateo en db
    await db.Address.update(obj,{
      where: {
        id
      }
    });
    return true
  } catch (error) {
    console.log(`Falle en updateAddressToDB`);
    console.log(error);
    return undefined
  }
}
export async function destroyAddressFromDB(id) {
  try {
    if(!id)return undefined

    //Lo borro de db
    await db.Address.destroy({
      where: {
        id
      }
    });
    return true
  } catch (error) {
    console.log(`Falle en updateAddressToDB`);
    console.log(error);
    return undefined
  }
}
export async function getUserAddressesFromDB(id) {
  try {
    let addresses = await db.Address.findAll({
      where: {
        user_id: id
      },
      include: addressIncludeArray
    });
    addresses = getDeepCopy(addresses);

    return addresses
  } catch (error) {
    console.log(`Falle en getUserAddresesFromDB`);
    console.log(error);
    return undefined
  }
}

export function generateAddressObject(address) {
  // objeto para armar la address
  let { user_id, street, label, detail, zip_code, city, province, country_id, defaultAddress } = address;
      
  let dataToDB = {
    id: uuidv4(),
    user_id,
    street, //libertado 2222
    label, //Casa
    detail: detail || null, //2b
    zip_code,
    city,
    province,
    country_id,
    default: defaultAddress
  };
  return dataToDB
}

export async function getAddresesFromDB(id){
  try {
  
    // Condición si id es un string
    if (typeof id === "string") {
      let addressToReturn = await db.Address.findByPk(id,{
        include: addressIncludeArray
      });
      if(!addressToReturn)return null
      addressToReturn = addressToReturn && getDeepCopy(addressToReturn);
      return addressToReturn;
    }

    // Condición si id es un array
    if (Array.isArray(id)) {
      let addressesToReturn = await db.Address.findAll({
        where: {
          id: id, // id es un array, se hace un WHERE id IN (id)
        },
        include: addressIncludeArray
      });
      if(!addressesToReturn || !addressesToReturn.length)return null
      addressesToReturn = getDeepCopy(addressesToReturn);
      return addressesToReturn;
    }

    // Condición si id es undefined
    if (id === undefined) {
      let addressesToReturn = await db.Address.findAll({
        include: addressIncludeArray
      });
      if(!addressesToReturn || !addressesToReturn.length)return null
      addressesToReturn = getDeepCopy(addressesToReturn);
      return addressesToReturn;
    }
  } catch (error) {
    console.log("Falle en getUserAddresesFromDB");
    console.error(error);
    return null;
  }
}