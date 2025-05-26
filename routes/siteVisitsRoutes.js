import express from 'express';
import { createSiteVisit, getSiteVisits, getSiteVisitsByUserId } from '../controllers/siteVisitsController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.route("/createsite").post(isAuthenticated, createSiteVisit);

router.route('/getsites').get(isAuthenticated, getSiteVisits)

router.route('/getsitesbyuser/:user_id').get(isAuthenticated, getSiteVisitsByUserId);

export default router;