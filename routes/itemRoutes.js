import express from 'express';
import { createInventoryInward, createInventoryOutward, createItem, getAllInventoryInward, getAllInventoryOutward, getAllItems, getItemById } from '../controllers/itemController.js';

const router = express.Router();

router.route("/item/create").post(createItem);

router.route("/item/createinward").post(createInventoryInward);

router.route("/item/createoutward").post(createInventoryOutward);

router.route("/item/items").get(getAllItems);

router.route("/item/single/:id").get(getItemById); // Assuming you want to get a single item by ID, you can implement the controller function accordingly

router.route("/item/inwards").get(getAllInventoryInward);

router.route("/item/outwards").get(getAllInventoryOutward);

export default router;
