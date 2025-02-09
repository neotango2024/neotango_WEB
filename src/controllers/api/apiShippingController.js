import zones from "../../utils/staticDB/zones.js";
import db from "../../database/models/index.js";
import minDecimalPlaces from "../../utils/helpers/minDecimalPlaces.js";
import { HTTP_STATUS } from "../../utils/staticDB/httpStatusCodes.js";
const { ShippingZonePrice } = db;

const controller = {
    getShippingZonesWithPrices: async (req, res) => {
        try {
            const shippingZonesPrices = await ShippingZonePrice.findAll();
            (zones||[]).forEach(zone => {
                const zonePrice = shippingZonesPrices.find(zonePrice => zonePrice.zone_id === zone.id);
                if(!zonePrice)return
                zone.price = {
                    usd_price: minDecimalPlaces(zonePrice.usd_price),
                    ars_price: minDecimalPlaces(zonePrice.ars_price)
                }
            })
            return res.status(HTTP_STATUS.OK.code).json({
                ok: true,
                data: zones
            })
        } catch (error) {
            console.log(`error in getShippingZonesWithPrices: ${error}`);
            console.log(error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
                ok: false,
                msg: 'Internal server error'
            })
        }
    },
    updateZone: async (req, res) => {
        try {
        const {zoneId} = req.params;
        if(!zoneId){
            return res.status(HTTP_STATUS.BAD_REQUEST.code).json({
                ok: false,
                msg: 'No zone id provided'
            })
        }
        const {usd_price, ars_price} = req.body;
        if (usd_price == null || ars_price == null) {
            return res.status(HTTP_STATUS.BAD_REQUEST.code).json({ 
                    ok: false,
                    msg: 'Null prices' 
                });
          }
          const affectedRows = await ShippingZonePrice.update(
            { usd_price, ars_price },
            { where: { zone_id: zoneId } }
          );
          if (affectedRows === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND.code).json({ 
                message: 'Failed to update',
                ok: false
             });
          }
          return res.status(HTTP_STATUS.OK.code).json({
            ok: true,
            msg: 'Succesfully updated'
          })
        } catch (error) {
            console.log(`Failed to update zone: ${error}`)
            return res.status(HTTP_STATUS.OK.code).json({
                ok: false,
                msg: 'Internal server error'
              })
        }
        
    }
}

export default controller;