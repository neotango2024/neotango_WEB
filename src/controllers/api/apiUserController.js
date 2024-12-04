import db from "../../database/models/index.js";
// Librerias
import Sequelize from "sequelize";
import { Op } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from"bcryptjs";

// UTILS
import systemMessages from "../../utils/staticDB/systemMessages.js";
import generateRandomCodeWithExpiration from "../../utils/generateRandomCodeWithExpiration.js";
import capitalizeFirstLetterOfEachWord from "../../utils/capitalizeFirstLetterOfString.js";
// ENV

const controller = {
  createUser: async (req, res) => {
    try {      
      let countries = await db.Country.findAll();
      return res.status(200).json({countries})
      // Traigo errores
      let errors = validationResult(req);
      // return res.send(errors);
      if (!errors.isEmpty()) {
        //Si hay errores en el back...
        errors = errors.mapped();

        // Ver como definir los errors
        // return res.send(errors)
        return res.status(422).json({
            meta: {
                status: 422,
                url: '/api/user',
                method: "POST"
            },
            ok: false,
            errors,
            msg: systemMessages.formMsg.validationError.es
        });
      }

      // Datos del body
      let { first_name, last_name, email, password, rePassword } = req.body;
      // Genero el codigo de verificacion
      const { verificationCode, expirationTime } =
        generateRandomCodeWithExpiration();
      //Nombres y apellidos van capitalziados
      first_name = capitalizeFirstLetterOfEachWord(first_name,true);
      last_name = capitalizeFirstLetterOfEachWord(last_name,true);

      let userData = {
        id: uuidv4(),
        first_name,
        last_name,
        email,
        password: bcrypt.hashSync(password, 10), //encripta la password ingresada ,
        user_categories_id: 3, //Cliente
        verified_email: false,
        verified_essential_data: false,
        verification_code: verificationCode,
        expiration_time: expirationTime,
      };

      const userCreated = await db.User.create(userData); //Creo el usuario
      sendVerificationCodeMail(verificationCode, userData.email);
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

      // Lo redirijo al prefil para completar la info
      return res.status(201).json({
        meta: {
            status: 201
        },
        ok: true,
        msg: systemMessages.userMsg.createSuccesfull.es //TODO: ver tema idioma
      })
       
    } catch (error) {
      console.log(`Falle`);
      console.log(error);
      return res.status(500).json({ error });
    }
  },
};

export default controller;
