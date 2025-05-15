const mongoose = require('mongoose');
require('dotenv').config();

// Sample subjects data
const subjectsData = [
  {
    name: 'Mathematics',
    code: 'MATH101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'English Language',
    code: 'ENG101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'Physics',
    code: 'PHY101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'Chemistry',
    code: 'CHEM101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'Biology',
    code: 'BIO101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'History',
    code: 'HIST101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'Geography',
    code: 'GEO101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'Computer Science',
    code: 'CS101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'Physical Education',
    code: 'PE101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  },
  {
    name: 'Art',
    code: 'ART101',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_user_id'
  }
];

// Connect to the schoolmanager database and seed subjects
const seedSchoolManagerSubjects = async () => {
  let connection;
  try {
    // Use the same MongoDB server but specify the schoolmanager database
    const mongoURI = 'mongodb://localhost:27017/schoolmanager';
    
    connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to schoolmanager database');
    
    // Define a schema for the subjects collection based on the provided structure
    const SubjectSchema = new mongoose.Schema({
      name: String,
      code: String,
      created_at: Date,
      updated_at: Date,
      created_by: String
    });
    
    // Create a model for the subjects collection
    const Subject = mongoose.model('Subject', SubjectSchema, 'subjects');
    
    // Check if the collection exists and has documents
    const count = await Subject.countDocuments();
    if (count > 0) {
      console.log(`The subjects collection already has ${count} documents.`);
      console.log('Clearing existing subjects...');
      await Subject.deleteMany({});
      console.log('Existing subjects cleared.');
    }
    
    // Insert the sample subjects
    const result = await Subject.insertMany(subjectsData);
    console.log(`Successfully inserted ${result.length} subjects into the schoolmanager database.`);
    
    // List the inserted subjects
    console.log('Inserted subjects:');
    result.forEach(subject => {
      console.log(`- ${subject.name} (${subject.code})`);
    });
    
    return result;
  } catch (error) {
    console.error('Error seeding schoolmanager database:', error.message);
    throw error;
  } finally {
    // Close the connection
    if (connection) {
      await mongoose.disconnect();
      console.log('Disconnected from schoolmanager database');
    }
  }
};

// Execute the function if this script is run directly
if (require.main === module) {
  seedSchoolManagerSubjects()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSchoolManagerSubjects };
