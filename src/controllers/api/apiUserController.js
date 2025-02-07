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
import { getUserAddressesFromDB } from "./apiAddressController.js";
import getFileType from "../../utils/helpers/getFileType.js";
import { destroyFilesFromAWS, getFilesFromAWS, uploadFilesToAWS } from "../../utils/helpers/awsHandler.js";

import { getMappedErrors } from "../../utils/helpers/getMappedErrors.js";
import { getOrdersFromDB } from "./apiOrderController.js";
import { findProductsInDb } from "./apiProductController.js";

const { verify } = jwt;

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
      let { first_name, last_name, email, password, language } = req.body;
      

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
        preffered_language: language,
      };
      const userCreated = await insertUserToDB(userDataToDB); //Creo el usuario
      let emailResponse = await generateAndInstertEmailCode(userDataToDB);
      if(!emailResponse) return res.status(500).json({});
      //return res.status(201).json({ userDataToDB });
      
      // Lo tengo que loggear directamente
      const cookieTime = 1000 * 60 * 60 * 24 * 7; //1 Semana

      // Generar el token de autenticación
      const token = jwt.sign({ id: userCreated.id }, webTokenSecret, {
        expiresIn: "1w",
      }); // genera el token
      res.cookie("userAccessToken", token, {
        maxAge: cookieTime,
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
        sameSite: "strict",
      });
      console.log(req.cookies.userAccessToken)
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
      
      let userFromDB = await getUsersFromDB(user_id);
      if (!userFromDB)
        return res
          .status(404)
          .json({ ok: false, msg: systemMessages.userMsg.updateFailed });
      //Nombres y apellidos van capitalziados
      first_name = capitalizeFirstLetterOfEachWord(first_name, true);
      last_name = capitalizeFirstLetterOfEachWord(last_name, true);

      let keysToUpdate = {
        first_name,
        last_name,
        gender_id: gender_id || null,
      };
      await updateUserFromDB(keysToUpdate,user_id);

      // Le  mando ok con el redirect al email verification view
      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/user",
          method: "PUT",
        },
        ok: true,
        msg: systemMessages.userMsg.updateSuccesfull,
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
      let { userLoggedId } = req.query;
      let userOrders = await getOrdersFromDB({user_id: userLoggedId}) || [];
      
      // return res.send(ordersToPaint);
      //Una vez tengo todas las ordenes, obtengo todos los productos que quiero mostrar, y por cada uno hago el setKeysToReturn
      let idsToLook = [];
      userOrders?.forEach(order=>{
        order.orderItems?.forEach(orderItem=>!idsToLook.includes(orderItem.product_id) && idsToLook.push(orderItem.product_id))
      });
      //Una vez obtenido, agarro los productos de DB para agarrar sus fotos
      let productsFromDB = await findProductsInDb(idsToLook,null,true)
      userOrders?.forEach(order=>{
        order.orderItems?.forEach(orderItem=>{
          let productFromDB = productsFromDB.find(prod=>prod.id == orderItem.product_id);
          orderItem.product = productFromDB
      })
      });

      return res.status(200).json({
        meta: {
          status: 200,
          url: "/api/user/order",
          method: "GET",
        },
        ok: true,
        data: userOrders,
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
      let { user_id } = req.query;
      // busco el usuario
      const userFromDB = await getUsersFromDB(user_id)
      if(!userFromDB) return res
      .status(400)
      .json({ ok: false, msg: systemMessages.generalMsg.failed.es });
      //Aca lo encontro, genero el codigo
      await generateAndInstertEmailCode(userFromDB);
      return res.status(200).json({
        ok: true,
        msg: systemMessages.userMsg.verificationCodeSuccess,
      });
    } catch (error) {
      console.log("Falle en apiUserController.getEmailCode:", error);
      return res.json({ error });
    }
  },
  handleChangeLanguage: async (req, res) => {
    try {
      const {body, params} = req;
      const { userId } = params;
      const {payment_type_id} = body;
      const user = await getUsersFromDB(userId);
      if(!user) return res.status(404).json({}); //Retorno error
      const isSuccessUpdatingLanguage = await updateUserLanguageInDb(payment_type_id, userId);
      if(!isSuccessUpdatingLanguage){
        return res.status(500).json({
          ok: false,
          msg: 'Internal server error'
        })
      }
      return res.status(200).json({
        ok: true
      })
    } catch (error) {
      console.log(`Error changing language`);
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: 'Internal server error'
      })
    }
  },
  handleCheckForUserLogged: async (req, res) => {
    try {
      const token = req.cookies.userAccessToken;
      if(!token){
        return res.status(200).json({
          ok: true,
          data: null
        })
      }
      const decoded = verify(token,webTokenSecret);
      const user = await getUsersFromDB(decoded.id);
      if(!user) {
        return res.status(500).json({
          ok: false,
          data: null,
          msg: 'User not found'
        })
      }
      deleteSensitiveUserData(user);
      return res.status(200).json({
        ok: true,
        data: user
      })
    } catch (error) {
      console.log(`error fetching user logged: ${error}`);
      return res.status(500).json({
        ok: false,
        data: {
          isLogged: false
        },
        msg: 'Internal server error'
      })
    }
  },
  checkForEmailCode: async(req,res)=>{
    try {
      let { code, user_id } = req.body;
      code = JSON.parse(code);
      let user = await getUsersFromDB(user_id)
      if (!user) return res.status(404).json();
      // Primero me fijo que el expiration time este bien
      const codeExpirationTime = new Date(user.expiration_time);
      const currentTime = new Date();
      // Este if quiere decir que se vencio
      if (currentTime > codeExpirationTime) {
        return res.status(200).json({
          ok: false,
          msg: "El codigo ha vencido, solicita otro e intente nuevamente",
        });
      }
      // Aca el tiempo es correcto ==> Chequeo codigo
      if (code != user.verification_code) {
        return res.status(200).json({
          ok: false,
          msg: systemMessages.userMsg.userVerifiedFail, 
        });
      }
      // Aca esta todo ok ==> Hago el update al usuario y mando el status ok
      let updateObj = {
        verified_email: 1,
        verification_code: null,
        expiration_time: null,
      }
      let response = await updateUserFromDB(updateObj, user_id);
      //Ahora elimino todos los usuarios con ese mismo mail y sin verificar
      await db.User.destroy({
        where:{
          email: user.email,
          verified_email: false
        }
      })
      if(!response) return res.status(500).json({
        ok: false,
        msg: 'Internal server error' //TODO: IDIOMA
      })
      return res.status(200).json({
        ok: true,
        msg: systemMessages.userMsg.userVerifiedSuccess, 
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: 'Internal server error'
      })
      
    }
  },
  processLogin: async(req,res)=>{
    try {
      
      let {email, password} = req.body;

      let userToLog = await db.User.findOne({
        where: { email },
      });
      // Si hay usuario
      if (userToLog) {
        // Comparo contrasenas
        if (bcrypt.compareSync(password, userToLog.password)) {
          let cookieTime = 1000 * 60 * 60 * 24 * 7; //7 Dias
          // Generar el token de autenticación
          req.session.userLoggedId = userToLog.id;
          const token = jwt.sign({ id: userToLog.id }, webTokenSecret, {
            expiresIn: "7d",
          }); // genera el token
          res.cookie("userAccessToken", token, {
            maxAge: cookieTime,
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
            sameSite: "strict",
          });
          // Si es admin armo una cookie con el token de admin
          if (
            userToLog.user_role_id == 1 
          ) {
            const adminToken = jwt.sign({ id: userToLog.id }, webTokenSecret, {
              expiresIn: "4h",
            });
            cookieTime = 1000 * 60 * 60 * 4; //4 horas
            res.cookie("adminAuth", adminToken, {
              maxAge: cookieTime,
              httpOnly: true,
              secure: process.env.NODE_ENV == "production",
              sameSite: "strict",
            });
          }
          return res.status(200).json({
            meta:{
              status: 200, 
              method: "POST", 
              url: 'api/user/login'
            },
            ok: true,
            msg: {
              en: "Succesfully logged in",
              es: "Inicio de sesion correcto"
            },
            redirect: '/'
          });
        }
        // Si llego aca es porque esta mal la contrasena
        
      }
      // Si llego aca es porque esta mal el email o password
      return res.status(200).json({
        meta:{
          status: 200, 
          method: "POST", 
          url: 'api/user/login'
        },
        ok: false,
        msg: {
          en: "Wrong credentials",
          es: "Credenciales incorrectas"
        }
      });
    } catch (error) {
      console.log(`Error in processLogin`);
      return res.status(500).json({
        ok: false,
        msg: 'Internal server error'
      })
    }
  },
};

