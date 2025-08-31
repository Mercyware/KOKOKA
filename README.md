# KOKOKA School Management System

A comprehensive, AI-powered school management system designed to streamline educational operations while enhancing learning outcomes through intelligent features. The system supports multi-tenant architecture using subdomain-based school isolation and provides robust tools for students, teachers, administrators, and parents.

## Features

### Modern UI/UX System
- **Unified Component Architecture**: Next-generation design system with consistent styling and behavior
- **Semantic Button System**: Intent-based button variants (primary, secondary, cancel, action) with clear visual hierarchy
- **Icon Alignment System**: Advanced icon normalization for perfect alignment across all components  
- **Modern Navigation**: Professional sidebar and top navigation with proper styling (no button-like appearance)
- **Component Composition**: Tree-shakeable exports with compound components for maximum flexibility
- **Design Token System**: Comprehensive color palettes, typography scales, and spacing consistency
- **Dark Mode Support**: Full theme switching with user preferences across all components

### Core Management Systems
- **Multi-Tenant Architecture**: Subdomain-based school isolation (`school1.kokoka.com`)
- **User Management**: Authentication and role-based access control (Admin, Teacher, Student, Parent, Staff)
- **Student Management**: Enrollment, attendance, grades, and performance tracking
- **Teacher Management**: Scheduling, class assignments, and performance evaluation
- **Academic Structure**: Academic years, terms, classes, subjects, sections, and departments
- **Timetable Management**: Class scheduling and optimization
- **Staff Management**: Comprehensive staff directory and role management

### Advanced Features
- **AI Integration**: AI-powered assistance, content generation, and analytics
  - 24/7 AI tutoring chatbot
  - Automated essay grading with feedback
  - AI-powered lesson plan generation
  - Student performance analysis and recommendations
  - Personalized learning path creation
- **Attendance Management**: Digital attendance with QR codes, analytics, and parent notifications
- **Assessment & Grading**: Flexible grading systems, rubric-based assessments, and automated grading
- **Document Management**: Secure file upload, organization, and access control
- **Parent Portal**: Real-time dashboard, progress monitoring, and communication
- **Fee Management**: Invoicing, payment tracking, and financial reporting
- **Exam Management**: Creation, grading, and result analysis
- **House System**: Student house assignments and competitions
- **Sitting Position Management**: Classroom seating arrangements

## Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (primary), Redis (caching/sessions)
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **File Storage**: Local storage with secure access
- **AI Integration**: OpenAI API, Claude API
- **Real-time**: Socket.io ready
- **Email**: Nodemailer (SendGrid/AWS SES ready)
- **Security**: Helmet, CORS, XSS protection, rate limiting
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston with Morgan
- **Validation**: Joi
- **File Upload**: Multer

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Modern Design System with Radix UI
- **Component Architecture**: Unified component system with tree-shakeable exports
- **State Management**: React Context + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **Charts**: Recharts + Chart.js
- **Icons**: Lucide React with advanced alignment system
- **Themes**: Dark/Light mode support
- **Drag & Drop**: @hello-pangea/dnd

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with Prisma migrations
- **Caching**: Redis for sessions and caching
- **Reverse Proxy**: Nginx (production ready)
- **Development**: Hot reload, ESLint, Prettier
- **Testing**: Jest, Supertest (backend)

## Project Structure

