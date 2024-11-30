const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../index');
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');

describe('Backend Tests', () => {
  let server;
  let sessionCookie;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    server = app.listen(3000);
    await Profile.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    if (server) {
      console.log('Closing server...');
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection) {
      console.log('Closing database connection...');
      await mongoose.connection.close();
    }
  });
  
  const testUsername = `registerUser_${Date.now()}`;
  it('should register a new user', async () => {
    const res = await request(app).post('/register').send({
      username: testUsername,
      password: "123",
      email: 'test@example.com',
      dob: '1990-01-01',
      zipcode: '12345',
      phone: '123-456-7890',
    });
  
    expect(res.status).toBe(201);
    expect(res.body.username).toBe(testUsername);
    expect(res.body.id).not.toBeUndefined();
  
    const userId = res.body.id;
  }); 

  it('should register joey', async () => {
    const res = await request(app).post('/register').send({
      username: "joey",
      password: "pass",
      email: 'joey@example.com',
      dob: '1001-01-01',
      zipcode: '11245',
      phone: '123-456-7890',
    });
  
    expect(res.status).toBe(201);
    expect(res.body.username).toBe("joey");
    expect(res.body.id).not.toBeUndefined();
  
    const userId = res.body.id;
  }); 

  it('should log in the user', async () => {
    await request(app).post('/register').send({
        username: "loginUser",
        password: "123",
        email: 'test@example.com',
        dob: '1990-01-01',
        zipcode: '12345',
        phone: '123-456-7890',
    });

    const res = await request(app).post('/login').send({
        username: "loginUser",
        password: "123",
    });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("loginUser");
    sessionCookie = res.headers['set-cookie'].find((cookie) => cookie.startsWith('connect.sid'));
    expect(res.body.result).toBe('success');
    expect(sessionCookie).not.toBeUndefined();
  });

  it('should create a new article', async () => {
    const res = await request(app)
      .post('/article')
      .set('Cookie', sessionCookie)
      .send({ text: 'This is a test article' });

    expect(res.status).toBe(201);
    expect(res.body.articles[0].text).toBe('This is a test article');
    expect(res.body.articles[0].author).toBe("loginUser");
  });

  it('should get all articles for the logged-in user', async () => {
    const loginRes = await request(app).post('/login').send({
        username: 'loginUser',
        password: '123',
    });
    sessionCookie = loginRes.headers['set-cookie'].find((cookie) => cookie.startsWith('connect.sid'));
    expect(sessionCookie).not.toBeUndefined();

    // Create an article for the logged-in user
    const createRes = await request(app)
        .post('/article')
        .set('Cookie', sessionCookie)
        .send({ text: 'This is a test article' });
    expect(createRes.status).toBe(201);

    // Make a GET request to /article with the session cookie
    const res = await request(app)
        .get('/article')
        .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.articles).toBeInstanceOf(Array);
    expect(res.body.articles.length).toBeGreaterThanOrEqual(1);
});


  it('should get a specific article by ID', async () => {
    // First, log in to retrieve the session cookie
    const loginRes = await request(app).post('/login').send({
        username: 'loginUser',
        password: '123',
    });
    const sessionCookie = loginRes.headers['set-cookie'].find((cookie) => cookie.startsWith('connect.sid'));
    expect(sessionCookie).not.toBeUndefined();

    // Create an article to test the retrieval
    const createRes = await request(app)
        .post('/article')
        .set('Cookie', sessionCookie)
        .send({ text: 'This is a specific test article' });

    expect(createRes.status).toBe(201);
    const articleId = createRes.body.articles[0].id;
    expect(articleId).toBeDefined();

    // Fetch the created article by ID
    const res = await request(app)
        .get(`/articles/${articleId}`)
        .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.articles).toBeInstanceOf(Array);
    expect(res.body.articles.length).toBe(1);
    expect(res.body.articles[0].id).toBe(articleId);
    expect(res.body.articles[0].text).toBe('This is a specific test article');
  });


  it('should get the user headline', async () => {
    // First, log in to retrieve the session cookie
    const loginRes = await request(app).post('/login').send({
        username: 'loginUser',
        password: '123',
    });
    const sessionCookie = loginRes.headers['set-cookie'].find((cookie) => cookie.startsWith('connect.sid'));
    expect(sessionCookie).not.toBeUndefined();

    // Make a GET request to /headline with the session cookie
    const res = await request(app)
        .get('/headline')
        .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.headline).toBeDefined(); // Ensure headline is returned
  });


  it('should update the status headline', async () => {
    const res = await request(app)
      .put('/headline')
      .set('Cookie', sessionCookie)
      .send({ headline: 'This is a test headline' });

    expect(res.status).toBe(200);
    expect(res.body.headline).toBe('This is a test headline');
  });

  it('should log out the user', async () => {
    const res = await request(app)
      .put('/logout')
      .set('Cookie', sessionCookie)

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });
});
