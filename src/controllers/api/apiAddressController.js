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
import capitalizeFirstLetterOfEachWord from "../../utils/capitalizeFirstLetterOfString.js";
import getDeepCopy from "../../utils/getDeepCopy.js";

import countries from "../../utils/staticDB/countries.js";
import { getMappedErrors, getUserByPK } from "./apiUserController.js";

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
                url: '/api/user',
                method: "POST"
            },
            ok: false,
            errors: errorsMapped,
            params: errorsParams,
            msg: systemMessages.formMsg.validationError.es
        });
      }

      // Datos del body
      let { user_id, street, label, detail, zip_code, city, province, country_id, first_name, last_name } = req.body;
      
      // return console.log(bcrypt.hashSync('admin123', 10));
      
      //Nombres y apellidos van capitalziados
      first_name = capitalizeFirstLetterOfEachWord(first_name, true);
      last_name = capitalizeFirstLetterOfEachWord(last_name, true);

      let dataToDB = {
        id: uuidv4(),
        user_id,
        street,
        label,
        detail: detail || null,
        zip_code,
        city,
        province,
        country_id,
        first_name,
        last_name,
      };
      
      let createdAddress = await insertAddressToDB(dataToDB);
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
        msg: systemMessages.addressMsg.createSuccesfull.es, //TODO: ver tema idioma
        redirect: "/user/address",
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
      let {errorsParams,errorsMapped} = getMappedErrors(errors);
        return res.status(422).json({
            meta: {
                status: 422,
                url: '/api/user',
                method: "PUT"
            },
            ok: false,
            errors: errorsMapped,
            params: errorsParams,
            msg: systemMessages.formMsg.validationError.es
        });

      // Datos del body
      let { address_id, street, label, detail, zip_code, city, province, country_id, first_name, last_name } = req.body;

      //Nombres y apellidos van capitalziados
      first_name = capitalizeFirstLetterOfEachWord(first_name, true);
      last_name = capitalizeFirstLetterOfEachWord(last_name, true);
      
      let keysToUpdate = {
        first_name,
        last_name,
        street,
        label,
        detail,
        zip_code,
        city,
        province,
        country_id,
      };
      
      await updateAddressFromDB(keysToUpdate,address_id)

      // Le  mando ok con el redirect al email verification view
      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/address",
          method: "PUT",
          redirect: "/user/address"
        },
        ok: true,
        msg: systemMessages.addressMsg.updateSuccesfull.es, //TODO: ver tema idioma
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
        msg: systemMessages.addressMsg.destroySuccesfull.es, //TODO: ver tema idioma
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
      include: ['billingOrders','shippingOrders','user']
    });
    addresses = getDeepCopy(addresses);

    return addresses
  } catch (error) {
    console.log(`Falle en getUserAddresesFromDB`);
    console.log(error);
    return undefined
  }
}