export default controller;

async function updateUserLanguageInDb(paymentID, userId){
  try {
    const rowsAffected = await db.User.update({payment_type_id: paymentID}, {
      where: { id: userId }
    })
    return rowsAffected > 0;
  } catch (error) {
    console.log(`Error updating user in db: ${error}`);
    console.log(error);
    return false;
  }
}

export async function generateAndInstertEmailCode(user) {
  try {
    // Genero el codigo de verificacion
  const { verificationCode, expirationTime } =
  generateRandomCodeWithExpiration();
  let emailHasBeenSent = await sendVerificationCodeMail(verificationCode, user.email);
  if(!emailHasBeenSent)return false;
  let objectToDB = {
    verification_code: verificationCode,
    expiration_time: expirationTime,
  };
  //Lo cambio en db
  await db.User.update(objectToDB,{
    where: {
      id: user.id
    }
  });
  return true;
  } catch (error) {
    console.log(`Falle en generateAndInstertEmailCode`);
    console.log(error);
    return false;
  }
}

let userIncludeArray = ['tempCartItems','orders',"phones","addresses"];
export async function getUsersFromDB(id) {
  try {
    let usersToReturn, userToReturn
    // Condición si id es un string
    if (typeof id === "string") {
      userToReturn = await db.User.findByPk(id,{
        include: userIncludeArray
      });
      if(!userToReturn)return null
      userToReturn = userToReturn && getDeepCopy(userToReturn);
      setUserKeysToReturn(userToReturn);
      return userToReturn;
    }

    // Condición si id es un array
    if (Array.isArray(id)) {
      usersToReturn = await db.User.findAll({
        where: {
          id: id, // id es un array, se hace un WHERE id IN (id)
        },
        include: userIncludeArray
      });
      if(!usersToReturn || !usersToReturn.length)return null
      usersToReturn = getDeepCopy(usersToReturn);
      usersToReturn.forEach(user => setUserKeysToReturn(user));
      return usersToReturn;
    }
    // Condición si id es undefined
    if (id === undefined) {
      usersToReturn = await db.User.findAll({
        include: userIncludeArray
      });
      if(!usersToReturn || !usersToReturn.length)return null
      usersToReturn = getDeepCopy(usersToReturn);
      return usersToReturn;
    }
  } catch (error) {
    console.log(`Falle en getUsers`);
    return console.log(error);
  }
}

export function deleteSensitiveUserData(user){
  delete user.password;
  delete user.password_token;
  delete user.verification_code;
  delete user.expiration_time;
}

export async function updateUserFromDB(obj,id) {
  try {
    if(!obj || !id)return undefined

    //Lo updateo en db
    await db.User.update(obj,{
      where: {
        id
      }
    });
    return true
  } catch (error) {
    console.log(`Falle en updateUserFromDB`);
    console.log(error);
    return undefined
  }
}

export async function insertUserToDB(obj) {
  try {
    if(!obj)return undefined
    //Lo inserto en db
    let createdUser = await db.User.create(obj);
    return createdUser
  } catch (error) {
    console.log(`Falle en insertUserToDB`);
    console.log(error);
    return undefined
  }
}

function setUserKeysToReturn(user){
  user.phones?.forEach(phone => {
    phone.country = countries.find(country=>country.id == phone.country_id)
  });
}