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
  createPhone: async (req, res) => {
    try {
      // Traigo errores
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        let { errorsParams, errorsMapped } = getMappedErrors(errors);
        return res.status(422).json({
          meta: {
            status: 422,
            url: "/api/phone",
            method: "POST",
          },
          ok: false,
          errors: errorsMapped,
          params: errorsParams,
          msg: systemMessages.formMsg.validationError.es,
        });
      }
      let phoneObjToDB = generatePhoneObject(req.body);

      if (phoneObjToDB.default) {
        await db.Phone.update(
          {
            default: 0,
          },
          {
            where: {
              user_id: phoneObjToDB.user_id,
            },
          }
        );
      }
      let createdPhone = getDeepCopy(await insertPhoneToDB(phoneObjToDB));

      if (!createdPhone) return res.status(502).json();
      createdPhone.country = countries.find(country=> country.id == createdPhone.country_id);
      // Le  mando ok con el redirect al email verification view
      return res.status(201).json({
        meta: {
          status: 201,
          url: "/api/phone",
          method: "POST",
        },
        ok: true,
        msg: systemMessages.phoneMsg.createSuccesfull,
        phone: createdPhone,
      });
    } catch (error) {
      console.log(`Falle en apiPhoneController.createPhone`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  updatePhone: async (req, res) => {
    try {
      // Traigo errores
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Traigo errores
        let { errorsParams, errorsMapped } = getMappedErrors(errors);
        return res.status(422).json({
          meta: {
            status: 422,
            url: "/api/user",
            method: "PUT",
          },
          ok: false,
          errors: errorsMapped,
          params: errorsParams,
          msg: systemMessages.formMsg.validationError.es,
        });
      }
      // Datos del body
      let { country_id, phone_number, id, defaultPhone } = req.body;

      let keysToUpdate = {
        phone_number,
        country_id,
        default: defaultPhone,
      };
      if (keysToUpdate.default) {
        const { user_id } = req.body;
        await db.Phone.update(
          {
            default: 0,
          },
          {
            where: {
              user_id,
            },
          }
        );
      }

      await updatePhoneFromDB(keysToUpdate, id);
      let updatedPhone = getPhonesFromDB(id)
      // Le  mando ok con el redirect al email verification view
      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/phone",
          method: "PUT",
          redirect: "/user/phone",
        },
        ok: true,
        msg: systemMessages.phoneMsg.updateSuccesfull,
        updatedPhone
      });
    } catch (error) {
      console.log(`Falle en apiPhoneController.updatePhone`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  destroyPhone: async (req, res) => {
    try {
      let { phone_id } = req.body;
      // Lo borro de db
      let response = destroyPhoneFromDB(phone_id);
      if (!response) return res.status(502).json();
      return res.status(200).json({
        meta: {
          status: 201,
          url: "/api/phone",
          method: "DELETE",
        },
        ok: true,
        msg: systemMessages.phoneMsg.destroySuccesfull, 
        redirect: "/",
      });
    } catch (error) {
      console.log(`Falle en apiPhoneController.destroyPhone`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
};

export default controller;

let phoneIncludeArray = ["user"];
export async function insertPhoneToDB(obj) {
  try {
    //Lo creo en db
    let createdPhone = await db.Phone.create(obj);
    return createdPhone || undefined;
  } catch (error) {
    console.log(`Falle en insertPhoneToDB`);
    console.log(error);
    return undefined;
  }
}
export async function updatePhoneFromDB(obj, id) {
  try {
    if (!obj || !id) return undefined;

    //Lo updateo en db
    await db.Phone.update(obj, {
      where: {
        id,
      },
    });
    return true;
  } catch (error) {
    console.log(`Falle en updatePhoneToDB`);
    console.log(error);
    return undefined;
  }
}
export async function destroyPhoneFromDB(id) {
  try {
    if (!id) return undefined;

    //Lo borro de db
    await db.Phone.destroy({
      where: {
        id,
      },
    });
    return true;
  } catch (error) {
    console.log(`Falle en updatePhoneToDB`);
    console.log(error);
    return undefined;
  }
}
export async function getUserPhonesFromDB(id) {
  try {
    let phones = await db.Phone.findAll({
      where: {
        user_id: id,
      },
      include: phoneIncludeArray,
    });
    phones = getDeepCopy(phones);

    return phones;
  } catch (error) {
    console.log(`Falle en getUserPhonesFromDB`);
    console.log(error);
    return undefined;
  }
}

export function generatePhoneObject(phone) {
  // objeto para armar la phone
  let { user_id, country_id, phone_number, defaultPhone } = phone;

  let dataToDB = {
    id: uuidv4(),
    user_id,
    country_id,
    phone_number,
    default: defaultPhone,
  };
  return dataToDB;
}

export async function getPhonesFromDB(id) {
  try {
    // Condición si id es un string
    if (typeof id === "string") {
      let phoneToReturn = await db.Phone.findByPk(id, {
        include: phoneIncludeArray,
      });
      if (!phoneToReturn) return null;
      phoneToReturn = phoneToReturn && getDeepCopy(phoneToReturn);
      return phoneToReturn;
    }

    // Condición si id es un array
    if (Array.isArray(id)) {
      let phonesToReturn = await db.Phone.findAll({
        where: {
          id: id, // id es un array, se hace un WHERE id IN (id)
        },
        include: phoneIncludeArray,
      });
      if (!phonesToReturn || !phonesToReturn.length) return null;
      phonesToReturn = getDeepCopy(phonesToReturn);
      return phonesToReturn;
    }

    // Condición si id es undefined
    if (id === undefined) {
      let phonesToReturn = await db.Phone.findAll({
        include: phoneIncludeArray,
      });
      if (!phonesToReturn || !phonesToReturn.length) return null;
      phonesToReturn = getDeepCopy(phonesToReturn);
      return phonesToReturn;
    }
  } catch (error) {
    console.log("Falle en getPhonesFromDB");
    console.error(error);
    return null;
  }
}
