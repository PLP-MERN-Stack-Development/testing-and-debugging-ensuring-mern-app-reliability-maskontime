const mongoose = require('mongoose');
require('dotenv').config();

const setupDB = async () => {
  try {
    // Connect to the test database
    const mongoURI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/mern-testing-test';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to test database');
    
    // Drop the test database to ensure a clean state
    await mongoose.connection.dropDatabase();
    console.log('Test database cleared');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Test database setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
};

setupDB();
