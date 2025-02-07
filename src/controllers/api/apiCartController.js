import db from "../../database/models/index.js";
import {
  populateSize,
  populateTaco,
} from "../../utils/helpers/populateStaticDb.js";
import { findProductsInDb } from "./apiProductController.js";
import { findVariationsById } from "../api/apiVariationsController.js";
import { v4 as UUIDV4 } from "uuid";
import { Op } from "sequelize";
import getDeepCopy from "../../utils/helpers/getDeepCopy.js";
const { TempCartItem } = db;

const controller = {
  handleGetCartItems: async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({
          ok: false,
          msg: "No user id was provided",
          data: null,
        });
      }
      const tempCartItems = await findTempCartItemsByUserId(userId);
      if (!tempCartItems) {
        return res.status(500).json({
          ok: false,
          msg: "Internal server error",
          data: null,
        });
      }
      tempCartItems.forEach((tempItem) => {
        const { size_id, taco_id } = tempItem;
        tempItem.size = populateSize(size_id);
        tempItem.taco = populateTaco(taco_id);
      });
      return res.status(200).json({
        ok: true,
        msg: "Successfully fetched cart",
        data: tempCartItems,
      });
    } catch (error) {
      console.log(`Error obtaining cart: ${error}`);
      return res.status(500).json({
        ok: false,
        msg: "Internal server error",
        data: null,
      });
    }
  },
  handleCreateCartItem: async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return res.status(400).json({
          ok: false,
          msg: "No user id was provided",
          data: null,
        });
      }
      const { body } = req;
      const { productId, variation_id } = body;

      const [productExists, product] = await findProductsInDb(productId);
      if (!productExists || !product) {
        console.log("failed to fetched product");
        return res.status(500).json({
          ok: false,
          msg: "Internal server error",
          data: null,
        });
      }

      const variationExists = await findVariationsById(variation_id);
      if (!variationExists) {
        console.log("variation not found");
        return res.status(500).json({
          ok: false,
          msg: "Internal server error",
          data: null,
        });
      }
      const isCartItemCreated = await createCartItemInDb(body, userId);
      if (!isCartItemCreated) {
        console.log("failing creating item");
        return res.status(500).json({
          ok: false,
          msg: "Internal server error",
          data: null,
        });
      }
      return res.status(200).json({
        ok: true,
        msg: "Succesfully added item to cart",
      });
    } catch (error) {
      console.log(`error creating cart item: ${error}`);
      return res.status(500).json({
        ok: false,
        msg: "Internal server error",
        data: null,
      });
    }
  },
  handleDeleteCartItem: async (req, res) => {
    try {
      const cartItemId = req.params.cartItemId;
      if (!cartItemId) {
        return res.status(500).json({
          msg: "Internal server error",
          ok: false,
        });
      }
      const isDeleted = await deleteCartItemInDb(cartItemId);
      if (!isDeleted) {
        return res.status(500).json({
          msg: "Internal server error",
          ok: false,
        });
      }
      return res.status(200).json({
        msg: "Succesfully deleted item",
        ok: true,
      });
    } catch (error) {
      console.log(`Error deleting cart item`);
      console.log(error);

      return res.status(500).json({
        msg: "Internal server error",
        ok: false,
      });
    }
  },
  handleUpdateUserCart: async (req, res) => {
    try {
      let { tempCartItems } = req.body;
      const userId = req.params.userId;
      let cartItemsFromDB = getDeepCopy(
        await db.TempCartItem.findAll({
          where: {
            user_id: userId,
          },
        })
      );
      tempCartItems = tempCartItems.map((item) => {
        const cartItemFromDB = cartItemsFromDB.find(
          (dbItem) => dbItem.variation_id == item.id
        );
        return {
          id: cartItemFromDB.id,
          variation_id: cartItemFromDB.variation_id,
          user_id: userId,
          quantity: item.quantity,
        };
      });
      // Obtener los IDs de los productos enviados en el body
      const sentVariationIds = tempCartItems.map((item) => item.id);
      
      // Determinar qué productos hay que eliminar (los que están en la DB pero no en `tempCartItems`)
      const itemsToDelete = cartItemsFromDB
        .filter((dbItem) => !sentVariationIds.includes(dbItem.id))
        .map((dbItem) => dbItem.id);

      // Eliminar los productos que ya no están en el body
      if (itemsToDelete.length > 0) {
        await db.TempCartItem.destroy({
          where: {
            id: itemsToDelete,
          },
        });
      };
    //   console.log(tempCartItems);
      
      // Hago un bulkUpdate de las cantidades
      await db.TempCartItem.bulkCreate(tempCartItems, {
        updateOnDuplicate: ["quantity"],
      });
      return res.status(200).json({
        ok: true,
        updatedCardItems: tempCartItems,
      });
    } catch (error) {
      console.log(`Error updating cart`);
      console.log(error);
      return res.status(500).json({
        msg: "Internal server error",
        ok: false,
      });
    }
  },
};

export default controller;

async function findTempCartItemsByUserId(userId) {
  try {
    const tempCartItems = await TempCartItem.findAll({
      where: {
        user_id: userId,
      },
      include: ["product", "user"],
    });
    if (!tempCartItems) return [];
    return tempCartItems;
  } catch (error) {
    console.log(`Error finding cart in db: ${error}`);
    return [];
  }
}

async function createCartItemInDb(payload, userId) {
  try {
    const { variation_id, quantity } = payload;
    const objectToCreate = {
      id: UUIDV4(),
      variation_id,
      user_id: userId,
      quantity,
      created_at: new Date(),
    };
    await TempCartItem.create(objectToCreate);
    return true;
  } catch (error) {
    console.log(`Error creating cart item: ${error}`);
    return false;
  }
}

async function deleteCartItemInDb(cartItemId) {
  try {
    const itemsDeleted = await TempCartItem.destroy({
      where: {
        id: cartItemId,
      },
    });
    return itemsDeleted > 0;
  } catch (error) {
    console.log(`Error deleting item in db: ${error}`);
    return false;
  }
}
