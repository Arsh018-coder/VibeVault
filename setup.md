# VibeVault Full-Stack Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your database credentials and other settings.

4. **Set up database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations (recommended for production)
   npm run db:migrate
   ```

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your API URL and other settings.

4. **Start the client:**
   ```bash
   npm start
   ```

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: Authentication and user management
- **Event**: Event information and management
- **Category**: Event categorization
- **TicketType**: Different ticket tiers (Early Bird, Regular, VIP)
- **Booking**: Ticket bookings and reservations
- **Payment**: Payment processing and tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/featured` - Get featured events
- `GET /api/events/:slug` - Get event by slug
- `POST /api/events` - Create event (organizer/admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug/events` - Get events by category

### Bookings
- `GET /api/bookings/my-bookings` - Get user bookings
- `POST /api/bookings` - Create booking

## Features Implemented

✅ **Frontend:**
- Event browsing and filtering
- Event details and booking pages
- Category-based navigation
- Responsive design
- Early Bird, Regular, VIP ticket tiers

✅ **Backend:**
- RESTful API with Express.js
- PostgreSQL database with Prisma ORM
- JWT authentication
- Role-based authorization (Admin, Organizer, Attendee)
- Input validation with Joi
- Error handling and logging

## Next Steps

1. **Seed Database**: Create sample events and categories
2. **Payment Integration**: Implement Stripe/Razorpay
3. **Email Notifications**: Set up email service
4. **File Upload**: Implement image upload for events
5. **Testing**: Add unit and integration tests
6. **Deployment**: Set up production deployment

## Development Commands

### Server
```bash
npm run dev          # Start development server
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run database migrations
```

### Client
```bash
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests
```

## Troubleshooting

1. **Database Connection Issues**: Check your DATABASE_URL in .env
2. **CORS Errors**: Ensure CLIENT_URL is set correctly in server .env
3. **JWT Errors**: Verify JWT_SECRET is set in server .env
4. **API Not Found**: Check if server is running on correct port

## Support

For issues and questions, please check the documentation or create an issue in the repository.