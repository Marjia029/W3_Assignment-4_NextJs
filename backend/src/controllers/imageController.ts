// imageController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Hotel } from '../models/hotelModel';
import { getHotelFilePath, findHotelBySlug } from './hotelController';

const publicDir = path.join(__dirname, '..', '..','public');
const uploadDir = path.join(publicDir, 'images');

// Ensure the upload directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueSuffix);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

// Create multer instance with configuration
export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).array('images', 10);

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  // Use multer as middleware with error handling
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const identifier = req.body.identifier;
      
      console.log('Request body:', req.body); // Add this for debugging
      console.log('Files:', req.files); // Add this for debugging

      if (!identifier) {
        res.status(400).json({ error: 'Identifier is required' });
        return;
      }

      let hotel: Hotel | null = null;

      // Check if the identifier is a number (ID) or string (slug)
      const hotelId = parseInt(identifier, 10);
      if (!isNaN(hotelId)) {
        const filePath = getHotelFilePath(hotelId);
        if (fs.existsSync(filePath)) {
          const hotelData = fs.readFileSync(filePath, 'utf-8');
          hotel = JSON.parse(hotelData);
        }
      } else {
        // If identifier is a slug, find hotel by slug
        hotel = await findHotelBySlug(identifier);
      }

      if (!hotel) {
        res.status(404).json({ error: 'Hotel not found' });
        return;
      }

      // Initialize images array if it doesn't exist
      if (!hotel.images) {
        hotel.images = [];
      }

      // Update the images field with relative paths
      if (req.files && Array.isArray(req.files)) {
        const newImagePaths = (req.files as Express.Multer.File[]).map(file => 
          `/images/${file.filename}`
        );
        hotel.images.push(...newImagePaths);
      }

      // Save the updated hotel data
      const filePath = getHotelFilePath(hotel.id);
      await fs.promises.writeFile(filePath, JSON.stringify(hotel, null, 2));

      res.status(200).json({
        message: 'Image uploaded successfully',
        images: hotel.images
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
};