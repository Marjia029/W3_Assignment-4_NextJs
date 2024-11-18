# Hotel Management API

## Overview

This project is a backend API developed using **Node.js** and **Express.js** to manage hotel details. The API allows users to interact with hotel data stored in JSON files. It supports operations such as retrieving, inserting, and updating hotel records, as well as uploading multiple images for hotels. The project also includes unit tests to verify the functionality of each endpoint.

## Features

- **POST /hotel**: Insert a new hotel record.
- **POST /images**: Upload multiple images for a hotel.
- **GET /hotel/{hotel-id}**: Retrieve detailed information for a specific hotel.
- **PUT /hotel/{hotel-id}**: Update an existing hotel's data.

## Requirements

- **Node.js** and **Express.js**
- **TypeScript** (optional but recommended for strict typing)
- **Jest** or **Mocha** for unit testing
- **Slugify** for generating slugs from hotel titles
- **Multer** for handling image uploads
- **VS Code** as IDE for building the project
- **POSTMAN** for request handling

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Marjia029/W3_NodeJS_with_Typescript_Assignment.git
cd W3_NodeJS_with_Typescript_Assignment
```
### 2. Install Dependencies

```bash
npm install
```
### 3.  Run the Project
To start the development server:

```bash
npm run dev
```
The server will run on http://localhost:5000.


## Hotel Data Schema

Each hotel record is stored in a separate JSON file named `hotel-id.json`, where `hotel-id` is the unique identifier for the hotel. The hotel data follows this structure:

### Hotel Object

- **Hotel ID**: A unique identifier for the hotel (e.g., `1`, `2`, `3`).
- **Slug**: A URL-friendly version of the hotel title, generated from the hotel title (e.g., "seaside-retreat").
- **Title**: The name of the hotel (e.g., "Seaside Retreat").
- **Description**: A short description of the hotel (e.g., "A luxurious hotel by the beach with breathtaking views.").
- **Guest Count**: The number of guests the hotel can accommodate (e.g., `150`).
- **Bedroom Count**: The number of bedrooms in the hotel (e.g., `75`).
- **Bathroom Count**: The number of bathrooms in the hotel (e.g., `75`).
- **Amenities**: A list of amenities offered by the hotel (e.g., `["Free Wi-Fi", "Outdoor Pool", "Spa"]`).
- **Host Information**: Information about the host (e.g., `Jane Doe, Owner, janedoe@example.com`).
- **Address**: The location of the hotel (e.g., `123 Seaside Blvd, Beach City`).
- **Latitude and Longitude**: Geographical coordinates of the hotel (e.g., `latitude: 34.0522`, `longitude: -118.2437`).

### Room Information

Each hotel contains multiple rooms, and each room has the following details:

- **Room Slug**: A unique identifier for the room, usually generated from the room title (e.g., `ocean-view-suite`).
- **Room Image**: The URL of the image representing the room (e.g., `https://example.com/images/room1.jpg`).
- **Room Title**: The name of the room (e.g., `Ocean View Suite`).
- **Bedroom Count**: The number of bedrooms in the room (e.g., `2`).



## Endpoints
### 1. POST/hotels
Url for creating a new hotel record is - http://localhost:5000/hotels

The json format of sending data-
```json
{
  "title": "Seaside Retreat",
  "description": "A luxurious hotel by the beach with breathtaking views.",
  "guestCount": 150,
  "bedroomCount": 75,
  "bathroomCount": 75,
  "amenities": [
    "Free Wi-Fi",
    "Outdoor Pool",
    "Spa",
    "Gym",
    "Bar"
  ],
  "hostInfo": "Jane Doe, Owner, janedoe@example.com",
  "address": "123 Seaside Blvd, Beach City",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "rooms": [
    {
      "hotelSlug": "seaside-retreat",
      "roomSlug": "ocean-view-suite",
      "roomImage": " ",
      "roomTitle": "Ocean View Suite",
      "bedroomCount": 2
    },
    {
      "hotelSlug": "seaside-retreat",
      "roomSlug": "garden-view-room",
      "roomImage": " ",
      "roomTitle": "Garden View Room",
      "bedroomCount": 1
    }
  ]
}
```
the "images" field is not required.

