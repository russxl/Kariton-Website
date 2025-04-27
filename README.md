# Kariton Recycling Rewards Web App (https://karitonwebsite.onrender.com/)

A web-based platform that incentivizes community members to segregate and recycle waste, connecting households, barangays, junk shops, and recycling centers. The system provides rewards for recycling efforts and streamlines the collection and sale of recyclable materials.

## Features
- User registration and login
- Barangay and junk shop management
- Scheduling pickups and collections
- Points and rewards system for recyclables
- Admin dashboard and logs
- Responsive EJS-based frontend

## Tech Stack
- **Backend:** Node.js, Express.js
- **Frontend:** EJS templates, HTML, CSS, JavaScript
- **Database:** MongoDB (via Mongoose)
- **Other:** dotenv, bcryptjs, express-session, nodemailer, lodash, body-parser

## Getting Started
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <project-directory>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add your MongoDB URI and any other required environment variables:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     ```
4. **Run the app:**
   ```bash
   node index.js
   ```
5. **Visit the app:**
   - Open your browser and go to `http://localhost:3000` (or your configured port).

