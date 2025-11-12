const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, connectDB, closeDB } = require('../src/index');
const User = require('../src/models/User');

let mongoServer;

// Increase timeout for all tests to 30 seconds
jest.setTimeout(30000);

// Test user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

// Set up test database before all tests
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

// Clear all test data after each test
afterEach(async () => {
  await User.deleteMany({});
});

describe('User Registration', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.username).toBe(testUser.username);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register user with existing email', async () => {
    // First registration
    await request(app)
      .post('/api/users/register')
      .send(testUser);
    
    // Second registration with same email
    const res = await request(app)
      .post('/api/users/register')
      .send({
        ...testUser,
        username: 'differentuser'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should not register user with invalid data', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'us', // too short
        email: 'invalid-email', // invalid email
        password: '123' // too short
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('User Login', () => {
  beforeEach(async () => {
    // Register a test user
    await request(app)
      .post('/api/users/register')
      .send(testUser);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with invalid password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should not login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});

describe('User Profile', () => {
  let token;
  
  beforeEach(async () => {
    // Register and login a test user
    await request(app)
      .post('/api/users/register')
      .send(testUser);
    
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    token = loginRes.body.token;
  });

  it('should get user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', testUser.username);
    expect(res.body).toHaveProperty('email', testUser.email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should update user profile with valid data', async () => {
    const updatedData = {
      username: 'updateduser',
      email: 'updated@example.com'
    };
    
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', updatedData.username);
    expect(res.body).toHaveProperty('email', updatedData.email);
  });

  it('should not update user profile with invalid data', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid-email'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should not access protected routes without token', async () => {
    const res = await request(app)
      .get('/api/users/profile');
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Authentication required');
  });
});
