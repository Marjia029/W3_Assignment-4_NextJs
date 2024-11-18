import express from 'express';
import { uploadImage } from '../controllers/imageController';

const router = express.Router();

// POST /images/:identifier - Upload images and update the hotel’s images field
// `identifier` can be either the hotel ID or slug
router.post('/', uploadImage);

export default router;
