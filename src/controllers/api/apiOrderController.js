import db from "../../database/models/index.js";
// Librerias
import Sequelize from "sequelize";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { validationResult } from "express-validator";
import { fileURLToPath } from "url";
// way to replace __dirname in es modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// UTILS
import systemMessages from "../../utils/staticDB/systemMessages.js";
import generateRandomCodeWithExpiration from "../../utils/helpers/generateRandomCodeWithExpiration.js";
import capitalizeFirstLetterOfEachWord from "../../utils/helpers/capitalizeFirstLetterOfString.js";
import getDeepCopy from "../../utils/helpers/getDeepCopy.js";

import countries from "../../utils/staticDB/countries.js";
import sendVerificationCodeMail from "../../utils/helpers/sendverificationCodeMail.js";
import ordersStatuses from "../../utils/staticDB/ordersStatuses.js";
import { generateAddressObject, getUserAddressesFromDB } from "./apiAddressController.js";
import getFileType from "../../utils/helpers/getFileType.js";
import { destroyFilesFromAWS, getFilesFromAWS, uploadFilesToAWS } from "../../utils/helpers/awsHandler.js";
import { findProductsInDb, getVariationsFromDB } from "./apiProductController.js";
import generateRandomNumber from "../../utils/helpers/generateRandomNumber.js";

// ENV
const webTokenSecret = process.env.JSONWEBTOKEN_SECRET;

