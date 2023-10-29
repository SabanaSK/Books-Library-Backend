# Books-Library-Backend

This is the backend implementation for the Book Library application.
This document provides a guide on how to set up and run the app locally.

## Getting Started

### 1. Clone the Repository

git clone https://github.com/SabanaSK/Books-Library-Backend.git

### 2. Install Dependencies

npm install

### 3. Set Up Environment Variables

PORT=[YOUR_PORT]
JWT_KEY=[YOUR_KEY]
JWT_REFRESH_KEY=[YOUR_KEY]
NODE_ENV=development

DATABASE CONNECTION ENVIRONMENT VARIABLES
DB_HOST=[YOUR_DB_HOST]
DB_USER=[YOUR_DB_USER]
DB_NAME=[YOUR_DB_NAME]
DB_PASSWORD=[YOUR_DB_PASSWORD]

ADMIN INFORMATION
ADMIN_USERNAME=[YOUR_ADMIN_USERNAME]
ADMIN_EMAIL=[YOUR_ADMIN_EMAIL]
ADMIN_PASSWORD=[YOUR_ADMIN_PASSWORD]

PRIVATE EMAIL INFO
FROM_EMAIL_USER=[YOUR_FROM_EMAIL_USER]
TO_EMAIL_USER=[YOUR_TO_EMAIL_USER]

API KEY FROM SENDGRID
SENDGRID_API_KEY=[YOUR_SENDGRID_API_KEY]

### 4. Set Up the Database

1. Create a schema in your MySQL database that corresponds to the DB_NAME in your .env file.
2. Run the following command to set up the database: node setupDB.js

## Running the App

npm start

You should see the app running on the specified PORT, Example http://localhost:8080.
