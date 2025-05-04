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

### Admin Routes (requires admin role)

- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete a user
- `PATCH /api/admin/users/:id` - Update a user
- `GET /api/admin/votes` - Get detailed vote information

## Error Handling

The application includes comprehensive error handling for:

- Validation errors
- Authentication errors
- Database errors
- Not found errors
- Server errors

## Security Features

- JWT-based authentication
- Password hashing
- Role-based authorization
- Input validation
- CORS enabled
- Environment variable configuration

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── models/         # Database models
├── repositories/   # Data access layer
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── validators/     # Input validation schemas
```
