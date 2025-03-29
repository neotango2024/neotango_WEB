import db from "../database/models/index.js";
import sendOrderMails from "../utils/helpers/sendOrderMails.js";
import { categories } from "../utils/staticDB/categories.js";
import sizes from "../utils/staticDB/sizes.js";
import tacos from "../utils/staticDB/tacos.js";
import {
  getOneOrderFromDB,
  getOrdersFromDB,
  disableCreatedOrder,
} from "./api/apiOrderController.js";
import {
  captureMercadoPagoPayment,
  capturePaypalPayment,
} from "./api/apiPaymentController.js";
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
  postOrder: (req, res) => {
    return res.render("postOrder");
  },
  completePayment: async (req, res) => {
    const { token, payment_id, preference_id } = req.query;
  
    // ⚠️ token es para PayPal, payment_id para MercadoPago
    // preference_id se guarda para buscar la orden local en MP
    const checkedPaymentId = token ?? payment_id;
  
    // Si no hay token ni payment_id, redirigimos al carrito
    if (!token && !payment_id) {
      console.log("Either the token or the payment id were not provided");
      return res.redirect("/cart");
    }
  
    let orderFromDb;
    let paymentResponse;
    let updatedStatus;
  
    try {
      // ========================================
      // ✅ FLUJO PAYPAL
      // ========================================
      if (token) {
        // Buscamos la orden en nuestra base de datos
        orderFromDb = await getOneOrderFromDB({ entity_payment_id: token });
  
        if (!orderFromDb) {
          console.error("Orden no encontrada en la base de datos");
          return res.redirect("/cart");
        }
  
        // Capturamos el pago con PayPal
        paymentResponse = await capturePaypalPayment(token);
  
        // Si falla la captura o el estado no es COMPLETED, redirigimos al flujo de cancelación
        if (!paymentResponse || paymentResponse.status !== "COMPLETED") {
          console.error("Error al capturar el pago con PayPal:", paymentResponse);
          return res.redirect(`/cancelar-orden?token=${checkedPaymentId}`);
        }
  
        // ✅ Determinamos el nuevo estado de la orden:
        // 2 = Pendiente de envío (envío a domicilio), 3 = Pendiente de retiro (retira el cliente)
        updatedStatus = orderFromDb.shipping_type_id == 1 ? 2 : 3;
  
        // Actualizamos la orden en la base de datos
        await db.Order.update(
          { order_status_id: updatedStatus },
          { where: { id: orderFromDb.id } }
        );
        orderFromDb.order_status_id = updatedStatus;
      }
  
      // ========================================
      // ✅ FLUJO MERCADO PAGO
      // ========================================
      if (payment_id) {
        // Buscamos la orden con el preference_id original
        orderFromDb = await getOneOrderFromDB({ entity_payment_id: preference_id });
  
        if (!orderFromDb) {
          return res.redirect(`/cancelar-orden?token=${checkedPaymentId}`);
        }
  
        // Capturamos el pago en MP
        paymentResponse = await captureMercadoPagoPayment(payment_id);
  
        if (!paymentResponse) {
          return res.redirect(`/cancelar-orden/${orderFromDb.id}`);
        }
  
        // Determinamos nuevo estado de orden (igual que PayPal)
        updatedStatus = orderFromDb.shipping_type_id == 1 ? 2 : 3;
  
        // Actualizamos la orden con el nuevo estado y guardamos el ID de pago definitivo
        await db.Order.update(
          {
            order_status_id: updatedStatus,
            entity_payment_id: payment_id,
          },
          { where: { id: orderFromDb.id } }
        );
        orderFromDb.order_status_id = updatedStatus;
      }
  
      // ========================================
      // 📧 ENVÍO DE MAILS (protegido con try para no romper flujo)
      // ========================================
      try {
        await sendOrderMails(orderFromDb);
      } catch (mailErr) {
        console.error("Error al enviar los correos:", mailErr);
        // 💡 Podrías guardar este error en una tabla tipo `FailedEmails` si querés monitorear
      }
  
      // ========================================
      // 🧹 BORRADO DEL CARRITO TEMPORAL (si hay user_id asociado)
      // ========================================
      if (orderFromDb.user_id) {
        await db.TempCartItem.destroy({
          where: { user_id: orderFromDb.user_id },
        });
      }
  
      // ========================================
      // 🚀 REDIRECCIÓN FINAL A POST-COMPRA
      // ========================================
      return res.redirect(
        `/post-compra?orderId=${orderFromDb.tra_id}&shippingTypeId=${orderFromDb.shipping_type_id}`
      );
  
    } catch (error) {
      // 🚨 Cualquier error inesperado en el flujo cae acá
      console.error("Error general en completePayment:", error);
  
      // Redirigimos a cancelación por si algo crítico falló
      return res.redirect(`/cancelar-orden?token=${checkedPaymentId}`);
    }
  },  
  cancelOrder: async (req, res) => {
    try {
      let { token, preference_id } = req.query;
      if (!token && !preference_id) return res.redirect("/");
      let entityPaymentID = token || preference_id;
      //PAYPAL
      const orderCreatedToDisable = await getOneOrderFromDB({
        entity_payment_id: entityPaymentID,
      });
      if (orderCreatedToDisable) {
        await disableCreatedOrder(orderCreatedToDisable.id);
      }
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
    return res.redirect(`${pathToReturn}?logout=1`);
  },
};

export default controller;
