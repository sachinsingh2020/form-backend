import connection from "../config/database.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

export const createSupplier = catchAsyncError(async (req, res, next) => {
    const { supplier_name, contact_number, email_id, address } = req.body;

    // Validation: all fields are required
    if (!supplier_name || !contact_number || !email_id || !address) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    const query = `
        INSERT INTO suppliers (supplier_name, contact_number, email_id, address, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `;

    const values = [supplier_name, contact_number, email_id, address];

    connection.query(query, values, (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));

        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            supplier: {
                id: result.insertId,
                supplier_name,
                contact_number,
                email_id,
                address,
                created_at: new Date().toISOString(),
            },
        });
    });
});

export const getAllSuppliers = catchAsyncError(async (req, res, next) => {
    const query = "SELECT * FROM suppliers";

    connection.query(query, (err, results) => {
        if (err) return next(new ErrorHandler(err.message, 500));

        res.status(200).json({
            success: true,
            suppliers: results,
        });
    });
});

export const getSupplierById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    console.log({ id });

    if (!id) {
        return next(new ErrorHandler("Supplier ID is required", 400));
    }

    const query = "SELECT * FROM suppliers WHERE supplier_id = ?";

    connection.query(query, [id], (err, results) => {
        if (err) return next(new ErrorHandler(err.message, 500));
        if (results.length === 0) {
            return next(new ErrorHandler(`Supplier with ID ${id} not found`, 404));
        }

        res.status(200).json({
            success: true,
            supplier: results[0],
        });
    });
});
