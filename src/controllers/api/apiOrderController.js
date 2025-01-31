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
import getDeepCopy from "../../utils/helpers/getDeepCopy.js";

import countries from "../../utils/staticDB/countries.js";
import sendVerificationCodeMail from "../../utils/helpers/sendverificationCodeMail.js";
import ordersStatuses from "../../utils/staticDB/ordersStatuses.js";
import {
  generateAddressObject,
  getAddresesFromDB,
  getUserAddressesFromDB,
  insertAddressToDB,
} from "./apiAddressController.js";
import getFileType from "../../utils/helpers/getFileType.js";
import {
  destroyFilesFromAWS,
  getFilesFromAWS,
  uploadFilesToAWS,
} from "../../utils/helpers/awsHandler.js";
import {
  findProductsInDb,
  getVariationsFromDB,
} from "./apiProductController.js";
import generateRandomNumber from "../../utils/helpers/generateRandomNumber.js";
import {
  generatePhoneObject,
  getPhonesFromDB,
  getUserPhonesFromDB,
  insertPhoneToDB,
} from "./apiPhoneController.js";
import { getMappedErrors } from "../../utils/helpers/getMappedErrors.js";
import currencies from "../../utils/staticDB/currencies.js";

// ENV
const webTokenSecret = process.env.JSONWEBTOKEN_SECRET;

