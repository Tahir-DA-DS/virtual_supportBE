import request from 'supertest';
import { app } from '../server';
import mongoose from 'mongoose';

describe('Session Endpoints', () => {
  let studentToken: string;
  let tutorToken: string;
  let studentId: string;
  let tutorId: string;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/virtual_support_test';
    await mongoose.connect(mongoUri);
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }

    // Create test users
    const studentData = {
      name: 'Test Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    };

    const tutorData = {
      name: 'Test Tutor',
      email: 'tutor@example.com',
      password: 'password123',
      role: 'tutor'
    };

    // Register users
    const studentResponse = await request(app)
      .post('/api/auth/register')
      .send(studentData);

    const tutorResponse = await request(app)
      .post('/api/auth/register')
      .send(tutorData);

    studentId = studentResponse.body.user.id;
    tutorId = tutorResponse.body.user.id;

    // Login to get tokens
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentData.email,
        password: studentData.password
      });

    const tutorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: tutorData.email,
        password: tutorData.password
      });

    studentToken = studentLogin.body.token;
    tutorToken = tutorLogin.body.token;
  }, 30000); // Increase timeout to 30 seconds

  describe('POST /api/sessions', () => {
    it('should create a new session successfully', async () => {
      const sessionData = {
        tutorId: tutorId,
        subject: 'Mathematics',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration: 60,
        sessionType: 'one-on-one',
        price: 50,
        currency: 'USD',
        notes: 'Help with calculus'
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body.message).toBe('Session created successfully');
      expect(response.body.session).toHaveProperty('id');
      expect(response.body.session.subject).toBe(sessionData.subject);
      expect(response.body.session.studentId).toBe(studentId);
      expect(response.body.session.tutorId).toBe(tutorId);
      expect(response.body.session.status).toBe('pending');
    }, 30000); // Increase timeout to 30 seconds

    it('should return 403 if user is not a student', async () => {
      const sessionData = {
        tutorId: studentId, // Using student as tutor (invalid)
        subject: 'Mathematics',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        price: 50
      };

      await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send(sessionData)
        .expect(403);
    }, 30000);
  });
});
