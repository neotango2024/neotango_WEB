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
import generateRandomCodeWithExpiration from "../../utils/generateRandomCodeWithExpiration.js";
import capitalizeFirstLetterOfEachWord from "../../utils/capitalizeFirstLetterOfString.js";
import getDeepCopy from "../../utils/getDeepCopy.js";

import countries from "../../utils/staticDB/countries.js";
import sendVerificationCodeMail from "../../utils/sendverificationCodeMail.js";
import ordersStatuses from "../../utils/staticDB/ordersStatuses.js";
import { getUserAddressesFromDB } from "./apiAddressController.js";
import getFileType from "../../utils/getFileType.js";
import { destroyFilesFromAWS, getFilesFromAWS, uploadFilesToAWS } from "../../utils/awsHandler.js";

// ENV
const webTokenSecret = process.env.JSONWEBTOKEN_SECRET;

const controller = {
  createUser: async (req, res) => {
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
      let { first_name, last_name, email, password } = req.body;
      

      //Nombres y apellidos van capitalziados
      first_name = capitalizeFirstLetterOfEachWord(first_name, true);
      last_name = capitalizeFirstLetterOfEachWord(last_name, true);

      let userDataToDB = {
        id: uuidv4(),
        first_name,
        last_name,
        email,
        password: bcrypt.hashSync(password, 10), //encripta la password ingresada ,
        user_role_id: 2, //User
        verified_email: false,
      };
      
      await generateAndInstertEmailCode(userDataToDB);
      return res.status(201).json({ userDataToDB });
      const userCreated = await db.User.create(userDataToDB); //Creo el usuario
      // Lo tengo que loggear directamente
      const cookieTime = 1000 * 60 * 60 * 24 * 7; //1 Semana

      // Generar el token de autenticación
      const token = jwt.sign({ id: userCreated.id }, webTokenSecret, {
        expiresIn: "1w",
      }); // genera el token
      res.cookie("userAccessToken", token, {
        maxAge: cookieTime,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      // Le  mando ok con el redirect al email verification view
      return res.status(201).json({
        meta: {
          status: 201,
          url: "/api/user",
          method: "POST",
        },
        ok: true,
        msg: systemMessages.userMsg.createSuccesfull.es, //TODO: ver tema idioma
        redirect: "/",
      });
    } catch (error) {
      console.log(`Falle en apiUserController.createUser`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  updateUser: async (req, res) => {
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
  getUserOrders: async (req, res) => {
    try {
      let { userLoggedId } = req.session;
      let userOrders = await db.Order.findAll({
        where: {
          user_id: userLoggedId,
        },
        include: [
          "shippingAddress",
          "billingAddress",
          {
            association: "orderItems",
            include: [
              {
                association: "product",
                include: ["files"],
                paranoid: false,
              },
            ],
          },
        ],
        order: [
          [
            Sequelize.literal(
              "cast(substring_index(tra_id, '-', 1) as unsigned)"
            ),
            "DESC",
          ],
        ],
        // paranoid: false;
      });
      userOrders = getDeepCopy(userOrders);
      // return res.send(ordersToPaint);
      // Voy por cada una
      for (let i = 0; i < userOrders.length; i++) {
        const order = userOrders[i];
        // Esto es para traer el estado de la venta
        let orderStatus = ordersStatuses.find(
          (stat) => stat.id == order.order_status_id
        );
        let statusColor;
        switch (orderStatus.id) {
          case 1: //confirmada
            statusColor = "#0f0";
            break;
          case 5: //Anulada
            statusColor = "#f00";
            break;
          case 7: //Anulada
            statusColor = "#f00";
            break;

          default: //Pendiente
            statusColor = "#ffd100";
            break;
        }
        order.status = {
          status: orderStatus.status,
          color_code: statusColor,
        };
        // Esto es para ver si tiene direccion de entrega

        // Esto es para: traer el url de cada producto TODO:
        for (let j = 0; j < order.orderItems.length; j++) {
          const item = order.orderItems[j];
          // Busco en los files del item la mainImage, o la primer foto
          let fileToGetURL;
          fileToGetURL = item.product?.files?.find((file) => file.main_image);
          // Si no encontro main, busco la primer foto
          !fileToGetURL
            ? (fileToGetURL = item.product.files.find(
                (file) => file.file_types_id == 1
              ))
            : null;
          if (fileToGetURL) {
            const getObjectParams = {
              Bucket: bucketName,
              Key: `product/${fileToGetURL.filename}`,
            };
            const command = new GetObjectCommand(getObjectParams);
            url = await getSignedUrl(s3, command, { expiresIn: 1800 }); //30 min
            item.file_url = url;
          }
        }
      }

      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/user/order",
          method: "GET",
        },
        ok: true,
        orders: userOrders,
      });
    } catch (error) {
      console.log(`Falle en apiUserController.getUserOrders`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  getUserAddresses: async(req,res) =>{
    try {
      let { userLoggedId } = req.session;
      let userAddresses = await getUserAddressesFromDB(userLoggedId);
      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/user/address",
          method: "GET",
        },
        ok: true,
        addresses: userAddresses || [],
      });
    } catch (error) {
      console.log(`Falle en apiUserController.getUserAddresses`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
  generateNewEmailCode: async (req, res) => {
    try {
      let { user_id } = req.body;
      // busco el usuario
      const userFromDB = await getUserByPK(user_id)
      if(!userFromDB) return res
      .status(400)
      .json({ ok: false, msg: systemMessages.generalMsg.failed.es });
      //Aca lo encontro, genero el codigo
      await generateAndInstertEmailCode(userFromDB);
      return res.status(200).json({
        ok: true,
        msg: systemMessages.userMsg.verificationCodeSuccess.es,
      });
    } catch (error) {
      console.log("Falle en apiUserController.getEmailCode:", error);
      return res.json({ error });
    }
  },
  testAWS: async(req,res)=>{
    try {
      let filesToGet = [
        {
          filename: "index-jyz6jr6yu1",
          file_types_id: 1
        },
        {
          filename: "index-rrkw09emzp",
          file_types_id: 1
        },
        {
          filename: "index-gzkz01oqlv.mp4",
          file_types_id: 2
        }
      ];
      let objectToGet = {
        folderName: "index",
        files: filesToGet
      }
      let files = await getFilesFromAWS(objectToGet)
      return res.status(200).json({files})
    } catch (error) {
      console.log(error);
      return
      
    }
  }
};

export default controller;

export async function generateAndInstertEmailCode(user) {
  try {
    // Genero el codigo de verificacion
  const { verificationCode, expirationTime } =
  generateRandomCodeWithExpiration();
  await sendVerificationCodeMail(verificationCode, user.email);
  let objectToDB = {
    verification_code: verificationCode,
    expiration_time: expirationTime,
  };
  //Lo cambio en db
  await db.User.update({objectToDB},{
    where: {
      id: user.id
    }
  });
  } catch (error) {
    console.log(`Falle en generateAndInstertEmailCode`);
    return console.log(error);
  }
}

export async function getUserByPK(id) {
  try {
  //busco el usuario
  let user = await db.User.findByPk(id,{
    include: ['cart','orders']
  });
  return user
  } catch (error) {
    console.log(`Falle en getUserByPK`);
    return console.log(error);
  }
}
export async function getUsers() {
  try {
  //busco los usuarios
  let users = await db.User.findAll({
    include: ['cart','orders']
  });
  return users
  } catch (error) {
    console.log(`Falle en getUserByPK`);
    return console.log(error);
  }
}

