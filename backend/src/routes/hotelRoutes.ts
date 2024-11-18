import express from 'express';

import { createHotel, getHotel, updateHotel, getAllHotels } from '../controllers/hotelController';
import { validateHotel } from '../validation/hotelValidation';

const router = express.Router();

router.post('/', validateHotel, createHotel);
router.get('/', getAllHotels);
router.get('/:identifier', getHotel);  // Can now handle both ID and slug
router.put('/:hotelId', validateHotel, updateHotel);

export default router;