const controller = {
  getOrders: async (req, res) => {
    try {
      let { limit, offset, order_id, user_id } = req.query;
      limit = (limit && parseInt(limit)) || undefined;
      offset = (limit && parseInt(req.query.offset)) || 0;
      order_id = order_id || undefined;
      user_id = user_id || undefined;
      let ordersFromDB = await getOrdersFromDB({
        id: order_id,
        limit,
        offset,
        user_id
      });

      // Mando la respuesta
      return res.status(201).json({
        meta: {
          status: 201,
          path: "/api/order/",
          method: "GET",
        },
        ok: true,
        orders: ordersFromDB,
      });
    } catch (error) {
      console.log(`Falle en apiOrderController.getOrders`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  createOrder: async (req, res) => {
    try {
      // Traigo errores
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        //Si hay errores en el back...
        //Para saber los parametros que llegaron..
        let { errorsParams, errorsMapped } = getMappedErrors(errors);
        return res.status(422).json({
          meta: {
            status: 422,
            url: "/api/order",
            method: "POST",
          },
          ok: false,
          errors: errorsMapped,
          params: errorsParams,
          msg: systemMessages.formMsg.validationError.es,
        });
      }
      let {
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
        variationsFromDB, //Del middleware
        language, //TODO: Cambiar modelos y setear dependiendo lo que llegue
      } = req.body;
      // Si esta logueado y no tenia los nros y direcciones armadas...
      if (!billingAddress.id && user_id) {
        let billingAddressObjToDB = generateAddressObject(billingAddress);
        billingAddressObjToDB.user_id = user_id; //Si hay usuario loggeado lo agrego a esta
        let createdAddress = await insertAddressToDB(billingAddressObjToDB);
        if (!createdAddress) return res.status(502).json();
        billingAddress.id = billingAddressObjToDB.id; //lo dejo seteado asi despues puedo acceder
      } else if (billingAddress?.id) {
        //Si vino el id, busco la address y la dejo desde db porlas
        billingAddress = await getAddresesFromDB(billingAddress.id);
      }
      if (!shippingAddress.id && user_id) {
        let shippingAddressObjToDB = generateAddressObject(shippingAddress);
        shippingAddressObjToDB.user_id = user_id; //Si hay usuario lo agrego a esta
        let createdAddress = await insertAddressToDB(shippingAddressObjToDB);
        if (!createdAddress) return res.status(502).json();
        shippingAddress.id = shippingAddressObjToDB.id; //lo dejo seteado asi despues puedo acceder
      } else if (shippingAddress?.id) {
        //Si vino el id, busco la address y la dejo desde db porlas
        shippingAddress = await getAddresesFromDB(shippingAddress.id);
      }
      if (!phoneObj?.id && user_id) {
        let phoneObjToDB = generatePhoneObject({ ...phoneObj, user_id });
        let createdPhone = await insertPhoneToDB(phoneObjToDB);
        if (!createdPhone) return res.status(502).json();
        if (user_id) phoneObjToDB.user_id = user_id; //Si hay usuario lo agrego a esta
      } else if (phoneObj?.id) {
        phoneObj = getPhonesFromDB(phoneObj.id);
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
        phoneObj, //{}
        billingAddress,
        shippingAddress,
        order_status_id: shipping_types_id == 1 ? 2 : 3, //Si es con shipping una vez la compran queda "pendiente de envio", sino queda pendiente de recoleccion
        shipping_types_id,
        payment_types_id,
      };
      createOrderEntitiesSnapshot(orderDataToDB); //Funcion que saca "foto" de las entidades
      // armo los orderItems
      let orderItemsToDB = [];
      variations.forEach((variation) => {
        // Agarro el producto de DB
        let variationFromDBIndex = variationsFromDB.findIndex(
          (variationFromDB) => variationFromDB.id == variation.id
        );
        let variationFromDB = variationsFromDB[variationFromDBIndex];
        let { quantityRequested } = variation; //Tengo que chequear con esa variacion
        quantityRequested = parseInt(quantityRequested); //Lo parseo
        //Aca paso el chequeo de stock ==> lo resto al stock que tenia
        variationFromDB.quantity -= quantityRequested; //Le resto el stock
        //Hago el snapshot del  precio y nombre
        let orderItemEnName = variationFromDB.product?.eng_name;
        let orderItemEsName = variationFromDB.product?.es_name;
        //Si pago en mp entonces es precio pesos, sino precio usd
        let orderItemPrice = orderDataToDB.payment_types_id == 1 ? variationFromDB.product?.ars_price : variationFromDB.product?.usd_price;
        orderItemPrice = orderItemPrice && parseFloat(orderItemPrice);
        let orderItemQuantity = parseInt(quantityRequested);
        // Voy armando el array de orderItems para hacer un bulkcreate
        let orderItemData = {
          id: uuidv4(),
          order_id: orderDataToDB.id,
          product_id: variationFromDB.product_id,
          eng_name: orderItemEnName,
          es_name: orderItemEsName,
          price: orderItemPrice,
          quantity: orderItemQuantity,
          taco: variationFromDB.taco?.name,
          size: variationFromDB.size?.size,
          discount: 0, //Si hace el upgrade va a poder setear esto
        };
        orderItemsToDB.push(orderItemData);
      });
      //Aca ya reste a las variaciones el stock, mapeo y dejo solo id y stock para luego hacer el bulkupdate de eso nomas
      variationsFromDB = variationsFromDB.map((variationFromDB) => ({
        id: variationFromDB.id,
        quantity: variationFromDB.quantity,
      }));
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
          include: ["orderItems"],
        }
      );
      //Si la orden se creo ok, hago el bulkupdate de las variations
      variationsFromDB.length &&
        (await db.Variation.bulkCreate(variationsFromDB, {
          updateOnDuplicate: ["quantity"],
        }));
      orderCreated = await getOrdersFromDB({id : orderDataToDB.id});
      // Borro los temp items si es que viene usuario loggeado
      if (user_id) {
        await db.TempCartItem.destroy({
          where: {
            user_id,
          },
        });
      }
      // await sendOrderMails(orderCreated); //TODO:
      // Mando la respuesta
      return res.status(200).json({
        meta: {
          status: 200,
        },
        ok: true,
        order_id: orderCreated.tra_id,
        msg: systemMessages.orderMsg.create, //TODO: ver
        //Si paga con tarjetas lo tengo que redirigir, sino le pongo false y termina ahi
        redirect: "/",
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
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        //Si hay errores en el back...
        errors = errors.mapped();

        // Ver como definir los errors
        // return res.send(errors)
        return res.status(422).json({
          meta: {
            status: 422,
            url: "/api/user",
            method: "POST",
          },
          ok: false,
          errors,
          msg: systemMessages.formMsg.validationError.es,
        });
      }

      // Datos del body
      let { order_id, order_status_id } = req.body;

      let orderFromDB = await getOrdersFromDB({id: order_id});
      if (!orderFromDB)
        return res
          .status(404)
          .json({ ok: false, msg: systemMessages.orderMsg.updateFailed });

      let keysToUpdate = {
        order_status_id,
      };

      await db.Order.update(keysToUpdate, {
        where: {
          id: order_id,
        },
      });

      // Le  mando ok con el redirect al email verification view
      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/order",
          method: "PUT",
        },
        ok: true,
        msg: systemMessages.orderMsg.updateSuccesfull.es, //TODO: ver tema idioma
      });
    } catch (error) {
      console.log(`Falle en apiOrderController.updateOrder`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  updateOrderStatus: async (req, res) => {
    try {
      const {orderId} = req.params;
      if(!orderId){
        console.log('No order id provided to update')
        return res.status(400).json({
          ok: false
        })
      }
      const { body: { order_status_id } } = req;
      await db.Order.update({order_status_id}, {
        where: {
          id: orderId
        }
      })
      return res.status(204).json({
        ok: true
      })
    } catch (error) {
      console.log(`error in updateOrderStatus: ${error}`);
      return res.status(500).json({
        ok: false,
        data: null
      })
    }
  }
};

export default controller;

let orderIncludeArray = [
  "user", 
  {
    association: "orderItems",
    include: ['product']
  }
];

export async function getOrdersFromDB({ id, limit, offset, user_id }) {
  try {
    let orderToReturn, ordersToReturn;
    if (typeof id === "string") {
      orderToReturn = await db.Order.findByPk(id, {
        include: orderIncludeArray,
      });
      if (!orderToReturn) return null;
      orderToReturn = orderToReturn && getDeepCopy(orderToReturn);
      setOrderKeysToReturn(orderToReturn);
      return orderToReturn;
    }
    // Condición si id es un array
    else if (Array.isArray(id)) {
      ordersToReturn = await db.Order.findAll({
        where: {
          id: id, // id es un array, se hace un WHERE id IN (id)
        },
        include: orderIncludeArray,
      });
    }
    // Condición si id es undefined
    else if (id === undefined) {
      ordersToReturn = await db.Order.findAll({
        include: orderIncludeArray,
      });
    } else if (user_id) {
      //Aca busco por ordenes de un user
      ordersToReturn = await db.Order.findAll({
        where: {
          user_id,
        },
        include: orderIncludeArray,
      });
    }
  
    
    if (!ordersToReturn || !ordersToReturn.length) return [];
    ordersToReturn = getDeepCopy(ordersToReturn);
    ordersToReturn?.forEach(orderToReturn=> {
      setOrderKeysToReturn(orderToReturn);
      populateCurrencies(orderToReturn);
    });

    return ordersToReturn;
  } catch (error) {
    console.log(`Falle en getOrders`);
    return console.log(error);
  }
}

const populateCurrencies = (order) => {
  order.currency = currencies.find(currency => currency.id === order.currency_id)
}

//Esta funcion toma el objeto y le hace una "foto" de las entidades que luego pueden cambiar
//En db necesitamos almacenar los datos que perduren, ej si se cambia la address tiene que
//salir la misma que se compro no puede salir la actualizada, mismo con nombre de item,phone,etc
function createOrderEntitiesSnapshot(obj) {
  let { billingAddress, shippingAddress, phoneObj } = obj;
  let billingAddressCountryName = countries?.find(
    (count) => count.id == billingAddress.country_id
  )?.name;
  let shippingAddressCountryName = countries?.find(
    (count) => count.id == shippingAddress.country_id
  )?.name;
  //Creo el snapshot de billingAddress
  obj.billing_address_street = billingAddress.street || "";
  obj.billing_address_detail = billingAddress.detail || "";
  obj.billing_address_city = billingAddress.city || "";
  obj.billing_address_province = billingAddress.province || "";
  obj.billing_address_zip_code = billingAddress.zip_code || "";
  obj.billing_address_label = billingAddress.label || "";
  obj.billing_address_country_name = billingAddressCountryName || "";
  //Mismo con shippingAddress
  obj.shipping_address_street = shippingAddress.street || "";
  obj.shipping_address_detail = shippingAddress.detail || "";
  obj.shipping_address_city = shippingAddress.city || "";
  obj.shipping_address_province = shippingAddress.province || "";
  obj.shipping_address_zip_code = shippingAddress.zip_code || "";
  obj.shipping_address_label = shippingAddress.label || "";
  obj.shipping_address_country_name = shippingAddressCountryName || "";
  //Ahora creo el de phone
  let phoneCode = countries?.find(
    (count) => count.id == phoneObj.country_id
  )?.code;
  obj.phone_code = phoneCode;
  obj.phone_number = phoneObj.phone_number;
  // Eliminar las propiedades que mande
  delete obj.billingAddress;
  delete obj.shippingAddress;
  delete obj.phoneObj;
}

function setOrderKeysToReturn(order){
  order.orderStatus = ordersStatuses.find(status=>status.id == order.order_status_id)
}
