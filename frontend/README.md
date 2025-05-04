# School Management System Frontend

This is the frontend application for the School Management System, built with React, TypeScript, and Material-UI.

## Features

- User authentication (login, register, forgot password)
- Role-based access control (admin, teacher, student, etc.)
- Dashboard with analytics and statistics
- Student management
- Teacher management
- Class management
- Subject management
- Exam management
- Fee management
- Timetable management
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

To start the development server:

```
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Building for Production

To build the app for production:

```
npm run build
```

This builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## Project Structure

- `src/components`: Reusable UI components
- `src/contexts`: React context providers
- `src/pages`: Application pages
- `src/services`: API services
- `src/types`: TypeScript type definitions
- `src/utils`: Utility functions

## API Integration

The frontend connects to the backend API using Axios. The API base URL is configured in the `src/services/api.ts` file.

## Authentication

Authentication is handled using JWT tokens. The tokens are stored in localStorage and managed by the AuthContext.

## Theming

The application uses Material-UI for theming. The theme can be customized in the ThemeContext.

## License

This project is licensed under the MIT License.
