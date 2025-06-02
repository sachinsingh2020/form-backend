import connection from "../config/database.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create a new item
export const createItem = catchAsyncError(async (req, res, next) => {
    const { item_name, item_description, category, unit_of_item = 0 } = req.body;

    if (!item_name || !item_description || !category) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    const query = `
    INSERT INTO items (item_name, item_description, category, unit_of_item, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
    const values = [item_name, item_description, category, unit_of_item];

    connection.query(query, values, (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));

        res.status(201).json({
            success: true,
            message: "Item created successfully",
            item: {
                id: result.insertId,
                item_name,
                item_description,
                category,
                unit_of_item,
                created_at: new Date().toISOString(),
            },
        });
    });
});

// Create inventory inward and increase item quantity
export const createInventoryInward = catchAsyncError(async (req, res, next) => {
    const {
        item_id,
        supplier_id,
        quantity_received,
        purchased_price,
        total_cost,
        date_received,
        received_by,
        remark,
    } = req.body;

    if (!item_id || !supplier_id || !quantity_received || !purchased_price || !total_cost || !date_received || !received_by) {
        return next(new ErrorHandler("All required fields must be provided", 400));
    }

    const itemQuery = "SELECT item_id FROM items WHERE item_id = ?";
    connection.query(itemQuery, [item_id], (itemErr, itemResult) => {
        if (itemErr) return next(new ErrorHandler(itemErr.message, 500));
        if (itemResult.length === 0) {
            return next(new ErrorHandler(`Item with ID ${item_id} does not exist`, 404));
        }

        const supplierQuery = "SELECT supplier_id FROM suppliers WHERE supplier_id = ?";
        connection.query(supplierQuery, [supplier_id], (suppErr, suppResult) => {
            if (suppErr) return next(new ErrorHandler(suppErr.message, 500));
            if (suppResult.length === 0) {
                return next(new ErrorHandler(`Supplier with ID ${supplier_id} does not exist`, 404));
            }

            const insertQuery = `
        INSERT INTO inventoryinward (
          item_id, supplier_id, quantity_received, purchased_price,
          total_cost, date_received, received_by, remark, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
            const values = [
                item_id, supplier_id, quantity_received, purchased_price,
                total_cost, date_received, received_by, remark || null
            ];

            connection.query(insertQuery, values, (insertErr, insertResult) => {
                if (insertErr) return next(new ErrorHandler(insertErr.message, 500));

                // Increase item quantity
                const updateQuery = "UPDATE items SET unit_of_item = unit_of_item + ? WHERE item_id = ?";
                connection.query(updateQuery, [quantity_received, item_id], (updateErr) => {
                    if (updateErr) return next(new ErrorHandler(updateErr.message, 500));

                    res.status(201).json({
                        success: true,
                        message: "Inventory inward recorded and item quantity updated",
                        inward_id: insertResult.insertId,
                    });
                });
            });
        });
    });
});

// Create inventory outward and decrease item quantity with check
export const createInventoryOutward = catchAsyncError(async (req, res, next) => {
    const {
        item_id,
        quantity_displacement,
        purpose,
        date,
        destination,
        dispatched_by,
        remark,
        site_name,
        site_id,
        scope,
    } = req.body;

    if (
        !item_id ||
        !quantity_displacement ||
        !purpose ||
        !date ||
        !destination ||
        !dispatched_by ||
        !site_name ||
        !site_id ||
        !scope
    ) {
        return next(new ErrorHandler("All required fields must be provided", 400));
    }

    if (scope !== "Park engage" && scope !== "client") {
        return next(new ErrorHandler("Invalid value for scope. Allowed: 'Park engage' or 'client'", 400));
    }

    const itemQuery = "SELECT unit_of_item FROM items WHERE item_id = ?";
    connection.query(itemQuery, [item_id], (itemErr, itemResult) => {
        if (itemErr) return next(new ErrorHandler(itemErr.message, 500));
        if (itemResult.length === 0) {
            return next(new ErrorHandler(`Item with ID ${item_id} does not exist`, 404));
        }

        const currentUnits = itemResult[0].unit_of_item;
        if (currentUnits < quantity_displacement) {
            return next(new ErrorHandler("Insufficient number of items in stock", 400));
        }

        const siteQuery = "SELECT id FROM site_visits WHERE id = ?";
        connection.query(siteQuery, [site_id], (siteErr, siteResult) => {
            if (siteErr) return next(new ErrorHandler(siteErr.message, 500));
            if (siteResult.length === 0) {
                return next(new ErrorHandler(`Site with ID ${site_id} does not exist`, 404));
            }

            const insertQuery = `
        INSERT INTO inventoryoutward (
          item_id, quantity_displacement, purpose, date, destination,
          dispatched_by, remark, site_name, site_id, scope, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
            const values = [
                item_id, quantity_displacement, purpose, date, destination,
                dispatched_by, remark || null, site_name, site_id, scope
            ];

            connection.query(insertQuery, values, (insertErr, insertResult) => {
                if (insertErr) return next(new ErrorHandler(insertErr.message, 500));

                // Decrease item quantity
                const updateQuery = "UPDATE items SET unit_of_item = unit_of_item - ? WHERE item_id = ?";
                connection.query(updateQuery, [quantity_displacement, item_id], (updateErr) => {
                    if (updateErr) return next(new ErrorHandler(updateErr.message, 500));

                    res.status(201).json({
                        success: true,
                        message: "Inventory outward recorded and item quantity updated",
                        outward_id: insertResult.insertId,
                    });
                });
            });
        });
    });
});

export const getAllItems = catchAsyncError(async (req, res, next) => {
    const query = "SELECT * FROM items";

    connection.query(query, (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));

        res.status(200).json({
            success: true,
            items: result,
        });
    });
});

export const getItemById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    if (!id) return next(new ErrorHandler("Item ID is required", 400));

    const query = "SELECT * FROM items WHERE item_id = ?";
    connection.query(query, [id], (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));
        if (result.length === 0) return next(new ErrorHandler("Item not found", 404));

        res.status(200).json({
            success: true,
            item: result[0],
        });
    });
});

export const getAllInventoryInward = catchAsyncError(async (req, res, next) => {
    const query = `
    SELECT ii.*, i.item_name, s.supplier_name
    FROM inventoryinward ii
    JOIN items i ON ii.item_id = i.item_id
    JOIN suppliers s ON ii.supplier_id = s.supplier_id
    ORDER BY ii.date_received DESC
  `;

    connection.query(query, (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));

        res.status(200).json({
            success: true,
            inventoryInward: result,
        });
    });
});

export const getAllInventoryOutward = catchAsyncError(async (req, res, next) => {
    const query = `
    SELECT io.*, i.item_name, sv.site_name
    FROM inventoryoutward io
    JOIN items i ON io.item_id = i.item_id
    JOIN site_visits sv ON io.site_id = sv.id
    ORDER BY io.date DESC
  `;

    connection.query(query, (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));

        res.status(200).json({
            success: true,
            inventoryOutward: result,
        });
    });
});
