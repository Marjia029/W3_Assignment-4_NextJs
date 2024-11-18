import { body, ValidationChain } from 'express-validator';

// Validation rules for creating and updating a hotel
export const validateHotel: ValidationChain[] = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  
  // Ensure guestCount is a number and not a string
  body('guestCount')
    .custom(value => {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Guest count must be a valid positive number');
      }
      if (value < 1) {
        throw new Error('Guest count must be a positive integer');
      }
      return true;
    }),

  // Ensure bedroomCount is a number and not a string
  body('bedroomCount')
    .custom(value => {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Bedroom count must be a valid positive number');
      }
      if (value < 1) {
        throw new Error('Bedroom count must be a positive integer');
      }
      return true;
    }),

  // Ensure bathroomCount is a number and not a string
  body('bathroomCount')
    .custom(value => {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Bathroom count must be a valid positive number');
      }
      if (value < 1) {
        throw new Error('Bathroom count must be a positive integer');
      }
      return true;
    }),

  body('amenities').isArray().withMessage('Amenities must be an array'),
  body('hostInfo').notEmpty().withMessage('Host info is required'),
  body('address').notEmpty().withMessage('Address is required'),

  // Ensure latitude is a valid decimal number, not a string
  body('latitude')
    .custom(value => {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Latitude must be a valid decimal number');
      }
      return true;
    }),

  // Ensure longitude is a valid decimal number, not a string
  body('longitude')
    .custom(value => {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Longitude must be a valid decimal number');
      }
      return true;
    }),

  body('rooms').isArray().withMessage('Rooms must be an array')
];
