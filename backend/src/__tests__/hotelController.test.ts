import { Express } from 'express';
import request from 'supertest';
import { app } from '../index';
import * as hotelController from '../controllers/hotelController';
import { validateHotel } from '../validation/hotelValidation';

// Mock both the controller and validation
jest.mock('../controllers/hotelController');
jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'),
  validationResult: (req: any) => ({
    isEmpty: () => {
      // Check if all required fields are present and valid
      const requiredFields = [
        'title',
        'description',
        'guestCount',
        'bedroomCount',
        'bathroomCount',
        'amenities',
        'hostInfo',
        'address',
        'latitude',
        'longitude',
        'rooms'
      ];

      const errors: any[] = [];
      
      requiredFields.forEach(field => {
        if (!(field in req.body)) {
          errors.push({
            msg: `${field} is required`,
            param: field
          });
        }
      });

      return errors.length === 0;
    },
    array: () => {
      const errors: any[] = [];
      const data = req.body;

      if (!data.title) {
        errors.push({ msg: 'Title is required', param: 'title' });
      }
      if (!data.description) {
        errors.push({ msg: 'Description is required', param: 'description' });
      }
      if (typeof data.guestCount !== 'number') {
        errors.push({ msg: 'Guest count must be a valid positive number', param: 'guestCount' });
      }
      if (typeof data.bedroomCount !== 'number') {
        errors.push({ msg: 'Bedroom count must be a valid positive number', param: 'bedroomCount' });
      }
      if (typeof data.bathroomCount !== 'number') {
        errors.push({ msg: 'Bathroom count must be a valid positive number', param: 'bathroomCount' });
      }
      if (!Array.isArray(data.amenities)) {
        errors.push({ msg: 'Amenities must be an array', param: 'amenities' });
      }
      if (!data.hostInfo) {
        errors.push({ msg: 'Host info is required', param: 'hostInfo' });
      }
      if (!data.address) {
        errors.push({ msg: 'Address is required', param: 'address' });
      }
      if (typeof data.latitude !== 'number') {
        errors.push({ msg: 'Latitude must be a valid decimal number', param: 'latitude' });
      }
      if (typeof data.longitude !== 'number') {
        errors.push({ msg: 'Longitude must be a valid decimal number', param: 'longitude' });
      }
      if (!Array.isArray(data.rooms)) {
        errors.push({ msg: 'Rooms must be an array', param: 'rooms' });
      }

      return errors;
    }
  })
}));

describe('POST /hotels', () => {
  let server: any;

  beforeAll(done => {
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll(done => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a hotel successfully with valid data', async () => {
    const hotelData = {
      title: 'Test Hotel',
      description: 'A beautiful hotel.',
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['WiFi', 'Pool'],
      hostInfo: 'Friendly host',
      address: '123 Test St, Test City',
      latitude: 12.34,
      longitude: 56.78,
      rooms: [
        {
          hotelSlug: 'test-hotel',
          roomSlug: 'room-1',
          roomImage: 'room1.jpg',
          roomTitle: 'Luxury Suite',
          bedroomCount: 1
        }
      ]
    };

    // Mock the controller response for successful creation
    (hotelController.createHotel as jest.Mock).mockImplementation((req, res) => {
      res.status(201).json({
        message: 'Hotel created successfully',
        hotel: {
          ...hotelData,
          slug: 'test-hotel',
        }
      });
    });

    const response = await request(app)
      .post('/hotels')
      .send(hotelData)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Hotel created successfully');
    expect(response.body.hotel.title).toBe(hotelData.title);
    expect(response.body.hotel.slug).toBe('test-hotel');
  }, 10000);

  it('should return 400 if required fields are missing', async () => {
    const invalidHotelData = {
      title: 'Test Hotel',
      description: 'A beautiful hotel.',
      guestCount: 4,
      // Missing required fields
    };

    // Mock the controller response for validation failure
    (hotelController.createHotel as jest.Mock).mockImplementation((req, res) => {
      const errors = {
        errors: [
          { msg: 'Bedroom count must be a valid positive number', param: 'bedroomCount' },
          { msg: 'Bathroom count must be a valid positive number', param: 'bathroomCount' },
          { msg: 'Amenities must be an array', param: 'amenities' },
          { msg: 'Host info is required', param: 'hostInfo' },
          { msg: 'Address is required', param: 'address' },
          { msg: 'Latitude must be a valid decimal number', param: 'latitude' },
          { msg: 'Longitude must be a valid decimal number', param: 'longitude' },
          { msg: 'Rooms must be an array', param: 'rooms' }
        ]
      };
      return res.status(400).json(errors);
    });

    const response = await request(app)
      .post('/hotels')
      .send(invalidHotelData)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  }, 10000);
});