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
import { paymentTypes } from "../../utils/staticDB/paymentTypes.js";
import { shippingTypes } from "../../utils/staticDB/shippingTypes.js";
import {
  capturePaypalPayment,
  createPaypalOrder,
  getTokenFromUrl,
  handleCreateMercadoPagoOrder,
} from "./apiPaymentController.js";
import { MercadoPagoConfig } from "mercadopago";
import { getZonePricesFromDB } from "./apiShippingController.js";
import { HTTP_STATUS } from "../../utils/staticDB/httpStatusCodes.js";
import { deleteSensitiveUserData } from "./apiUserController.js";

// Agrega credenciales
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  sandbox: !process.env.NODE_ENV == 'production',
});
// ENV
const webTokenSecret = process.env.JSONWEBTOKEN_SECRET;

const controller = {
  getOrders: async (req, res) => {
    try {
      let { limit, offset, order_id, userLoggedId } = req.query;
      limit = (limit && parseInt(limit)) || undefined;
      offset = (limit && parseInt(req.query.offset)) || 0;
      order_id = order_id || undefined;
      userLoggedId = userLoggedId || undefined;
      
      let ordersFromDB = await getOrdersFromDB({
        id: order_id,
        limit,
        offset,
        user_id: userLoggedId,
      });

      // Mando la respuesta
      return res.status(HTTP_STATUS.OK.code).json({
        meta: {
          status: HTTP_STATUS.OK.code,
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
    let orderDataToDB;
    try {
      // Traigo errores
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        //Si hay errores en el back...
        //Para saber los parametros que llegaron..
        let { errorsParams, errorsMapped } = getMappedErrors(errors);

        return res.status(HTTP_STATUS.BAD_REQUEST.code).json({
          meta: {
            status: HTTP_STATUS.BAD_REQUEST.code,
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
        payment_type_id,
        shipping_type_id,
        variationsFromDB, //Del middleware
      } = req.body;

      // Si esta logueado y no tenia los nros y direcciones armadas...
      if (!billingAddress.id && user_id) {
        let billingAddressObjToDB = generateAddressObject(billingAddress);
        billingAddressObjToDB.user_id = user_id; //Si hay usuario loggeado lo agrego a esta
        let createdAddress = await insertAddressToDB(billingAddressObjToDB);
        if (!createdAddress)
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json();
        billingAddress.id = billingAddressObjToDB.id; //lo dejo seteado asi despues puedo acceder
      } else if (billingAddress?.id) {
        //Si vino el id, busco la address y la dejo desde db porlas
        billingAddress = await getAddresesFromDB(billingAddress.id);
      }
      if (shipping_type_id == 1) {
        if (shippingAddress && !shippingAddress?.id && user_id) {
          let shippingAddressObjToDB = generateAddressObject(shippingAddress);
          shippingAddressObjToDB.user_id = user_id; //Si hay usuario lo agrego a esta
          let createdAddress = await insertAddressToDB(shippingAddressObjToDB);
          if (!createdAddress)
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json();
          shippingAddress.id = shippingAddressObjToDB.id; //lo dejo seteado asi despues puedo acceder
        } else if (shippingAddress && shippingAddress?.id) {
          //Si vino el id, busco la address y la dejo desde db porlas
          shippingAddress = await getAddresesFromDB(shippingAddress.id);
        }
      }

      if (!phoneObj?.id && user_id) {
        let phoneObjToDB = generatePhoneObject({ ...phoneObj, user_id });
        let createdPhone = await insertPhoneToDB(phoneObjToDB);
        if (!createdPhone)
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json();
      } else if (phoneObj?.id) {
        phoneObj = await getPhonesFromDB(phoneObj.id);
      }

      // Armo el objeto del pedido
      const randomString = generateRandomNumber(10);
      orderDataToDB = {
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
        order_status_id: 5, //Aca es pendiente de pago
        shipping_type_id,
        payment_type_id,
      };
      // Tema total price
      let orderTotalPrice = 0;
      let shippingAccumulator = 0;
      // Tema shipping. Si es envio a domicilio le tengo que sumar el coste de shipping por el country
      let shippingPrice = null;
      if (orderDataToDB.shipping_type_id == 1) {
        //Envio a domicilio
        let zoneCountryToCheckPrice = orderDataToDB.shippingAddress.country_id;
        let dbCountry = countries.find(
          (count) => count.id == zoneCountryToCheckPrice
        );
        let shippingZonePrices = await getZonePricesFromDB({
          id: dbCountry.zone_id,
        });
        shippingPrice = parseFloat(shippingZonePrices.ars_price);
        const baseShippingPrice = orderDataToDB.payment_type_id == 1
            ? parseFloat(shippingZonePrices.ars_price)
            : parseFloat(shippingZonePrices.usd_price);
        variations.forEach((variation) => {
          shippingAccumulator = shippingAccumulator + (baseShippingPrice * parseFloat(variation.quantityRequested))
        })
        //Le sumo al totalPrice
        orderTotalPrice += shippingAccumulator
      }
      shippingPrice = shippingAccumulator;
      createOrderEntitiesSnapshot(orderDataToDB); //Funcion que saca "foto" de las entidades

      // armo los orderItems
      let orderItemsToDB = [];
      // Voy por las variaciones para restar stock
      variations.forEach((variation) => {
        let { quantityRequested, id } = variation; //Tengo que chequear con esa variacion
        // Agarro el producto de DB
        let variationFromDBIndex = variationsFromDB.findIndex(
          (variationFromDB) => variationFromDB.id == id
        );
        let variationFromDB = variationsFromDB[variationFromDBIndex];
        quantityRequested = parseInt(quantityRequested); //Lo parseo
        //Aca paso el chequeo de stock ==> lo resto al stock que tenia
        variationFromDB.quantity -= quantityRequested; //Le resto el stock
        //Hago el snapshot del  precio y nombre
        let orderItemEnName = variationFromDB.product?.eng_name;
        let orderItemEsName = variationFromDB.product?.es_name;
        //Si pago en mp entonces es precio pesos, sino precio usd
        let orderItemPrice =
          orderDataToDB.payment_type_id == 1
            ? variationFromDB.product?.ars_price
            : variationFromDB.product?.usd_price;
        orderItemPrice = orderItemPrice && parseFloat(orderItemPrice);
        let orderItemQuantity = parseInt(quantityRequested);
        // Voy armando el array de orderItems para hacer un bulkcreate
        let orderItemData = {
          id: uuidv4(),
          order_id: orderDataToDB.id,
          variation_id: variationFromDB.id,
          eng_name: orderItemEnName,
          es_name: orderItemEsName,
          price: orderItemPrice,
          quantity: orderItemQuantity,
          taco: variationFromDB.taco?.name,
          size: variationFromDB.size?.size,
          discount: 0, //Si hace el upgrade va a poder setear esto,
          sku: variationFromDB.product?.sku,
        };
        orderItemsToDB.push(orderItemData);
      });
      //Aca ya reste a las variaciones el stock, mapeo y dejo solo id y stock para luego hacer el bulkupdate de eso nomas
      variationsFromDB = variationsFromDB.map((variationFromDB) => ({
        id: variationFromDB.id,
        quantity: variationFromDB.quantity,
      }));
      // Hasta aca ya arme todo. (BillingAddress - Order - OrderItem - ShippingAddress) ==> Tengo que insertar en la DB

      orderItemsToDB.forEach((item) => {
        orderTotalPrice += parseFloat(item.price) * parseInt(item.quantity);
      });
      // Dejo seteado el total
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

      
      // Aca genero el url de paypal o de mp dependiendo que paymentTypeVino
      let paymentURL, paymentOrderId;

      if (payment_type_id == 1) {
        const mercadoPagoOrderResult = await handleCreateMercadoPagoOrder(
          orderItemsToDB,
          mpClient,
          shippingPrice
        );
        // id es el id de la preferencia
        // init_point a donde hay que redirigir
        const { init_point, id } = mercadoPagoOrderResult;
        paymentURL = init_point;
        paymentOrderId = id;
        if (!paymentURL || !paymentOrderId)
          throw new Error("Could not generate mercado pago order");
      } else if (payment_type_id == 2) {
        // PAYPAL
        paymentURL = await createPaypalOrder({
          ...orderDataToDB,
          orderItemsToDB,
        }); //Genero el link para enviar a pasarela de pagos paypal
        if (!paymentURL)
          throw new Error("Could not generate paypal paymentURL"); // Lanza un error y salta al catch
        // Obtengo el payment_order_id para pegarselo en el objeto
        paymentOrderId = getTokenFromUrl(paymentURL);
      }
      orderDataToDB.entity_payment_id = paymentOrderId;
      // Le actualizo el paypal_rder_id en db
      await db.Order.update(
        { entity_payment_id: paymentOrderId },
        { where: { id: orderDataToDB.id } }
      );
      console.log(`ORDER ${orderDataToDB.tra_id} CREATED, REDIRECTING TO: ${paymentURL}`);
      
      // Mando la respuesta
      return res.status(200).json({
        meta: {
          status: 200,
        },
        ok: true,
        msg: systemMessages.orderMsg.create,
        //Si paga con tarjetas lo tengo que redirigir, sino le pongo false y termina ahi
        url: paymentURL,
        orderTraID: orderDataToDB.tra_id,
      });
    } catch (error) {
      console.log(`Falle en apiOrderController.createOrder`);
      console.log(error);
      // aca dio error, tengo que cancelar la compra si es que se creo
      const disableResponse = await disableCreatedOrder(orderDataToDB.id);
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

      let orderFromDB = await getOrdersFromDB({ id: order_id });
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

      // Le  mando ok
      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/order",
          method: "PUT",
        },
        ok: true,
        msg: systemMessages.orderMsg.updateSuccesfull,
      });
    } catch (error) {
      console.log(`Falle en apiOrderController.updateOrder`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        console.log("No order id provided to update");
        return res.status(HTTP_STATUS.BAD_REQUEST.code).json({
          ok: false,
        });
      }

      const {
        body: { order_status_id },
      } = req;
      const orderFromDB = await getOrdersFromDB({ id: orderId });
      if (!orderFromDB)
        return res.status(HTTP_STATUS.NOT_FOUND.code).json({
          ok: false,
        });
      if (order_status_id == 6) {
        //La quiere anular
        const disableResponse = await disableCreatedOrder(orderId);
      } else {
        //Esto es para ver si estaba cancelada y ahora la quiere
        const wasCanceled = orderFromDB.order_status_id == 6;
        let stockWasDiscounted = true;
        if (wasCanceled) {
          stockWasDiscounted = await discountStockFromDB(orderFromDB); //Le saco los items de stock
        }
        if (!stockWasDiscounted)
          return res.status(HTTP_STATUS.CONFLICT.code).json({
            ok: false,
            msg: "No se puede modificar ya que no hay stocks de algunos productos",
          });
        //Aca es simplemente una modificacion
        await db.Order.update(
          { order_status_id },
          {
            where: {
              id: orderId,
            },
          }
        );
      }

      return res.status(HTTP_STATUS.OK.code).json({
        ok: true,
      });
    } catch (error) {
      console.log(`error in updateOrderStatus: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
        ok: false,
        data: null,
      });
    }
  },
  orderPaymentFailed: async (req, res) => {
    try {
      const { orderTraID } = req.params;
      if (!orderTraID) {
        console.log("No order id provided to update");
        return res.status(HTTP_STATUS.BAD_REQUEST.code).json({
          ok: false,
        });
      }
      const orderFromDB = await getOneOrderFromDB({ tra_id: orderTraID });
      if (!orderFromDB)
        return res.status(HTTP_STATUS.NOT_FOUND.code).json({
          ok: false,
        });
      //Aca la anulo
      let responseObj = await checkOrderPaymentExpiration(orderFromDB);
      return res.status(HTTP_STATUS.OK.code).json({
        ok: true,
        orderWasCanceled: responseObj?.type == 1,
        orderWasFulfilled: responseObj?.type == 2,
        tra_id: orderFromDB.tra_id
      });
    } catch (error) {
      console.log(`error in orderPaymentFailed: ${error}`);
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
        ok: false,
        data: null,
      });
    }
  },
};

export default controller;

let orderIncludeArray = [
  "user",
  {
    association: "orderItems",
    include: ["variation"],
  },
];

export async function getOrdersFromDB({ id, limit, offset, user_id }) {
  try {
    let orderToReturn, ordersToReturn;
    if (typeof id === "string") {
      orderToReturn = await db.Order.findByPk(id, {
        include: orderIncludeArray,
        order: [
          ["created_at", "DESC"], // ASC para orden ascendente, DESC para descendente
        ],
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
        order: [
          ["created_at", "DESC"], // ASC para orden ascendente, DESC para descendente
        ],
      });
    }
    else if (user_id) {
      //Aca busco por ordenes de un user
      ordersToReturn = await db.Order.findAll({
        where: {
          user_id,
        },
        include: orderIncludeArray,
        order: [
          ["created_at", "DESC"], // ASC para orden ascendente, DESC para descendente
        ],
      });
    }
    // Condición si id es undefined
    else if (id === undefined) {
      ordersToReturn = await db.Order.findAll({
        include: orderIncludeArray,
        order: [
          ["created_at", "DESC"], // ASC para orden ascendente, DESC para descendente
        ],
      });
    } 

    if (!ordersToReturn || !ordersToReturn.length) return [];
    ordersToReturn = getDeepCopy(ordersToReturn);
    ordersToReturn?.forEach((orderToReturn) => {
      setOrderKeysToReturn(orderToReturn);
    });

    return ordersToReturn;
  } catch (error) {
    console.log(`Falle en getOrders`);
    return console.log(error);
  }
}
export async function getOneOrderFromDB(searchCriteria) {
  try {
    if (!searchCriteria || Object.keys(searchCriteria).length === 0)
      return null;

    let orderToReturn = await db.Order.findOne({
      where: searchCriteria, // Permite búsqueda dinámica
      include: orderIncludeArray,
    });

    if (!orderToReturn) return null;

    orderToReturn = getDeepCopy(orderToReturn);
    setOrderKeysToReturn(orderToReturn);

    return orderToReturn;
  } catch (error) {
    console.error(`Falle en getOrderFromDB:`, error);
    return null; // No retornar console.log, sino null
  }
}

//Esta funcion toma el objeto y le hace una "foto" de las entidades que luego pueden cambiar
//En db necesitamos almacenar los datos que perduren, ej si se cambia la address tiene que
//salir la misma que se compro no puede salir la actualizada, mismo con nombre de item,phone,etc
function createOrderEntitiesSnapshot(obj) {
  let { billingAddress, shippingAddress, phoneObj, shipping_type_id } = obj;
  let billingAddressCountryName = countries?.find(
    (count) => count.id == billingAddress.country_id
  )?.name;
  let shippingAddressCountryName =
    shipping_type_id == 1
      ? countries?.find((count) => count.id == shippingAddress?.country_id)
          ?.name
      : null;
  //Creo el snapshot de billingAddress
  obj.billing_address_street = billingAddress.street || "";
  obj.billing_address_detail = billingAddress.detail || "";
  obj.billing_address_city = billingAddress.city || "";
  obj.billing_address_province = billingAddress.province || "";
  obj.billing_address_zip_code = billingAddress.zip_code || "";
  obj.billing_address_label = billingAddress.label || "";
  obj.billing_address_country_name = billingAddressCountryName || "";
  //Mismo con shippingAddress
  const shippingAddressNotRequired = shipping_type_id == 2; //Retiro por local
  obj.shipping_address_street = shippingAddressNotRequired
    ? null
    : shippingAddress.street || "";
  obj.shipping_address_detail = shippingAddressNotRequired
    ? null
    : shippingAddress.detail || "";
  obj.shipping_address_city = shippingAddressNotRequired
    ? null
    : shippingAddress.city || "";
  obj.shipping_address_province = shippingAddressNotRequired
    ? null
    : shippingAddress.province || "";
  obj.shipping_address_zip_code = shippingAddressNotRequired
    ? null
    : shippingAddress.zip_code || "";
  obj.shipping_address_label = shippingAddressNotRequired
    ? null
    : shippingAddress.label || "";
  obj.shipping_address_country_name = shippingAddressNotRequired
    ? null
    : shippingAddressCountryName || "";
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

function setOrderKeysToReturn(order) {
  order.orderStatus = ordersStatuses.find(
    (status) => status.id == order.order_status_id
  );
  order.paymentType = paymentTypes.find(
    (payType) => payType.id == order.payment_type_id
  );
  order.shippingType = shippingTypes.find(
    (shipType) => shipType.id == order.shipping_type_id
  );
  order.currencyType = currencies?.find(
    (curType) => curType.id == order.currency_id
  );
  order.orderItemsPurchased = order.orderItems.reduce((acum, item) => {
    return acum + item.quantity;
  }, 0);
  order.orderItemsPurchasedPrice = order.orderItems.reduce((acum, item) => {
    return acum + parseInt(item.quantity) * parseFloat(item.price || 0);
  }, 0);
  order.shippingCost = parseFloat(order.total) - order.orderItemsPurchasedPrice;
  deleteSensitiveUserData(order.user);
}

const restoreStock = async (order) => {
  try {
    if (order.orderItems && order.orderItems.length > 0) {
      const OrderItemsToRestore = order.orderItems.map((orderItem) => ({
        id: orderItem.variation_id,
        quantity: orderItem.quantity,
      }));
      for (const item of OrderItemsToRestore) {
        await db.Variation.increment("quantity", {
          by: item.quantity, // Aumenta el stock en 10
          where: { id: item.id }, // Filtra por el ID del producto
        });
      }
      console.log("Stock restaurado correctamente");
    }
  } catch (error) {
    console.error("Error restaurando stock:", error);
  }
};
export const discountStockFromDB = async (order) => {
  try {
    if (order.orderItems && order.orderItems.length > 0) {
      const orderItemsToRestore = order.orderItems.map((orderItem) => ({
        id: orderItem.variation_id,
        quantity: orderItem.quantity,
      }));

      let variationsToFetch = orderItemsToRestore.map(
        (variation) => variation.id
      );
      let variationsFromDB = await getVariationsFromDB(variationsToFetch);

      // Verificar si todos los productos tienen stock suficiente
      const canDiscountAll = orderItemsToRestore.every((item) => {
        const variation = variationsFromDB.find((v) => v.id === item.id);
        return variation && variation.quantity >= item.quantity;
      });

      if (!canDiscountAll) {
        console.error("Stock insuficiente para uno o más productos.");
        return false;
      }

      // Descontar stock
      for (const item of orderItemsToRestore) {
        await db.Variation.decrement("quantity", {
          by: item.quantity, // Resta el stock
          where: { id: item.id }, // Filtra por el ID del producto
        });
      }

      console.log("Stock descontado correctamente");
      return true;
    }
  } catch (error) {
    console.error("Error descontando stock:", error);
  }
};

export async function disableCreatedOrder(orderID) {
  try {
    let orderFromDB = await getOrdersFromDB({ id: orderID });
    if (!orderFromDB || orderFromDB.order_status_id == 6) return false; 
    //La deshabilito
    await db.Order.update(
      {
        order_status_id: 6,
      },
      {
        where: {
          id: orderID,
        },
      }
    );

    await restoreStock(orderFromDB);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function checkOrderPaymentExpiration(order) {
  // Suponiendo que order.created_at es una cadena de fecha en formato ISO
  const createdAt = new Date(order.createdAt);
  const now = new Date();

  // Calcular la diferencia en minutos
  const diffMinutes = (now - createdAt) / (1000 * 60);

  // Si han pasado más de 20 minutos, deshabilitar la orden
  if (diffMinutes > 20) {
    await disableCreatedOrder(order.id);
    return { type: 1 }; //1 es para cancelacion
  } else {
    //Esta dentro del periodo de compra ==> veo si puedo 're-capturar' el pago que hizo (SOLO PAYPAL)
    if (order.entity_payment_id && order.payment_type_id == 2) {
      const token = order.entity_payment_id;
      //Aca ya capturo un pago, trato de capturarlo
      const paymentResponse = await capturePaypalPayment(token);
      if (!paymentResponse || !paymentResponse.status) {
        console.error(
          "Error inesperado en la captura de pago de PayPal",
          paymentResponse
        );

        return false;
      }
      if (paymentResponse.status === "COMPLETED") {
        let updatedStatus = order.shipping_type_id == 1 ? 2 : 3;
        // ✅ Marcar la orden como pagada en tu base de datos
        await db.Order.update(
          {
            order_status_id: updatedStatus, //2 es pendiente de envio, 3 de recoleccion
          },
          {
            where: {
              id: order.id,
            },
          }
        );
        return { type: 2 }; //2 es para confirmacion de compra;
      }
    }
  }
  return false;
}
