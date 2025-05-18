/**
 * Script to test student creation without transactions
 */

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Student = require('../models/Student');
const Guardian = require('../models/Guardian');
const StudentClassHistory = require('../models/StudentClassHistory');
const School = require('../models/School');

// Test student data
const testStudent = {
  firstName: 'John',
  lastName: 'Doe',
  middleName: 'Test',
  email: 'john.doe@example.com',
  admissionNumber: 'TEST001',
  admissionDate: new Date(),
  dateOfBirth: new Date('2010-01-01'),
  gender: 'male',
  status: 'active'
};

// Connect to database and test student creation
async function testStudentCreation() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Finding demo school...');
    const school = await School.findOne({ subdomain: 'demo' });
    
    if (!school) {
      console.error('Demo school not found. Please run createTestSchool.js first.');
      process.exit(1);
    }
    
    console.log(`Found school: ${school.name} (${school._id})`);
    
    // Find a class to assign to the student
    const Class = require('../models/Class');
    const classObj = await Class.findOne({ school: school._id });
    
    if (!classObj) {
      console.log('No class found. Creating a test class...');
      const newClass = new Class({
        name: 'Test Class',
        level: 1,
        school: school._id
      });
      await newClass.save();
      console.log(`Created test class: ${newClass.name} (${newClass._id})`);
      testStudent.class = newClass._id;
    } else {
      console.log(`Found class: ${classObj.name} (${classObj._id})`);
      testStudent.class = classObj._id;
    }
    
    // Find an academic year to assign to the student
    const AcademicYear = require('../models/AcademicYear');
    const academicYear = await AcademicYear.findOne({ school: school._id });
    
    if (!academicYear) {
      console.log('No academic year found. Creating a test academic year...');
      const newAcademicYear = new AcademicYear({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-07-31'),
        isActive: true,
        school: school._id
      });
      await newAcademicYear.save();
      console.log(`Created test academic year: ${newAcademicYear.name} (${newAcademicYear._id})`);
      testStudent.academicYear = newAcademicYear._id;
    } else {
      console.log(`Found academic year: ${academicYear.name} (${academicYear._id})`);
      testStudent.academicYear = academicYear._id;
    }
    
    // Add school to student data
    testStudent.school = school._id;
    
    console.log('Creating test student...');
    console.log(testStudent);
    
    // Create student
    const student = new Student(testStudent);
    await student.save();
    
    console.log(`Student created: ${student.firstName} ${student.lastName} (${student._id})`);
    
    // Find or create a class arm
    const ClassArm = require('../models/ClassArm');
    const classArm = await ClassArm.findOne({ school: school._id });
    
    if (!classArm) {
      console.log('No class arm found. Creating a test class arm...');
      const newClassArm = new ClassArm({
        name: 'Test Arm',
        class: testStudent.class,
        academicYear: testStudent.academicYear,
        capacity: 30,
        school: school._id
      });
      await newClassArm.save();
      console.log(`Created test class arm: ${newClassArm.name} (${newClassArm._id})`);
      testStudent.classArm = newClassArm._id;
    } else {
      console.log(`Found class arm: ${classArm.name} (${classArm._id})`);
      testStudent.classArm = classArm._id;
    }
    
    // Create initial class history entry
    if (testStudent.class && testStudent.academicYear) {
      const classHistory = new StudentClassHistory({
        student: student._id,
        class: testStudent.class,
        classArm: testStudent.classArm,
        academicYear: testStudent.academicYear,
        school: student.school,
        startDate: testStudent.admissionDate,
        status: 'active',
        remarks: 'Initial class assignment'
      });
      
      await classHistory.save();
      console.log('Created class history entry');
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the test
testStudentCreation();