#### Response:
```json
{
    "message": "Hotel created successfully",
    "hotel": {
        "id": auto-generated,
        "slug": "seaside-retreat",
        "title": "Seaside Retreat",
        "description": "A luxurious hotel by the beach with breathtaking views.",
        "guestCount": 150,
        "bedroomCount": 75,
        "bathroomCount": 75,
        "amenities": [
            "Free Wi-Fi",
            "Outdoor Pool",
            "Spa",
            "Gym",
            "Bar"
        ],
        "hostInfo": "Jane Doe, Owner, janedoe@example.com",
        "address": "123 Seaside Blvd, Beach City",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "rooms": [
            {
            "hotelSlug": "seaside-retreat",
            "roomSlug": "ocean-view-suite",
            "roomImage": " ",
            "roomTitle": "Ocean View Suite",
            "bedroomCount": 2
            },
            {
            "hotelSlug": "seaside-retreat",
            "roomSlug": "garden-view-room",
            "roomImage": " ",
            "roomTitle": "Garden View Room",
            "bedroomCount": 1
            }
        ]
        
    }
}
```
The records are saved ad hotel-id.json format in ***/data/hotels*** directory. You can create hotel either using ***POSTMAN*** application or ***THUNDER CLIENT*** extension from vs code.
### 2. GET/hotels/:hotel-id
Retrieve detailed information about a hotel using its unique ID. Url - http://localhost:5000/hotels/:hotel-id or http://localhost:5000/hotels/:hotel-slug
- **Response**: A JSON object containing hotel details, including image URLs.
The server will return the response of the specified hotel.

#### Example Response:
```json
{
  "id": 1,
  "slug": "seaside-retreat",
  "images": [
    "https://example.com/images/hotel1.jpg",
    "https://example.com/images/hotel2.jpg"
  ],
  "title": "Seaside Retreat",
  "description": "A luxurious hotel by the beach with breathtaking views.",
  "guestCount": 150,
  "bedroomCount": 75,
  "bathroomCount": 75,
  "amenities": [
    "Free Wi-Fi",
    "Outdoor Pool",
    "Spa",
    "Gym",
    "Bar"
  ],
  "hostInfo": "Jane Doe, Owner, janedoe@example.com",
  "address": "123 Seaside Blvd, Beach City",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "rooms": [
    {
      "hotelSlug": "seaside-retreat",
      "roomSlug": "ocean-view-suite",
      "roomImage": "https://example.com/images/room1.jpg",
      "roomTitle": "Ocean View Suite",
      "bedroomCount": 2
    }
  ]
}
```

### 3. PUT/hotels/:hotel-id
Update information about a hotel using its unique ID. Url - http://localhost:5000/hotels/:hotel-id 

### 4. POST/images/:htel-id
Updates the **images** associated with the slug. Url - http://localhost:5000/images/:hotel-id
#### Instructions
- Open POSTMAN
- Set the htttp request method to POST
- Set the url to http://localhost:5000/images/:hotel-id
- Go to Body and select form-data
- Set the **Key** as **images** and add image of the hotel to the value.

### 5. POST/images/rooms/:hotelid/:room-slug
Updates the **roomImage** associated with the slug. Url - http://localhost:5000/images/rooms/:hotel-id/:room-slug

#### Instructions
- Open POSTMAN
- Set the htttp request method to POST
- Set the url to http://localhost:5000/images/rooms/:hotel-id/:room-slug
- Go to Body and select form-data
- Set the **Key** as **roomImage** and add image of the hotel-room to the value.

### Run the Unit Tests
```bash
npm test
```




