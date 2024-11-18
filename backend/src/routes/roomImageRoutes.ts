import express from 'express';
import { uploadRoomImage } from '../controllers/roomImageController';

const router = express.Router();

// Adjusted route for uploading room image
router.post('/:hotelId/:roomSlug', uploadRoomImage);

export default router;
