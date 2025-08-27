# Virtual Support Backend API

A robust backend API for a virtual tutoring and support platform built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Tutor Management**: Complete CRUD operations for tutor profiles
- **Role-Based Authorization**: Support for students, tutors, and admins
- **API Documentation**: Swagger/OpenAPI documentation
- **Type Safety**: Full TypeScript implementation
- **Database**: MongoDB with Mongoose ODM
- **Security**: Password hashing, JWT tokens, CORS protection

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Language**: TypeScript 5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint + Prettier

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- MongoDB instance (local or cloud)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd virtual_SupportBE
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
cp env.example .env
```

Fill in your environment variables:
```env
MONGO_URI=mongodb://localhost:27017/virtual_support
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1h
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **API JSON**: `http://localhost:5000/api-docs.json`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check
```

## 🏗️ Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── api/
│   ├── controllers/     # Request handlers
│   ├── middlewares/    # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── services/       # Business logic
├── config/             # Configuration files
├── constants/          # Application constants
├── cron/              # Scheduled tasks
├── tests/             # Test files
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── server.ts          # Main server file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tutors
- `POST /api/tutors/profile` - Create/update tutor profile (Auth required)
- `GET /api/tutors/:id/profile` - Get tutor profile by ID
- `GET /api/tutors/all` - Get all tutor profiles

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Input validation and sanitization
- Environment variable protection

## 🚧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Adding New Features
1. Create models in `src/api/models/`
2. Add business logic in `src/api/services/`
3. Create controllers in `src/api/controllers/`
4. Define routes in `src/api/routes/`
5. Add tests in `src/tests/`

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | `1h` |
| `PORT` | Server port | No | `5000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `CORS_ORIGIN` | CORS allowed origin | No | `true` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@virtualsupport.com

## 🔮 Roadmap

- [ ] Booking system
- [ ] Payment integration
- [ ] Real-time chat
- [ ] Video calling
- [ ] File uploads
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting
