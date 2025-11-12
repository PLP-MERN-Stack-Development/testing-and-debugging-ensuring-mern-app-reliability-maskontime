const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app, connectDB, closeDB } = require('../src/index');

let mongoServer;

// Increase timeout for all tests to 30 seconds
jest.setTimeout(30000);

// Set up a test database before all tests
beforeAll(async () => {
  try {
    // Create in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Set the test database URI
    process.env.MONGO_URI_TEST = mongoUri;
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Clean up after all tests are done
afterAll(async () => {
  try {
    // Close the database connection
    await closeDB();
    
    // Stop the in-memory MongoDB server
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
});

describe('API Health Check', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('404 Not Found', () => {
  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.statusCode).toEqual(404);
  });
});
