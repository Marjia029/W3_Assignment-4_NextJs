import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { validationResult } from 'express-validator';

import { Hotel } from '../models/hotelModel';
import { createSlug } from '../utils/slugifyUtil';


const dataDir = path.join(__dirname, '..', 'data');
const hotelsDir = path.join(dataDir, 'hotels');

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
if (!fs.existsSync(hotelsDir)) {
  fs.mkdirSync(hotelsDir);
}

export const getHotelFilePath = (hotelId: number): string => {
  return path.join(hotelsDir, `${hotelId}.json`);
};

// Function to reorder hotel properties
const reorderHotelProperties = (hotel: Hotel) => {
  return {
    id: hotel.id,
    slug: hotel.slug,
    images: hotel.images,
    title: hotel.title,
    description: hotel.description,
    guestCount: hotel.guestCount,
    bedroomCount: hotel.bedroomCount,
    bathroomCount: hotel.bathroomCount,
    amenities: hotel.amenities,
    hostInfo: hotel.hostInfo,
    address: hotel.address,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    rooms: hotel.rooms
  };
};

// Helper function to find hotel by slug
export const findHotelBySlug = async (slug: string): Promise<Hotel | null> => {
  try {
    const files = fs.readdirSync(hotelsDir);
    
    for (const file of files) {
      const filePath = path.join(hotelsDir, file);
      const hotelData = fs.readFileSync(filePath, 'utf-8');
      const hotel: Hotel = JSON.parse(hotelData);
      
      if (hotel.slug === slug) {
        return hotel;
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding hotel by slug:', error);
    return null;
  }
};

// Function to get the next available hotel ID (auto-generation)
export const getNextHotelId = (): number => {
  const files = fs.readdirSync(hotelsDir);
  let maxId = 0;

  files.forEach((file) => {
    const filePath = path.join(hotelsDir, file);
    const hotelData = fs.readFileSync(filePath, 'utf-8');
    const hotel: Hotel = JSON.parse(hotelData);
    if (hotel.id > maxId) {
      maxId = hotel.id;
    }
  });

  return maxId + 1;  // Increment the highest ID by 1 to generate a new ID
};

// POST: Create a new hotel
export const createHotel = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const hotel: Hotel = {
      ...req.body,
      id: getNextHotelId(),  // Automatically generate the ID here
      
      images: req.body.images || [],
    };
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'guestCount', 'bedroomCount', 
                            'bathroomCount', 'amenities','hostInfo', 'address', 'latitude', 'longitude', 'rooms'];
    
    for (const field of requiredFields) {
      if (!(field in hotel)) {
        res.status(400).json({ error: `Missing required field: ${field}` });
        return;
      }
    }

    // Generate slug based on the title
    hotel.slug = createSlug(hotel.title);

    const filePath = getHotelFilePath(hotel.id);
    if (fs.existsSync(filePath)) {
      res.status(400).json({ error: 'Hotel with this ID already exists.' });
      return;
    }

    // Check if slug already exists and modify it to make it unique
    const existingHotel = await findHotelBySlug(hotel.slug);
    if (existingHotel) {
      hotel.slug = `${hotel.slug}-${hotel.id}`;  // Add ID to the slug if a conflict occurs
    }

    // Save the new hotel to the filesystem
    fs.writeFileSync(filePath, JSON.stringify(hotel, null, 2));
    const orderedHotel = reorderHotelProperties(hotel);
    res.status(201).json({ 
      message: 'Hotel created successfully', 
      hotel: orderedHotel 
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET: Retrieve a hotel by ID or slug
export const getHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = req.params.identifier;  // Can be either ID or slug
    let hotel: Hotel | null = null;

    // Try to parse as ID first
    const potentialId = parseInt(identifier, 10);
    if (!isNaN(potentialId)) {
      // If it's a valid number, try to find by ID
      const filePath = getHotelFilePath(potentialId);
      if (fs.existsSync(filePath)) {
        const hotelData = fs.readFileSync(filePath, 'utf-8');
        hotel = JSON.parse(hotelData);
      }
    }

    // If not found by ID, try to find by slug
    if (!hotel) {
      hotel = await findHotelBySlug(identifier);
    }

    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found.' });
      return;
    }

    const orderedHotel = reorderHotelProperties(hotel);
    res.status(200).json(orderedHotel);
  } catch (error) {
    console.error('Error retrieving hotel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT: Update an existing hotel by its ID
export const updateHotel = async (req: Request, res: Response): Promise<void> => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const hotelId = parseInt(req.params.hotelId, 10);
    if (isNaN(hotelId)) {
      res.status(400).json({ error: 'Invalid hotel ID. It must be a number.' });
      return;
    }

    const filePath = getHotelFilePath(hotelId);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Hotel not found.' });
      return;
    }

    // Read existing hotel data
    const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const updatedData: Hotel = {
      ...existingData,
      ...req.body,
      id: hotelId,  // Ensure ID remains unchanged
      
      images: req.body.images || existingData.images || [],
      
    };

    if (req.body.title) {
      updatedData.slug = createSlug(req.body.title);
      
      // Check if new slug would conflict with existing hotel (except self)
      const existingHotel = await findHotelBySlug(updatedData.slug);
      if (existingHotel && existingHotel.id !== hotelId) {
        updatedData.slug = `${updatedData.slug}-${hotelId}`;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    const orderedHotel = reorderHotelProperties(updatedData);
    res.status(200).json({ 
      message: 'Hotel updated successfully',
      hotel: orderedHotel 
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
  }
}


// GET: Retrieve all hotels
export const getAllHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = fs.readdirSync(hotelsDir);
    const hotels: Hotel[] = [];

    for (const file of files) {
      const filePath = path.join(hotelsDir, file);
      const hotelData = fs.readFileSync(filePath, 'utf-8');
      const hotel: Hotel = JSON.parse(hotelData);
      hotels.push(hotel);
    }

    // Return ordered properties for each hotel
    const orderedHotels = hotels.map(reorderHotelProperties);
    res.status(200).json(orderedHotels);
  } catch (error) {
    console.error('Error retrieving all hotels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

