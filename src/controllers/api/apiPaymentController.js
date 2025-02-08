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
import axios from "axios";
import { log } from "console";
import { HTTP_STATUS } from "../../utils/staticDB/httpStatusCodes.js";
// way to replace __dirname in es modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const controller = {
  
};

export default controller;

async function generatePaypalAccessToken() {
  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v1/oauth2/token",
    method: "POST",
    data: "grant_type=client_credentials",
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET_ID,
    },
  });
  return response.data.access_token;
}

export async function createPaypalOrder() {
  const accessToken = await generatePaypalAccessToken();

  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          items: [
            //Detalle de los productos
            {
              name: "T-Shirt",
              description: "Super Fresh Shirt",
              unit_amount: {
                currency_code: "USD",
                value: "20.00" /* Valor unitario*/,
              },
              quantity: "1",
              category: "PHYSICAL_GOODS",
              sku: "sku01",
            },
          ],
          amount: {
            currency_code: "USD",
            value: "30.00", //Total de compra
            breakdown: {
              item_total: { currency_code: "USD", value: "20.00" }, //Solo productos
              shipping: { currency_code: "USD", value: "10.00" }, //Solo shipping
            },
          },
        },
      ],
      application_context: {
        return_url: process.env.BASE_URL + "/complete-order",
        cancel_url: process.env.BASE_URL + "/cancel-order",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        brand_name: "neotango",
      },
    }),
  });
  return response?.data?.links?.find((link) => link.rel === "approve")?.href || undefined;
}

export async function capturePaypalPayment(orderId){
    const accessToken = await generatePaypalAccessToken();
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
        method: POST,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
    });

    return response.data
}

export function getTokenFromUrl(url) {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get('token'); // Obtiene el valor del parámetro 'token'
}