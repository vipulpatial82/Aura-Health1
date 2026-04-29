import express from 'express';
import { searchByLocation, autoLocation, nearbyByCoords } from '../controllers/hospitalController.js';

const router = express.Router();

router.post('/search', searchByLocation);
router.get('/auto-location', autoLocation);
router.post('/nearby', nearbyByCoords);

export default router;