const controller = {
  createOrder: async (req, res) => {
    try {
      // Traigo errores
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        //Si hay errores en el back...
        //Para saber los parametros que llegaron..
        let {errorsParams,errorsMapped} = getMappedErrors(errors);
        return res.status(422).json({
            meta: {
                status: 422,
                url: '/api/order',
                method: "POST"
            },
            ok: false,
            errors: errorsMapped,
            params: errorsParams,
            msg: systemMessages.formMsg.validationError.es
        });
      };
      let {
        date,
        variations,
        user_id,
        first_name,
        last_name,
        email,
        dni,
        phoneObj,
        billingAddress,
        shippingAddress,
        payment_types_id,
        shipping_types_id,
        } = req.body
      // veo las direcciones primero que todo
      if(!billingAddress.id){
          let billingAddressObjToDB = generateAddressObject(billingAddress);
          if(user_id) billingAddressObjToDB.user_id = user_id; //Si hay usuario lo agrego a esta
        let createdAddress = await insertAddressToDB(billingAddressObjToDB);
        if(!createdAddress) return res.status(502).json();
        billingAddress.id = billingAddressObjToDB.id; //lo dejo seteado asi despues puedo acceder
      }
      if(!shippingAddress.id){
          let shippingAddressObjToDB = generateAddressObject(shippingAddress);
          if(user_id) shippingAddressObjToDB.user_id = user_id; //Si hay usuario lo agrego a esta
        let createdAddress = await insertAddressToDB(shippingAddressObjToDB);
        if(!createdAddress) return res.status(502).json();
        shippingAddress.id = shippingAddressObjToDB.id; //lo dejo seteado asi despues puedo acceder
      }
      if(!phoneObj.id){
        //TODO: Hacer entidad phone y armar como hice con address
        let phoneObjToDB = {
            id: uuidv4(),
            phone_number: phoneObj.phone_number,
            country_id: phoneObj.country_id
        };
        if(user_id) phoneObjToDB.user_id = user_id; //Si hay usuario lo agrego a esta

      }
      // Armo el objeto del pedido
      const randomString = generateRandomNumber(10);
      let orderDataToDB = {
        id: uuidv4(),
        tra_id: randomString,
        user_id,
        first_name,
        last_name,
        email,
        dni,
        phoneObj,
        billingAddress,
        shippingAddress,
        order_status_id: shipping_types_id == 1 ? 2 : 3,//Si es con shipping una vez la compran queda "pendiente de envio", sino queda pendiente de recoleccion
        shipping_types_id,
        payment_types_id,
      };
      createOrderEntitiesSnapshot(orderDataToDB); //Funcion que saca "foto" de las entidades
      // armo los orderItems
      let orderItemsToDB = [];
      let stockItems = [];
      let variationIdsToGet = variations.map(variation=>variation.variation_id); //Array de ids
      let variationsFromDB = await getVariationsFromDB(variationIdsToGet);//Obtengo de db las variaciones
      let insufficientStock = false;
      variations.forEach((variation) => {
        // Agarro el producto de DB
        let variationFromDBIndex = variationsFromDB.findIndex(variationFromDB=> variationFromDB.id == variation);
        if(variationFromDBIndex < 0)return; //Si no viene no sigo (al pedo)
        let variationFromDB = variationFromDB[variationFromDBIndex];
        let { quantityRequested } = variation; //Tengo que chequear con esa variacion
        quantityRequested = parseInt(quantityRequested); //Lo parseo
        if(quantityRequested > variationFromDB.quantity) insufficientStock = true; //Dejo la flag seteada
        //Aca paso el chequeo de stock ==> lo resto al stock que tenia
        variationFromDB.quantity -= quantityRequested; //Le resto el stock
        //Hago el snapshot del  precio y nombre
        
        let orderItemName = variationFromDB.product?.name;
        let orderItemPrice = variationFromDB.product?.price && parseFloat(variationFromDB.product.price);
        let orderItemQuantity = parseInt(quantityRequested);
        // Voy armando el array de orderItems para hacer un bulkcreate
        let orderItemData = {
            id: uuidv4(),
            order_id: orderDataToDB.id,
            product_id: variationFromDB.product_id,
            name: orderItemName,
            price: orderItemPrice,
            quantity: orderItemQuantity
        }
        orderItemsToDB.push(orderItemData);
      });
      //Aca ya reste a las variaciones el stock, mapeo y dejo solo id y stock para luego hacer el bulkupdate de eso nomas
      variationsFromDB = variationsFromDB.map(variationFromDB => ({
        id: variationFromDB.id,
        quantity: variationFromDB.quantity,
      }))
      // Hasta aca ya arme todo. (BillingAddress - Order - OrderItem - ShippingAddress) ==> Tengo que insertar en la DB


      // Tema total price
      let orderTotalPrice = 0;
      orderItemsToDB.forEach((item) => {
        orderTotalPrice += parseFloat(item.price) * parseInt(item.quantity);
      });
      orderDataToDB.total = orderTotalPrice;
      // Hago los insert en la base de datos
      let orderCreated = await db.Order.create(
        {
          ...orderDataToDB,
          // Esto es para hacer un create dircetamente
          orderItems: orderItemsToDB,
        },
        {
          include: ["orderItems"], //TODO: crear tabla orderITEMS
        }
      );
      //Si la orden se creo ok, hago el bulkupdate de las variations
      variationsFromDB.length && await db.Variation.bulkCreate(variationsFromDB,{
        updateOnDuplicate: ['quantity']
      });
      orderCreated = await getOrderByPK(orderCreated.id);
      //Borro el carro de db TODO:
      // Si paga con tarjetas
    //   await sendOrderMails(orderCreated); //TODO:
      // Mando la respuesta
      return res.status(200).json({
        meta: {
          status: 200,
        },
        ok: true,
        order_id: orderCreated.tra_id,
        msg: systemMessages.orderMsg.create.es, //TODO: ver
        //Si paga con tarjetas lo tengo que redirigir, sino le pongo false y termina ahi
        redirect: '/',
      });
    } catch (error) {
      console.log(`Falle en apiOrderController.createOrder`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  updateOrder: async (req, res) => {
    try {
      // Traigo errores
      // let errors = validationResult(req);

      // if (!errors.isEmpty()) {
      //   //Si hay errores en el back...
      //   errors = errors.mapped();

      //   // Ver como definir los errors
      //   // return res.send(errors)
      //   return res.status(422).json({
      //       meta: {
      //           status: 422,
      //           url: '/api/user',
      //           method: "POST"
      //       },
      //       ok: false,
      //       errors,
      //       msg: systemMessages.formMsg.validationError.es
      //   });
      // }

      // Datos del body
      let { user_id, first_name, last_name, gender_id } = req.body;

      let userFromDB = await getUserByPK(user_id);
      if (!userFromDB)
        return res
          .status(404)
          .json({ ok: false, msg: systemMessages.userMsg.updateFailed.es });
      //Nombres y apellidos van capitalziados
      first_name = capitalizeFirstLetterOfEachWord(first_name, true);
      last_name = capitalizeFirstLetterOfEachWord(last_name, true);

      let keysToUpdate = {
        first_name,
        last_name,
        gender_id: gender_id || null,
      };
      await db.User.update(keysToUpdate, {
        where: {
          id: user_id,
        },
      });

      // Le  mando ok con el redirect al email verification view
      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/user",
          method: "PUT",
        },
        ok: true,
        msg: systemMessages.userMsg.updateSuccesfull.es, //TODO: ver tema idioma
      });
    } catch (error) {
      console.log(`Falle en apiUserController.updateUser`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  destroyUser: async (req, res) => {
    try {
      let { user_id } = req.body;
      // Lo borro de db
      await db.User.destroy({
        where: {
          id: user_id,
        },
      });
      // Borro cookie y session
      res.clearCookie("userAccessToken");
      delete req.session.userLoggedId;
      return res.status(200).json({
        meta: {
          status: 201,
          url: "/api/user",
          method: "DELETE",
        },
        ok: true,
        msg: systemMessages.userMsg.updateSuccesfull.es, //TODO: ver tema idioma
        redirect: "/",
      });
    } catch (error) {
      console.log(`Falle en apiUserController.destroyUser`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },

};

export default controller;


let orderIncludeArray = [
    'phone',
    'user',
    "billingAddress",
    'shippingAddress',
    'orderItems',
]
export async function getOrderByPK(id) {
  try {
  //busco el usuario
  let order = await db.Order.findByPk(id,{
    include: orderIncludeArray
  });
  return order
  } catch (error) {
    console.log(`Falle en getOrderByPK`);
    return console.log(error);
  }
}
export async function getOrders() {
  try {
  //busco las ordenes
  let orders = await db.Order.findAll({
    include: orderIncludeArray
  });
  return orders
  } catch (error) {
    console.log(`Falle en getOrders`);
    return console.log(error);
  }
}

//Esta funcion toma el objeto y le hace una "foto" de las entidades que luego pueden cambiar
//En db necesitamos almacenar los datos que perduren, ej si se cambia la address tiene que 
//salir la misma que se compro no puede salir la actualizada, mismo con nombre de item,phone,etc
function createOrderEntitiesSnapshot(obj){
    let {billingAddress, shippingAddress, phoneObj} = obj;
    let billingAddressCountryName = countries?.find(count => count.id == billingAddress.country_id)?.name;
    let shippingAddressCountryName = countries?.find(count => count.id == shippingAddress.country_id)?.name;
    //Creo el snapshot de billingAddress
    obj.billing_address_street = billingAddress.street || '';
    obj.billing_address_detail = billingAddress.detail || '';
    obj.billing_address_city = billingAddress.city || '';
    obj.billing_address_province = billingAddress.province || '';
    obj.billing_address_zip_code = billingAddress.zip_code || '';
    obj.billing_address_label = billingAddress.label || '';
    obj.billing_address_country_name = billingAddressCountryName || '';
    //Mismo con shippingAddress
    obj.shipping_address_street = shippingAddress.street || '';
    obj.shipping_address_detail = shippingAddress.detail || '';
    obj.shipping_address_city = shippingAddress.city || '';
    obj.shipping_address_province = shippingAddress.province || '';
    obj.shipping_address_zip_code = shippingAddress.zip_code || '';
    obj.shipping_address_label = shippingAddress.label || '';
    obj.shipping_address_country_name = shippingAddressCountryName || '';
    //Ahora creo el de phone
    let phoneCode = countries?.find(count => count.id == phoneObj.country_id)?.code;
    obj.phone_code = phoneCode;
    obj.phone_number = phoneObj.phone_number;
    // Eliminar las propiedades que mande
    delete obj.billingAddress;
    delete obj.shippingAddress;
    delete obj.phoneObj;
}

