# Vote Now Backend

A robust backend service for a real-time voting application. This service provides APIs for user authentication, vote casting, and administrative functions.

## Features

- User authentication with JWT
- Role-based access control (Admin/User)
- Vote casting and management
- Real-time vote results
- Admin dashboard functionality
- Comprehensive error handling
- Input validation
- MongoDB integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd vote_now_back_end
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vote_now
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Start MongoDB service on your machine

## Setting Up Admin User

To create an admin user, follow these steps:

1. First, register a normal user through the `/api/auth/register` endpoint
2. Connect to your MongoDB database
3. Find the user in the `users` collection
4. Update the user's role to "admin":

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
);
```

Note: The admin role cannot be set through the API for security reasons. It must be manually set in the database.

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Routes

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Vote Routes

- `POST /api/votes` - Cast a vote (requires authentication)
- `GET /api/votes` - Get all votes
- `GET /api/votes/my-vote` - Get user's vote (requires authentication)
- `GET /api/votes/result` - Get vote results
- `GET /api/votes/names` - Get list of unique vote names

### Admin Routes (requires admin role)

- `
