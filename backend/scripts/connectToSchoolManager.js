const mongoose = require('mongoose');
require('dotenv').config();

// Connect to the schoolmanager database
const connectToSchoolManager = async () => {
  try {
    // Use the same MongoDB server but specify the schoolmanager database
    const mongoURI = 'mongodb://localhost:27017/schoolmanager';
    
    await mongoose.connect(mongoURI, {
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
    
    // Query all subjects
    const subjects = await Subject.find();
    console.log(`Found ${subjects.length} subjects in schoolmanager database:`);
    subjects.forEach(subject => {
      console.log(`- ${subject.name} (${subject.code})`);
    });
    
    return subjects;
  } catch (error) {
    console.error('Error connecting to schoolmanager database:', error.message);
    throw error;
  }
};

// Execute the function if this script is run directly
if (require.main === module) {
  connectToSchoolManager()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { connectToSchoolManager };
