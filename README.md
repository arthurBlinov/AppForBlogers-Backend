# Backend System

## System Architecture
The backend system is a modular and secure API designed for user and content management. It follows modern architectural principles, focusing on modularity, scalability, maintainability, and efficiency.

---

## Key Features

### Modularity
The system is organized into distinct modules for various entities, including:
- **Users**: Handles registration, login, profile updates, and user management.
- **Posts**: Manages post creation, updates, and deletions.
- **Categories**: Allows admins to create, update, and manage categories.
- **Comments**: Supports user comments on posts with editing and deletion capabilities.
- **Emails**: Integrates with email services for notifications and verifications.

Each module contains controllers, models, and utilities for clear separation of concerns.

### Authentication and Authorization
- **Authentication**: JSON Web Token (JWT) is used to authenticate users and secure API endpoints.
- **Authorization**: Role-based permissions restrict sensitive operations like user blocking to admins.

### CRUD Operations
The system supports Create, Read, Update, and Delete operations for managing:
- Users
- Posts
- Categories
- Comments

---

## System Functionality

### User Management
- **Registration**: Users register with first name, last name, email, and password.
- **Login**: Authenticated users receive a JWT token to access secure endpoints.
- **Profile Management**: Users can update profiles and upload profile pictures.
- **Password Updates**: Users can change passwords after verifying the old one.
- **Admin Controls**:
  - Block users.
  - Permanently delete users violating platform rules.

### Post Management
- Users can create, read, update, and delete posts.
- Each post includes a title, image, and content linked to the creator.
- Posts can be managed by creators or admins.

### Category Management
- Admins can:
  - Create new categories for organizing posts.
  - Update or delete existing categories.
- All categories are accessible for filtering posts.

### Comment Management
- Users can comment on posts, edit their comments, or delete them.
- Comments are linked to specific posts and users.
- Admins can manage comments across the platform.

### Email Management
- Integrates with third-party email services (e.g., SendGrid) to handle:
  - Account verifications.
  - Notifications.

### File Uploads
- Profile pictures and post images can be uploaded.
- Files are stored on the server and linked to the database for seamless accessibility.

---

## Architectural Benefits

### Maintainability
- The modular design ensures that components can be updated or expanded independently.

### Scalability
- The system can handle increased user load and feature expansions without significant architectural changes.

### Security
- JWT-based authentication ensures secure access to resources.
- Role-based access control restricts sensitive operations.

### Performance
- Built with modern technologies like **Express.js**, **MongoDB**, and **Node.js**, delivering high performance and reliability.

### Simplified Business Logic
- Controllers handle business logic separately from routes and models, ensuring cleaner code and easier debugging.

---

## Technology Stack
- **Backend Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Token (JWT)
- **File Storage**: Server-based file uploads
- **Email Integration**: SendGrid

---

## Setup Instructions

### Prerequisites
Ensure you have the following installed:
- Node.js (v14 or later)
- MongoDB

### Installation
Clone the repository:
   ```bash
   git clone  https://github.com/arthurBlinov/AppForBlogers-Backend.git 
   ```
Install dependencies:
   ```bash
   npm install
   ```
### Configuration
1. Create a `.env` file in the root directory.
2. Add the following environment variables:
   ```env
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   SENDGRID_API_KEY=<your-sendgrid-api-key>
   CLOUDINARY_CLOUD_NAME=<your-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_SECRET_KEY=<your-cloudinary-secret-key>
   ```

### Running the Server
- Start the server in development mode:
  ```bash
  npm run dev
  ```
- The server will run at `http://localhost:5000`.

---

## Deployment

### Steps
1. Ensure the `.env` file is configured for the production environment.
2. Deploy to your chosen hosting service (e.g., AWS, Heroku, or Vercel).

---