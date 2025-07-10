# Social Media API

A comprehensive RESTful API for a social media platform built with Node.js, Express, TypeScript, and MongoDB. This API provides all the essential features needed for a modern social media application including user authentication, posts, messaging, groups, and real-time notifications.

## 🚀 Features

### 🔐 Authentication & Authorization

- User registration and login with JWT tokens
- Password hashing with bcrypt
- Role-based access control
- Token verification middleware

### 👥 User Management

- User profiles with customizable information
- Friend requests and connections
- Follow/unfollow functionality
- User search and discovery

### 📝 Posts & Content

- Create, read, update, and delete posts
- Image upload support with Cloudinary
- Comments and reactions
- Post privacy settings

### 💬 Real-time Messaging

- Private chat functionality
- Real-time messaging with Socket.IO
- Message editing and deletion
- Chat history management

### 👥 Groups & Communities

- Create and manage groups
- Group membership and roles
- Group posts and discussions
- Join requests and moderation

### 📄 Pages

- Business/organization pages
- Page management and content
- Page following system

### 🔍 Search & Discovery

- Advanced search functionality
- User and content discovery
- Filtered search results

### 📢 Notifications

- Real-time notification system
- Activity-based notifications
- Notification preferences

### 🛡️ Security & Moderation

- Content reporting system
- User blocking functionality
- Input validation and sanitization
- Rate limiting and security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Upload**: Multer + Cloudinary
- **Validation**: Express Validator
- **Security**: Helmet, CORS
- **Caching**: Redis (ioredis)
- **Logging**: Morgan

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd social-media-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   REDIS_URL=your_redis_connection_string
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🏗️ Project Structure

```
src/
├── config/
│   └── connectToDb.ts          # Database connection configuration
├── controllers/                # Route controllers
│   ├── authController.ts       # Authentication logic
│   ├── chatsController.ts      # Chat management
│   ├── groupsController.ts     # Group operations
│   ├── pagesController.ts      # Page management
│   ├── postsController.ts      # Post operations
│   ├── reportsController.ts    # Content reporting
│   ├── searchController.ts     # Search functionality
│   └── usersController.ts      # User management
├── middlewares/                # Custom middleware
│   ├── asyncWrapper.ts         # Async error handling
│   ├── isAllowed.ts           # Permission checking
│   └── verifyToken.ts         # JWT verification
├── models/                     # MongoDB schemas
│   ├── chatsModel.ts          # Chat data model
│   ├── groupsModel.ts         # Group data model
│   ├── pagesModel.ts          # Page data model
│   ├── postsModel.ts          # Post data model
│   └── usersModel.ts          # User data model
├── routes/                     # API routes
│   ├── authRouter.ts          # Authentication routes
│   ├── chatsRoute.ts          # Chat routes
│   ├── groupsRoute.ts         # Group routes
│   ├── main.ts               # Main router configuration
│   ├── pagesRoute.ts         # Page routes
│   ├── postsRoute.ts         # Post routes
│   ├── searchRoute.ts        # Search routes
│   └── usersRoute.ts         # User routes
├── services/                   # Business logic
│   ├── authServices.ts        # Authentication services
│   ├── chatsServices.ts       # Chat services
│   ├── followsServices.ts     # Follow functionality
│   ├── friendsServices.ts     # Friend management
│   ├── groupsServices.ts      # Group services
│   ├── notificationsServices.ts # Notification system
│   ├── pagesServices.ts       # Page services
│   ├── postsServices.ts       # Post services
│   ├── reportsServices.ts     # Reporting services
│   ├── searchServices.ts      # Search services
│   └── usersServices.ts       # User services
├── types/                      # TypeScript type definitions
│   ├── currentUser.ts         # Current user interface
│   ├── globalErrorType.ts     # Error handling types
│   ├── report.ts              # Report types
│   └── serviceResult.ts       # Service result types
├── utils/                      # Utility functions
│   ├── appError.ts            # Custom error handling
│   ├── cloudinary.ts          # Cloudinary configuration
│   ├── generateJwt.ts         # JWT generation
│   ├── httpStatusText.ts      # HTTP status constants
│   ├── notificationsMessages.ts # Notification templates
│   ├── userRoles.ts           # User role definitions
│   └── validations/           # Input validation schemas
└── index.ts                   # Application entry point
```

## 🔌 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user account
- `POST /users/follow/:id` - Follow a user
- `POST /users/unfollow/:id` - Unfollow a user

### Posts

- `GET /posts` - Get all posts
- `POST /posts` - Create a new post
- `GET /posts/:id` - Get post by ID
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/comments` - Add comment to post

### Chats

- `GET /chats` - Get user chats
- `POST /chats` - Create new chat
- `GET /chats/:id` - Get chat messages
- `POST /chats/:id/messages` - Send message
- `PUT /chats/:id/messages/:messageId` - Update message
- `DELETE /chats/:id/messages/:messageId` - Delete message

### Groups

- `GET /groups` - Get all groups
- `POST /groups` - Create new group
- `GET /groups/:id` - Get group details
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group
- `POST /groups/:id/join` - Join group
- `POST /groups/:id/leave` - Leave group

### Pages

- `GET /pages` - Get all pages
- `POST /pages` - Create new page
- `GET /pages/:id` - Get page details
- `PUT /pages/:id` - Update page
- `DELETE /pages/:id` - Delete page

### Search

- `GET /search` - Search users, posts, and groups

### Reports

- `POST /reports` - Report content or user
- `GET /reports` - Get reports (admin only)
- `DELETE /reports/:id` - Remove report (admin only)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Code Style

The project uses TypeScript with strict type checking. All API responses follow a consistent format:

```typescript
{
  status: "SUCCESS" | "ERROR",
  message: string,
  code: number,
  data: any | null
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Express-validator for request validation
- **Security Headers**: Helmet for security middleware
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Protection against abuse
- **Input Sanitization**: Protection against injection attacks

## 📱 Real-time Features

The API includes real-time functionality using Socket.IO:

- **Live Messaging**: Instant message delivery
- **Message Updates**: Real-time message editing
- **Message Deletion**: Instant message removal
- **Online Status**: User presence tracking
- **Notifications**: Real-time notification delivery

## 🚀 Deployment

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Redis server (for caching)
- Cloudinary account (for image uploads)

### Environment Variables

Make sure to set all required environment variables before deployment:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-media-api
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
REDIS_URL=redis://localhost:6379
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Node.js, Express, TypeScript, and MongoDB**
