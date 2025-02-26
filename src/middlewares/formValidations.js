import { body } from "express-validator";
import validatePasswordString from "../utils/helpers/validatePasswordString.js";
import isJson from "../utils/helpers/isJson.js";
import db from "../database/models/index.js";
import countries from "../utils/staticDB/countries.js";
import { getVariationsFromDB } from "../controllers/api/apiProductController.js";
import getOnlyNumbers from "../utils/helpers/getOnlyNumbers.js";
export default {
  productFields: [
    body([
      "es_name",
      "eng_name",
      "ars_price",
      "usd_price",
      "english_description",
      "spanish_description",
      "sku",
    ])
      .notEmpty()
      .withMessage("Complete todos los campos necesarios")
      .bail(),
    body(["variations"])
      .isArray()
      .bail()
      .custom((variationsArray) => {
        const allValid = variationsArray.every((variation) => {
    
          const allNecesaryFields =
            typeof variation.size_id === "number" &&
            typeof variation.taco_id === "number" &&
            // typeof variation.color_id === "number" &&
            typeof variation.quantity === "number";
    
          return allNecesaryFields;
        });
    
        if (!allValid) {
          throw new Error("Faltan propiedades necesarias en las variaciones");
        }
    
        return true; 
      }),
    // body(["images"])
    //   .notEmpty()
    //   .withMessage("Adjunte al menos una imagen")
    //   .bail()
    //   .isArray()
    //   .withMessage("Formato incorrecto de imagenes")
    //   .bail(),
  ],
  userCreateFields: [
    body(["first_name", "last_name", "email", "password", "rePassword"])
      .notEmpty()
      .withMessage("Complete todos los campos necesarios")
      .bail()
      .custom((value, { req }) => {
        // que sea de tipo string
        // Si viene formato json entonces lo parseo, sino me fijo directamente
        if (isJson(value)) value = JSON.parse(value);
        if (typeof value !== "string") {
          throw new Error();
        }
        return true;
      }),
    body(["email"])
      .isEmail()
      .withMessage("Tipo de email invalido")
      .bail()
      .custom(async (value, { req }) => { //TODO:
        //No puede ingresar un email que ya esta
        let userEmail = value?.toLowerCase();
        let emailInDataBase = await db.User.findOne({
          where: { 
            email: userEmail?.trim(),
            verified_email: 1
          },
        });
        if (emailInDataBase) {
          throw new Error("Email ya registrado, ingrese otro");
        }
        return true;
      }),
    body(["password"]).custom((value, { req }) => {
      // que sea de tipo string
      // Si viene formato json entonces lo parseo, sino me fijo directamente
      if (isJson(value)) value = JSON.parse(value);
      if (typeof value !== "string") {
        throw new Error();
      }
      //Me fijo que cumpla
      if (!validatePasswordString(value))
        throw new Error("La contraseña debe cumplir con los criterios pedidos");
      //Aca me fijo que coincida con la re-password
      if (value?.trim() !== req.body.rePassword?.trim())
        throw new Error("Las contraseñas deben coincidir");
      return true;
    }),
  ],
  userUpdateFields: [
    body(["first_name", "last_name"])
      .notEmpty()
      .withMessage("Complete todos los campos necesarios")
      .bail()
      .custom((value, { req }) => {
        // que sea de tipo string
        // Si viene formato json entonces lo parseo, sino me fijo directamente
        if (isJson(value)) value = JSON.parse(value);
        if (typeof value !== "string") {
          throw new Error();
        }
        return true;
      }),
  ],
  userPasswordUpdateFields: [
    body(["password", "rePassword"])
      .notEmpty()
      .withMessage("Complete todos los campos necesarios")
      .bail()
      .custom((value, { req }) => {
        // que sea de tipo string
        // Si viene formato json entonces lo parseo, sino me fijo directamente
        if (isJson(value)) value = JSON.parse(value);
        if (typeof value !== "string") {
          throw new Error();
        }
        return true;
      }),
    body(["password"]).custom((value, { req }) => {
      // que sea de tipo string
      // Si viene formato json entonces lo parseo, sino me fijo directamente
      if (isJson(value)) value = JSON.parse(value);
      if (typeof value !== "string") {
        throw new Error();
      }
      //Me fijo que cumpla
      if (!validatePasswordString(value))
        throw new Error("La contraseña debe cumplir con los criterios pedidos");
      //Aca me fijo que coincida con la re-password
      if (value?.trim() !== req.body.rePassword?.trim())
        throw new Error("Las contraseñas deben coincidir");
      return true;
    }),
  ],
  addressFields: [
    body(["street", "label", "detail", "zip_code", "city", "province", "country_id"])
    .custom((value, { req }) => {
      // que sea de tipo string
      // Si viene formato json entonces lo parseo, sino me fijo directamente
      if (isJson(value)) value = JSON.parse(value);
      if (typeof value !== "string") {
        throw new Error();
      }
      return true;
    }),
    body(["street", "label", "zip_code", "city", "province", "country_id"])
      .notEmpty()
      .withMessage("Complete todos los campos necesarios")
      .bail(),
    body(["country_id"]) //Me fijo que el pais este
      .custom((value, { req }) => {
        //No puede ingresar un email que ya esta
        let countrieFromDB = countries.find(count=>count.id == value);
        if (!countrieFromDB) {
          throw new Error("Pais no encontrado, intente nuevamente");
        }
        return true;
      }),
  ],
  orderFields: [
    body(["first_name", "last_name", "email", "dni", "payment_type_id", "shipping_type_id"])
    .notEmpty()
    .withMessage("Complete todos los campos necesarios")
    .bail(),
    body(["variations", "phoneObj", "billingAddress"])
      .notEmpty()
      .withMessage("Complete todos los campos necesarios")
      .bail(),
    body(["variations"]) //Me fijo que los productos esten en stock
      .custom(async (value, { req }) => {
        let variationIdsToGet = value.map(variation=>variation.id); //Array de ids
        let variationsFromDB = await getVariationsFromDB(variationIdsToGet);//Obtengo de db las variaciones
        value.forEach((variation) => {
          // Agarro el producto de DB
          let variationFromDBIndex = variationsFromDB.findIndex(variationFromDB=> variationFromDB.id == variation.id);
          if(variationFromDBIndex < 0){
            //Si no viene no sigo (al pedo)
            throw new Error("Variacion no encontrada");
          }; 
          let variationFromDB = variationsFromDB[variationFromDBIndex];
          let { quantityRequested } = variation; //Tengo que chequear con esa variacion
          quantityRequested = parseInt(quantityRequested); //Lo parseo
          if(quantityRequested > variationFromDB.quantity) {
            throw new Error("Hay items con stock insuficiente");
          }; 
        });
        req.body.variationsFromDB = variationsFromDB; //Ya que busque a db le paso para no hacer 2 consultas
        return true;
        }),
    body(["phoneObj","billingAddress","shippingAddress"]) //Me fijo que los paises esten en db
    .custom(async (value, { req }) => {
          let countryFromDB = countries.find(country=>country.id == value?.country_id);
          if(value && !countryFromDB) throw new Error("Pais no encontrado");
          return true;
    }),
    body(["phoneObj"]) //Saco los nros con el regex
    .custom(async (value, { req }) => { //Le saco cualquier cosa que no sea un numero al phone number
          value.phone_number = getOnlyNumbers(value.phone_number);
          return true;
    }),
  ],
};
