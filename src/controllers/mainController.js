import db from "../database/models/index.js";
import sendOrderMails from "../utils/helpers/sendOrderMails.js";
import { categories } from "../utils/staticDB/categories.js";
import sizes from "../utils/staticDB/sizes.js";
import tacos from "../utils/staticDB/tacos.js";
import { getOneOrderFromDB, getOrdersFromDB, disableCreatedOrder } from "./api/apiOrderController.js";
import { capturePaypalPayment } from "./api/apiPaymentController.js";
import { findProductsInDb } from "./api/apiProductController.js";
import { getUsersFromDB } from "./api/apiUserController.js";

// import { NAVBAR_PAGES_LINK, SHOP_CATEGORIES_DROPDOWN, LANGUAGES } from "../utils/staticDB/constants.js"
const controller = {
  index: (req, res) => {
    return res.render("index");
  },
  cart: (req, res) => {
    return res.render("cart");
  },
  userVerification: (req, res) => {
    return res.render("userEmailVerify");
  },
  productDetail: async (req, res) => {
    try {
      let { id } = req.params;
      let productFromDB = await findProductsInDb(id, null, true);
      // return res.send(productFromDB);
      return res.render("productDetail", { tacos, sizes, productFromDB });
    } catch (error) {
      console.log("FALLE EN mainController.productDetail");
      return res.send(error);
    }
  },
  productList: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const categoryExists = categories.find(
        (cat) => cat.id === Number(categoryId)
      );
      if (!categoryExists) return res.redirect("/");
      return res.render("productList", { categoryId });
    } catch (error) {
      console.log(
        `error in main controller product list: ${error}, redirecting...`
      );
      return res.redirect("/");
    }
  },
  userProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      const userExists = getUsersFromDB(userId);
      if (!userExists) {
        console.log(`user with id :${userId} was not found, redirecting...`);
        return res.redirect("/");
      }
      return res.render("userProfile");
    } catch (error) {
      console.log(`Error in user profile: ${error}, redirecting...`);
      return res.redirect("/");
    }
  },
  aboutUs: async (req, res) => {
    try {
      return res.render("aboutUs");
    } catch (error) {
      console.log(`Error in about us: ${error}, redirecting...`);
      return res.redirect("/");
    }
  },
  faq: async (req, res) => {
    try {
      return res.render("faq");
    } catch (error) {
      console.log(`Error in faq: ${error}, redirecting...`);
      return res.redirect("/");
    }
  },
  contact: async (req, res) => {
    try {
      return res.render("contact");
    } catch (error) {
      console.log(`Error in contact: redirecting...`);
      console.log(error);
      return res.redirect("/");
    }
  },
  postOrder: (req,res) =>{
    return res.render('postOrder')
  },
  completePayment: async (req, res) => {
    const { token } = req.query; // ORDER_ID que devuelve PayPal
    if (!token) {
      return res.redirect("/cart");
    }

    try {
      let orderFromDB = await getOneOrderFromDB({ paypal_order_id: token});
      if (!orderFromDB) {
        console.error("Orden no encontrada en la base de datos");
        return res.redirect("/cart");
      }

      const captureResponse = await capturePaypalPayment(token);
      if (!captureResponse || !captureResponse.status) {
        console.error(
          "Error inesperado en la captura de pago de PayPal",
          captureResponse
        );
        
        return res.redirect(`/cancelar-orden/${orderFromDB.id}`);
      }

      if (captureResponse.status === "COMPLETED") {
        let updatedStatus = orderFromDB.shipping_type_id == 1 ? 2 : 3
        // ✅ Marcar la orden como pagada en tu base de datos
        await db.Order.update(
          {
            order_status_id: updatedStatus, //2 es pendiente de envio, 3 de recoleccion
          },
          {
            where: {
              id: orderFromDB.id,
            },
          }
        );
        orderFromDB.order_status_id = updatedStatus;
        // Envio el mail para el usuario y a nosotros
        await sendOrderMails(orderFromDB);
        return res.redirect(`/post-compra?orderId=${orderFromDB.tra_id}&shippingTypeId=${orderFromDB.shipping_type_id}`);
      } else {
        // ❌ Manejar error de pago
        res.redirect(`/cancelar-orden?token=${token}`); //Redirijo para cancelar la orden
      }
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      console.error(error);
      res.redirect(`/cancelar-orden?token=${token}`); //Redirijo para cancelar la orden
    }
  },
  cancelOrder: async (req, res) => {
    try {
      let { token } = req.query;
      const orderCreatedToDisable = await getOneOrderFromDB({ paypal_order_id: token });
      if (orderCreatedToDisable) {
        await disableCreatedOrder(orderCreatedToDisable.id);
      };
      return res.redirect("/");
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      console.error(error);
      return res.redirect("/");
    }
  },
  logout: (req, res) => {
    let pathToReturn = req.session.returnTo;
    res.clearCookie("userAccessToken");
    res.clearCookie("adminToken");
    req.session.destroy();
    return res.redirect(`${pathToReturn}`);
  },
};

export default controller;
