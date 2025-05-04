# School Management System

A comprehensive school management system with features for students, teachers, and administrators.

## Features

- **User Management**: Authentication and role-based access control
- **Student Management**: Enrollment, attendance, grades, and performance tracking
- **Teacher Management**: Scheduling, class assignments, and performance evaluation
- **Timetable Management**: Class scheduling and optimization
- **Exam Management**: Creation, grading, and result analysis
- **Fee Management**: Invoicing, payment tracking, and reporting
- **AI Integration**: AI-powered assistance, content generation, and analytics

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- RESTful API

### Frontend (Planned)
- React.js
- Redux for state management
- Material-UI components
- Responsive design

## Project Structure

```
root/
├── backend/                  --> Node.js + Express + MongoDB API
│   ├── controllers/          --> All controller logic
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── timetableController.js
│   │   ├── examController.js
│   │   ├── feeController.js
│   │   └── aiController.js
│   ├── models/               --> Mongoose schemas
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Timetable.js
│   │   ├── Exam.js
│   │   ├── Fee.js
│   │   └── Message.js
│   ├── routes/               --> Express route definitions
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── timetableRoutes.js
│   │   ├── examRoutes.js
│   │   ├── feeRoutes.js
│   │   └── aiRoutes.js
│   ├── middlewares/          --> Auth, error handling
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── roleMiddleware.js
│   ├── services/             --> Business logic, AI integration
│   │   ├── aiService.js
│   │   ├── gradingService.js
│   │   └── timetableService.js
│   ├── utils/                --> Utilities like email, SMS
│   │   ├── email.js
│   │   ├── sms.js
│   │   └── logger.js
│   ├── config/               --> MongoDB, JWT, environment settings
│   │   ├── db.js
│   │   ├── jwt.js
│   │   └── env.js
│   └── server.js             --> Main entry point
├── frontend/                 --> React App (to be implemented)
│   ├── src/
│   │   ├── components/       --> UI components
│   │   ├── pages/            --> Page-level views
│   │   ├── hooks/            --> Custom React hooks
│   │   ├── services/         --> API handlers
│   │   ├── utils/            --> Formatters, access control
│   │   ├── context/          --> Auth & global state providers
│   │   ├── App.js
│   │   └── index.js
├── README.md
└── .env
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/school-management-system.git
   cd school-management-system
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/school-management
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

## API Documentation

The API is documented using Swagger/OpenAPI. When the server is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

This documentation provides:
- Detailed information about all available endpoints
- Request and response schemas
- Authentication requirements
- The ability to test API endpoints directly from the browser

### Using the API Documentation

1. Start the server with `npm run dev`
2. Open your browser and navigate to `http://localhost:5000/api-docs`
3. Explore the available endpoints grouped by tags
4. To test authenticated endpoints:
   - First, use the `/auth/login` endpoint to get a token
   - Click the "Authorize" button at the top of the page
   - Enter your token in the format: `Bearer your_token_here`
   - Now you can test authenticated endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
