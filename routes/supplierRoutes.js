import express from 'express';
import { createSupplier, getAllSuppliers, getSupplierById } from '../controllers/supplierController.js';

const router = express.Router();

router.route("/supplier/create").post(createSupplier);

router.route("/supplier/all").get(getAllSuppliers);

router.route("/supplier/single/:id").get(getSupplierById);

export default router;