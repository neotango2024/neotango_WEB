import { body } from "express-validator";
import validatePasswordString from "../utils/validatePasswordString.js";
import isJson from "../utils/isJson.js";
import db from "../database/models/index.js";
import countries from "../utils/staticDB/countries.js";
export default {
  productFields: [
    body([
      "name",
      "ars_price",
      "usd_price",
      "english_description",
      "spanish_description",
      "sku",
      "email",
    ])
      .notEmpty()
      .withMessage("Complete todos los campos necesarios")
      .bail(),
    body(["email"]).isEmail().withMessage("Tipo de email invalido").bail(),
    body(["variations"])
      .notEmpty()
      .withMessage("Necesita tener al menos una variación")
      .bail()
      .isArray()
      .withMessage("Formato incorrecto de variaciones")
      .bail()
      .custom((variationsArray) => {
        variationsArray.forEach((variation) => {
          const allNecesaryFields =
            typeof variation.size_id === "number" &&
            typeof variation.taco_id === "number" &&
            typeof variation.color_id === "number" &&
            typeof variation.quantity === "number";
          if (!allNecesaryFields) {
            throw new Error("Faltan propiedades necesarias en las variaciones");
          }
        });
      }),
    body(["images"])
      .notEmpty()
      .withMessage("Adjunte al menos una imagen")
      .bail()
      .isArray()
      .withMessage("Formato incorrecto de imagenes")
      .bail(),
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
      .custom(async (value, { req }) => {
        //No puede ingresar un email que ya esta
        let userEmail = value?.toLowerCase();
        let emailInDataBase = await db.User.findOne({
          where: { email: userEmail?.trim() },
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
    body(["street", "label", "detail", "zip_code", "city", "province", "country_id", "first_name", "last_name"])
    .custom((value, { req }) => {
      // que sea de tipo string
      // Si viene formato json entonces lo parseo, sino me fijo directamente
      if (isJson(value)) value = JSON.parse(value);
      if (typeof value !== "string") {
        throw new Error();
      }
      return true;
    }),
    body(["street", "label", "zip_code", "city", "province", "country_id", "first_name", "last_name"])
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
};
