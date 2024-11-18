import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Hotel } from '../models/hotelModel';

// Define the directories
const dataDir = path.join(__dirname, '..', 'data');
const hotelsDir = path.join(dataDir, 'hotels'); // Directory for hotel JSON files
const imageDir = path.join(__dirname, '..', '..','public', 'roomImages'); // Directory for room images

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
if (!fs.existsSync(hotelsDir)) {
  fs.mkdirSync(hotelsDir);
}
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Get hotel file path
const getHotelFilePath = (hotelId: number): string => {
  return path.join(hotelsDir, `${hotelId}.json`);
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// Helper function to update the room image field
const updateRoomImage = (hotel: Hotel, roomSlug: string, imageUrl: string): boolean => {
  // Sanitize the input slug
  const sanitizedInputSlug = roomSlug.trim().toLowerCase();
  
  console.log('Looking for room with slug:', sanitizedInputSlug);
  console.log('Available rooms:', hotel.rooms.map(room => ({
    slug: room.roomSlug,
    title: room.roomTitle
  })));

  const roomIndex = hotel.rooms.findIndex(room => {
    const matches = room.roomSlug === sanitizedInputSlug;
    console.log(`Comparing '${room.roomSlug}' with '${sanitizedInputSlug}': ${matches}`);
    return matches;
  });

  if (roomIndex === -1) {
    return false;
  }

  hotel.rooms[roomIndex].roomImage = imageUrl;
  return true;
};

// POST: Upload room image and update the room instance
export const uploadRoomImage = [
  upload.single('roomImage'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = parseInt(req.params.hotelId, 10);
      // Remove any trailing slashes and trim the room slug
      const roomSlug = req.params.roomSlug.replace(/\/$/, '').trim();

      console.log('Received request for:');
      console.log('Hotel ID:', hotelId);
      console.log('Room Slug:', roomSlug);

      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID. It must be a number.' });
        return;
      }

      const filePath = getHotelFilePath(hotelId);
      console.log('Looking for hotel file at:', filePath);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'Hotel not found.' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No image file uploaded.' });
        return;
      }

      // Generate the image URL
      const imageUrl = `/roomImages/${req.file.filename}`;

      // Read hotel data
      const hotelData = fs.readFileSync(filePath, 'utf-8');
      const hotel: Hotel = JSON.parse(hotelData);

      console.log('Found hotel:', hotel.title);
      console.log('Total rooms:', hotel.rooms.length);

      // Update the room image
      const updated = updateRoomImage(hotel, roomSlug, imageUrl);

      if (!updated) {
        res.status(404).json({ 
          error: 'Room not found.',
          details: {
            requestedSlug: roomSlug,
            availableRooms: hotel.rooms.map(room => ({
              slug: room.roomSlug,
              title: room.roomTitle
            }))
          }
        });
        return;
      }

      // Save the updated hotel data
      fs.writeFileSync(filePath, JSON.stringify(hotel, null, 2));
      
      res.status(200).json({
        message: 'Room image uploaded and updated successfully.',
        roomImage: imageUrl,
      });
    } catch (error) {
      console.error('Error uploading room image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];