```
kokoka/
├── backend/                          # Node.js + Express + PostgreSQL API
│   ├── controllers/                  # All controller logic
│   │   ├── academicCalendarController.js
│   │   ├── academicYearController.js
│   │   ├── aiController.js
│   │   ├── assessmentController.js
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── classController.js
│   │   ├── classTeacherController.js
│   │   ├── departmentController.js
│   │   ├── documentController.js
│   │   ├── examController.js
│   │   ├── feeController.js
│   │   ├── gradeController.js
│   │   ├── houseController.js
│   │   ├── parentPortalController.js
│   │   ├── schoolController.js
│   │   ├── sectionController.js
│   │   ├── sittingPositionController.js
│   │   ├── staffController.js
│   │   ├── studentClassHistoryController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   ├── teacherController.js
│   │   ├── teacherSubjectAssignmentController.js
│   │   ├── termController.js
│   │   └── timetableController.js
│   ├── models/                       # Legacy models (migrating to Prisma)
│   ├── prisma/                       # Prisma ORM configuration
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Database migrations
│   ├── routes/                       # Express route definitions
│   ├── middlewares/                  # Auth, error handling, validation
│   ├── services/                     # Business logic, AI integration
│   ├── utils/                        # Utilities (email, SMS, logger)
│   ├── config/                       # Database, JWT, environment settings
│   ├── uploads/                      # File upload directory
│   ├── logs/                         # Application logs
│   ├── scripts/                      # Database scripts and utilities
│   ├── test-utils.js                 # Testing utilities
│   ├── server.js                     # Main entry point
│   └── package.json
├── frontend/                         # React + TypeScript + Vite App
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   └── ui/                   # Modern design system components
│   │   │       ├── index.ts          # Unified component exports
│   │   │       ├── button.tsx        # Next-gen button system
│   │   │       ├── form.tsx          # Comprehensive form components
│   │   │       ├── navigation.tsx    # Sidebar navigation system
│   │   │       ├── top-navigation.tsx # Top navigation & header system
│   │   │       ├── status.tsx        # Status & feedback components
│   │   │       ├── modern-card.tsx   # Modern card system
│   │   │       └── ...               # Other design system components
│   │   ├── lib/                      # Library utilities
│   │   │   ├── design-system.ts      # Design tokens & color system
│   │   │   └── icon-utils.tsx        # Icon alignment utilities
│   │   ├── pages/                    # Page-level views
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/                 # API service functions
│   │   ├── utils/                    # Utility functions
│   │   ├── context/                  # React Context providers
│   │   ├── types/                    # TypeScript type definitions
│   │   ├── App.tsx                   # Main App component
│   │   └── main.tsx                  # Application entry point
│   ├── index.html                    # HTML template
│   ├── vite.config.ts                # Vite configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── package.json
├── docker-compose.yml                # Production Docker setup
├── docker-compose.dev.yml            # Development Docker setup
├── README.md                         # Project documentation
├── CHANGELOG.md                      # Version history and updates
├── PLAN.md                           # Technical specification
├── CLAUDE.md                         # AI assistant documentation
└── OAUTH_SETUP.md                    # OAuth configuration guide
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (for caching and sessions)
- Docker & Docker Compose (recommended)

### Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/Mercyware/KOKOKA.git
   cd KOKOKA
   ```

2. Create environment files:
   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Start the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

### Manual Installation

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Set up PostgreSQL and Redis
   npm run db:migrate
   npm run db:generate
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Configuration

Create `.env` files in both backend and frontend directories:

**Backend (.env)**:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/kokoka"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
OPENAI_API_KEY=your_openai_key
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=KOKOKA
```

## API Documentation

The API is fully documented using Swagger/OpenAPI. When the server is running, you can access the interactive API documentation at:

**http://localhost:5000/api-docs**

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

#### Core Management
- `/api/schools/*` - School management
- `/api/users/*` - User management
- `/api/students/*` - Student CRUD operations
- `/api/teachers/*` - Teacher management
- `/api/staff/*` - Staff management
- `/api/classes/*` - Class management
- `/api/subjects/*` - Subject management
- `/api/academic-years/*` - Academic year management

#### Advanced Features
- `/api/attendance/*` - Attendance tracking and analytics
- `/api/assessments/*` - Assessment creation and grading
- `/api/grades/*` - Grade management and analytics
- `/api/documents/*` - Document upload and management
- `/api/parent-portal/*` - Parent portal functionality
- `/api/ai/*` - AI-powered educational features
- `/api/timetable/*` - Timetable scheduling
- `/api/fee/*` - Fee management and invoicing

### Using the API Documentation

1. Start the server with `npm run dev`
2. Open your browser and navigate to `http://localhost:5000/api-docs`
3. Explore the available endpoints grouped by tags
4. To test authenticated endpoints:
   - First, use the `/auth/login` endpoint to get a token
   - Click the "Authorize" button at the top of the page
   - Enter your token in the format: `Bearer your_token_here`
   - Now you can test authenticated endpoints

## Development

### Available Scripts

**Backend Scripts:**
```bash
npm run dev          # Start development server with hot reload
npm run start        # Start production server
npm run test         # Run tests
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

**Frontend Scripts:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Management

The project uses Prisma ORM with PostgreSQL:

- **Schema**: `backend/prisma/schema.prisma`
- **Migrations**: `backend/prisma/migrations/`
- **Studio**: Run `npm run db:studio` to open the database GUI

### Docker Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## User Roles & Permissions

### Super Admin
- Platform-wide management
- Tenant creation and configuration
- System monitoring and analytics
- Global AI model management

### School Admin
- School-wide configuration
- User management within school
- Academic structure setup
- Reports and analytics
- AI feature configuration

### Principal/Vice Principal
- Academic oversight
- Teacher performance monitoring
- Student disciplinary actions
- Parent communication
- AI-powered insights dashboard

### Teacher
- Class management
- Lesson planning with AI assistance
- Student assessment and grading
- Parent communication
- AI-powered teaching recommendations

### Student
- Course enrollment
- Assignment submission
- Grade viewing
- AI-powered learning assistance
- Progress tracking

### Parent/Guardian
- Child's academic progress monitoring
- Communication with teachers
- Event notifications
- AI-generated progress reports

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the LICENSE file for details.
