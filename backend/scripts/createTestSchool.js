/**
 * Script to create a test school for development
 * This is useful for local development to ensure there's always a school available
 */

const mongoose = require('mongoose');
const School = require('../models/School');
const User = require('../models/User');
const { connectDB } = require('../config/db');
const bcrypt = require('bcryptjs');

// Test school data
const testSchool = {
  name: 'Demo School',
  subdomain: 'demo',
  address: {
    street: '123 Education Street',
    city: 'Demo City',
    state: 'Demo State',
    zipCode: '12345',
    country: 'Demo Country'
  },
  contactInfo: {
    email: 'admin@demoschool.com',
    phone: '+1234567890',
    website: 'https://demoschool.com'
  },
  description: 'A demo school for testing and development',
  established: new Date('2020-01-01'),
  type: 'secondary',
  status: 'active',
  settings: {
    theme: {
      primaryColor: '#3f51b5',
      secondaryColor: '#f50057',
      accentColor: '#8bc34a'
    }
  },
  subscription: {
    plan: 'premium',
    status: 'active',
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  }
};

// Test admin user data
const testAdmin = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@demoschool.com',
  password: 'password123',
  role: 'admin'
};

// Connect to database
connectDB()
  .then(async () => {
    try {
      console.log('Connected to database. Checking for existing test school...');
      
      // Check if test school already exists
      let school = await School.findOne({ subdomain: testSchool.subdomain });
      
      if (school) {
        console.log(`Test school already exists: ${school.name} (${school.subdomain})`);
        console.log('School status:', school.status);
        
        // Update school status to active if it's not
        if (school.status !== 'active') {
          school.status = 'active';
          await school.save();
          console.log('Updated school status to active');
        }
      } else {
        // Create test school
        school = await School.create(testSchool);
        console.log(`Created test school: ${school.name} (${school.subdomain})`);
      }
      
      // Check if admin user exists
      let admin = await User.findOne({ email: testAdmin.email });
      
      if (admin) {
        console.log(`Admin user already exists: ${admin.email}`);
      } else {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testAdmin.password, salt);
        
        // Create admin user
        admin = await User.create({
          ...testAdmin,
          password: hashedPassword,
          school: school._id
        });
        
        console.log(`Created admin user: ${admin.email}`);
        console.log('Password:', testAdmin.password);
      }
      
      console.log('\n===== TEST SCHOOL DETAILS =====');
      console.log(`Name: ${school.name}`);
      console.log(`Subdomain: ${school.subdomain}`);
      console.log(`Status: ${school.status}`);
      console.log(`Admin Email: ${testAdmin.email}`);
      console.log(`Admin Password: ${testAdmin.password}`);
      
      console.log('\nTo use this school for development, set the subdomain in localStorage:');
      console.log(`localStorage.setItem("dev_subdomain", "${school.subdomain}");`);
      
      console.log('\nOr use the DevSubdomainSelector component in the UI.');
      
    } catch (error) {
      console.error('Error creating test school:', error);
    } finally {
      // Close database connection
      mongoose.connection.close();
      console.log('\nDatabase connection closed.');
    }
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
