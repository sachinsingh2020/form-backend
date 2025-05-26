import connection from "../config/database.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

export const createSiteVisit = catchAsyncError(async (req, res, next) => {
    const {
        site_name,
        site_type,
        location_address,
        date_of_visit,
        description,
        client_name,
        client_designation,
        client_mail,
        contact_number,
    } = req.body;

    console.log({ site_name, site_type, location_address, date_of_visit, description, client_name, client_designation, client_mail, contact_number })

    const user_id = req.user?.id;
    console.log({ user_id })

    if (
        !site_name ||
        !site_type ||
        !location_address ||
        !date_of_visit ||
        !description ||
        !user_id ||
        !client_name ||
        !client_designation ||
        !client_mail ||
        !contact_number
    ) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    const query = `
        INSERT INTO site_visits (
            user_id,
            site_name,
            site_type,
            location_address,
            date_of_visit,
            description,
            client_name,
            client_designation,
            client_mail,
            contact_number,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
        user_id,
        site_name,
        site_type,
        location_address,
        date_of_visit,
        description,
        client_name,
        client_designation,
        client_mail,
        contact_number
    ];
    // console.log("sachin");


    connection.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
        }
        if (err) return next(new ErrorHandler(err.message, 500));

        res.status(201).json({
            success: true,
            message: "Site visit created successfully",
            siteVisitId: result.insertId
        });
    });
});


export const getSiteVisits = catchAsyncError(async (req, res, next) => {
    const user_id = req.user?.id;
    console.log({ user_id })
    if (!user_id) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const query = `
        SELECT * FROM site_visits
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    connection.query(query, [user_id], (err, results) => {
        if (err) return next(new ErrorHandler(err.message, 500));

        res.status(200).json({
            success: true,
            siteVisits: results
        });
    });
});

export const getSiteVisitsByUserId = catchAsyncError(async (req, res, next) => {
    const { user_id } = req.params;
    console.log({ user_id })

    if (!user_id) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const query = `
        SELECT * FROM site_visits
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    connection.query(query, [user_id], (err, results) => {
        if (err) return next(new ErrorHandler(err.message, 500));

        res.status(200).json({
            success: true,
            siteVisits: results
        });
    });
});
