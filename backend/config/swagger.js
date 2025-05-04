const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const { version } = require('../../package.json');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management System API',
      version: version || '1.0.0',
      description: 'API documentation for School Management System',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@school-management.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://school-management-api.example.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        School: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the school',
            },
            name: {
              type: 'string',
              description: 'School name',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly version of the school name',
            },
            subdomain: {
              type: 'string',
              description: 'Unique subdomain for the school',
            },
            logo: {
              type: 'string',
              description: 'URL to school logo image',
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                },
                city: {
                  type: 'string',
                },
                state: {
                  type: 'string',
                },
                zipCode: {
                  type: 'string',
                },
                country: {
                  type: 'string',
                },
              },
            },
            contactInfo: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                },
                phone: {
                  type: 'string',
                },
                website: {
                  type: 'string',
                },
              },
            },
            description: {
              type: 'string',
              description: 'School description',
            },
            established: {
              type: 'string',
              format: 'date',
              description: 'Date when the school was established',
            },
            type: {
              type: 'string',
              enum: ['primary', 'secondary', 'college', 'university', 'vocational', 'other'],
              description: 'Type of school',
            },
            status: {
              type: 'string',
              enum: ['active', 'pending', 'suspended', 'inactive'],
              description: 'Current status of the school',
            },
            settings: {
              type: 'object',
              properties: {
                theme: {
                  type: 'object',
                  properties: {
                    primaryColor: {
                      type: 'string',
                    },
                    secondaryColor: {
                      type: 'string',
                    },
                    accentColor: {
                      type: 'string',
                    },
                    logo: {
                      type: 'string',
                    },
                  },
                },
                grading: {
                  type: 'object',
                  properties: {
                    system: {
                      type: 'string',
                      enum: ['percentage', 'letter', 'gpa', 'custom'],
                    },
                    passMark: {
                      type: 'number',
                    },
                    scale: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          grade: {
                            type: 'string',
                          },
                          minScore: {
                            type: 'number',
                          },
                          maxScore: {
                            type: 'number',
                          },
                          gpa: {
                            type: 'number',
                          },
                          description: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
                academicYear: {
                  type: 'object',
                  properties: {
                    startMonth: {
                      type: 'number',
                    },
                    endMonth: {
                      type: 'number',
                    },
                    terms: {
                      type: 'number',
                    },
                  },
                },
                features: {
                  type: 'object',
                  properties: {
                    sms: {
                      type: 'boolean',
                    },
                    email: {
                      type: 'boolean',
                    },
                    library: {
                      type: 'boolean',
                    },
                    transport: {
                      type: 'boolean',
                    },
                    hostel: {
                      type: 'boolean',
                    },
                    ai: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
            subscription: {
              type: 'object',
              properties: {
                plan: {
                  type: 'string',
                  enum: ['free', 'basic', 'premium', 'enterprise'],
                },
                startDate: {
                  type: 'string',
                  format: 'date-time',
                },
                endDate: {
                  type: 'string',
                  format: 'date-time',
                },
                status: {
                  type: 'string',
                  enum: ['active', 'trial', 'expired', 'cancelled'],
                },
                paymentMethod: {
                  type: 'string',
                },
                paymentId: {
                  type: 'string',
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'School creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'School last update date',
            },
          },
        },
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the user',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password',
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin'],
              description: 'User role',
            },
            profileImage: {
              type: 'string',
              description: 'URL to user profile image',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user is active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login date',
            },
          },
        },
        Student: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the student',
            },
            user: {
              type: 'string',
              description: 'Reference to User model',
            },
            admissionNumber: {
              type: 'string',
              description: 'Student admission number',
            },
            class: {
              type: 'string',
              description: 'Reference to Class model',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Student date of birth',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'Student gender',
            },
            // Other properties omitted for brevity
          },
        },
        Teacher: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the teacher',
            },
            user: {
              type: 'string',
              description: 'Reference to User model',
            },
            employeeId: {
              type: 'string',
              description: 'Teacher employee ID',
            },
            // Other properties omitted for brevity
          },
        },
        Timetable: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the timetable',
            },
            class: {
              type: 'string',
              description: 'Reference to Class model',
            },
            academicYear: {
              type: 'string',
              description: 'Academic year',
            },
            term: {
              type: 'string',
              description: 'Term',
            },
            // Other properties omitted for brevity
          },
        },
        Exam: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the exam',
            },
            title: {
              type: 'string',
              description: 'Exam title',
            },
            subject: {
              type: 'string',
              description: 'Reference to Subject model',
            },
            // Other properties omitted for brevity
          },
        },
        Fee: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the fee',
            },
            student: {
              type: 'string',
              description: 'Reference to Student model',
            },
            description: {
              type: 'string',
              description: 'Fee description',
            },
            // Other properties omitted for brevity
          },
        },
        Staff: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the staff',
            },
            user: {
              type: 'string',
              description: 'Reference to User model',
            },
            employeeId: {
              type: 'string',
              description: 'Staff employee ID',
            },
            staffType: {
              type: 'string',
              enum: ['teacher', 'admin', 'cashier', 'librarian', 'counselor', 'nurse', 'security', 'maintenance', 'other'],
              description: 'Type of staff',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Staff date of birth',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'Staff gender',
            },
            department: {
              type: 'string',
              description: 'Staff department',
            },
            position: {
              type: 'string',
              description: 'Staff position',
            },
            status: {
              type: 'string',
              enum: ['active', 'on leave', 'terminated', 'retired', 'suspended'],
              description: 'Staff status',
            },
            // Other properties omitted for brevity
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ServerError: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Schools',
        description: 'School management endpoints',
      },
      {
        name: 'Students',
        description: 'Student management endpoints',
      },
      {
        name: 'Teachers',
        description: 'Teacher management endpoints',
      },
      {
        name: 'Staff',
        description: 'Staff management endpoints',
      },
      {
        name: 'Timetables',
        description: 'Timetable management endpoints',
      },
      {
        name: 'Exams',
        description: 'Exam management endpoints',
      },
      {
        name: 'Fees',
        description: 'Fee management endpoints',
      },
      {
        name: 'AI',
        description: 'AI integration endpoints',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js'),
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'School Management API Documentation',
};

// Setup Swagger middleware
const setupSwagger = (app) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation available at /api-docs');
};

module.exports = {
  setupSwagger,
  swaggerSpec,
};
