
import dateFormater from "./dateFormater.js";
import { Resend } from "resend";

//resend config
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOrderMails(order) {
  const orderIsInSpanish = order.payment_type_id == 1;


  // Contenido del correo
  let userMailContentDeliveryMethod = ``;
  let operatorMailContentDeliveryMethod = ``;
  if (order.shipping_type_id == 1) {
    //Domicilio
    let addressTitleRow = `<p style="font-weight:600;">${
      orderIsInSpanish ? "Envío a domicilio" : "Shipping to"
    }</p>`;
    userMailContentDeliveryMethod += addressTitleRow;
    operatorMailContentDeliveryMethod += addressTitleRow;
    let addressRow = `
                <p style="color: #666;">${order.shipping_address_street}${
      order.shipping_address_detail ? ` (${order.shipping_address_detail})` : ""
    } - C.P. ${order.shipping_address_zip_code} - ${
      order.shipping_address_city
    }, ${order.shipping_address_province}</p>
                `;
    userMailContentDeliveryMethod += addressRow;
    operatorMailContentDeliveryMethod += addressRow;
  } else if (order.shipping_type_id == 2) {
    //Retiro por local
    let pickupTitle = `<p style="font-weight:600;">${
      orderIsInSpanish ? "Tipo de envio:" : "Delivery method:"
    }</p>`;
    let pickUpRow = `<p>${
      orderIsInSpanish ? "Retiro por el local" : "Pickup"
    }</p>`;
    userMailContentDeliveryMethod = `
        ${pickUpRow}
        <p style="color: #666;">Sarmiento 1938 , ${
          orderIsInSpanish ? "C.P" : "ZIP"
        }. 1044, CABA</p>
        <p style="color: #666;">${
          orderIsInSpanish ? "Lunes a viernes" : "Monday to Friday"
        } / 9hs - 18hs</p>
        `;
    operatorMailContentDeliveryMethod = `<p style="font-weight:600;">${
      orderIsInSpanish ? "Retiro por el local" : "Pickup"
    }</p>`;
  }

  //   Tabla con items
  let tableContent = ``;
  let orderItemsPrice = 0;
  order.orderItems.forEach((item) => {
    // const itemPrice = item.price * ( 1 - (item.discount||0)/100);
    tableContent += `
        <tr>
            <td style="width:25%;text-align:center;">${
              orderIsInSpanish ? item.es_name : item.eng_name
            } (${item.taco} - ${item.size})</td>
            <td style="width:25%;text-align:center;">$${item.price}</td>
            <td style="width:25%;text-align:center;">${item.quantity}</td>
            <td style="width:25%;text-align:center;">$${
              parseInt(item.quantity) * parseFloat(item.price)
            }</td>
        </tr>
        `;
    orderItemsPrice += parseInt(item.quantity) * parseFloat(item.price);
  });
  const shippingPrice = order.total - orderItemsPrice;
  const userMailContent = `
    <main style="width:60%;margin: 0 auto;">
    <h2 style="font-weight:600;">${
      orderIsInSpanish ? "Resumen de tu compra" : "Order summary"
    }</h2>
      <p style="font-weight:600;">${
        orderIsInSpanish ? "Id de venta" : "Order Id"
      }</p>
    <p style="color: #666;">${order.tra_id}</p>
    <p style="font-weight:600;">${orderIsInSpanish ? "Fecha" : "Date"}</p>
    <p style="color: #666;">${dateFormater(order.createdAt, false)} (dd/mm/${
    orderIsInSpanish ? "aaaa" : "yyyy"
  })</p>
    <p style="font-weight:600;">${
      orderIsInSpanish ? "Datos de facturación" : "Billing Information"
    }</p>
    <p style="color: #666;">${order.first_name} ${order.last_name} - Tel: +${
    order.phone_code
  } ${order.phone_number} - ${orderIsInSpanish ? "DNI" : "ID"}: ${order.dni}</p>
    ${userMailContentDeliveryMethod}
    
    <table style="width:100%">
      <tr>
        <th style="width:25%;text-align:center;">Item</th>
        <th style="width:25%;text-align:center;">${
          orderIsInSpanish ? "Precio unitario" : "Unit price"
        }</th>
        <th style="width:25%;text-align:center;">${
          orderIsInSpanish ? "Cantidad" : "Quantity"
        }</th>
        <th style="width:25%;text-align:center;">Subtotal</th>
      </tr>
      ${tableContent}
    </table>
    ${
      order.shipping_type_id == 1
        ? `<p style="font-size:18px;margin-top:30px;color:#222;">${
            orderIsInSpanish ? "Envio" : "Shipping"
          }: $${shippingPrice}</p>`
        : ""
    }
    <p style="font-size:18px;margin-top:30px;color:#222;">Total: $${
      order.total
    }</p>
    </main>
  `;

  const operatorMailContent = `
    <main style="width:60%;margin: 0 auto;">
    <h2 style="font-weight:600;">Se ha registrado una venta</h2>
    <p style="font-weight:600;">Id de venta</p>
    <p style="color: #666;">${order.tra_id}</p>
    <p style="font-weight:600;">Fecha</p>
    <p style="color: #666;">${dateFormater(order.createdAt, false)}</p>
    <p style="font-weight:600;">Datos de facturación</p>
    <p style="color: #666;">Nombre:${order.first_name} ${order.last_name}<br>Tel: +${
    order.phone_code
  } ${order.phone_number}<br>DNI: ${order.dni}<br></p>
    ${operatorMailContentDeliveryMethod}
    
    <table style="width:100%">
      <tr>
        <th style="width:25%;text-align:center;">Item</th>
        <th style="width:25%;text-align:center;">Precio unitario</th>
        <th style="width:25%;text-align:center;">Cantidad</th>
        <th style="width:25%;text-align:center;">Subtotal</th>
      </tr>
      ${tableContent}
    </table>
    ${
      order.shipping_type_id == 1
        ? `<p style="font-size:18px;margin-top:30px;color:#222;">Envio: $${shippingPrice}</p>`
        : ""
    }
    <p style="font-size:22px;margin-top:30px;color:#222;">Total: $${
      order.total
    }</p>
    </main>
  `;
  // Opciones del correo
  const userMailOptions = {
    from: "NeoTango Shoes <contacto@neotangoshoes.com>",
    to: order.email,
    subject: orderIsInSpanish
      ? "¡Gracias por tu compra!"
      : "Thanks for your purchase!",
    html: userMailContent,
  };
  const operatorMailOptions = {
    from: "NeoTango Shoes <contacto@neotangoshoes.com>",
    to: "contacto@neotangoshoes.com",
    subject: `Venta online - ${order.tra_id}`,
    html: operatorMailContent,
  };
  try {
    // Envío de los correos
    await resend.emails.send({
      from: userMailOptions.from,
      to: userMailOptions.to,
      subject: userMailOptions.subject,
      html: userMailOptions.html,
    });

    await resend.emails.send({
      from: operatorMailOptions.from,
      to: operatorMailOptions.to,
      subject: operatorMailOptions.subject,
      html: operatorMailOptions.html,
    });
    console.log("Correos enviados");
    return;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}

export default sendOrderMails;
