/**
 * Script to list all schools in the database
 * This is useful for development to see what schools are available
 * and their subdomains for testing
 */

const mongoose = require('mongoose');
const School = require('../models/School');
const { connectDB } = require('../config/db');

// Connect to database
connectDB()
  .then(async () => {
    try {
      console.log('Connected to database. Fetching schools...');
      
      // Get all schools
      const schools = await School.find({}).select('name subdomain status subscription.status');
      
      console.log('\n===== SCHOOLS =====');
      if (schools.length === 0) {
        console.log('No schools found in the database.');
      } else {
        console.log(`Found ${schools.length} schools:`);
        schools.forEach((school, index) => {
          console.log(`\n${index + 1}. ${school.name}`);
          console.log(`   Subdomain: ${school.subdomain}`);
          console.log(`   Status: ${school.status}`);
          console.log(`   Subscription: ${school.subscription.status}`);
        });
      }
      
      console.log('\nTo use a school for development, set the subdomain in localStorage:');
      console.log('localStorage.setItem("dev_subdomain", "school-subdomain")');
      
      console.log('\nOr use the DevSubdomainSelector component in the UI.');
      
    } catch (error) {
      console.error('Error fetching schools:', error);
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
