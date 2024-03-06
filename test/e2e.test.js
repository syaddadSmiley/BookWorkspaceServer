const request = require('supertest');   
const assert = require('assert');
const app = require('../index');
const jwt = require('jsonwebtoken');
// const mocha = require('mocha');

describe('GET /', () => {
    it('RESPOND WITH HELLO WORLD', async () => {
        const response = await request(app).get('/');
        assert.equal(response.text, "hello world");
    });
});

var token = null;

describe('GET /api/v1/login', () => {

    it('RESPOND INVALID IF USER-AGENT NOT VALID\n', async () => {
        const response = await request(app).post('/api/v1/login').set('user-agent', 'Safari').send({ 
            "username": 'budi123', "password": 'hehe' 
        });
        assert.equal(response.body.message, "please provide a valid header");
    });

    it('RESPOND INVALID IF USERNAME NOT REGISTERED\n', async () => {
        const response = await request(app).post('/api/v1/login').set('user-agent', 'Chrome').send({ 
            "username": 'wrongusername', "password": 'hehe' 
        });
        assert.equal(response.body.message, "invalid");
    });

    it('RESPOND INVALID IF PASSWORD NOT MATCH\n', async () => {
        const response = await request(app).post('/api/v1/login').set('user-agent', 'Chrome').send({ 
            "username": 'budi123', "password": 'wrongpassword' 
        });
        assert.equal(response.body.message, "invalid");
    });

    it('RESPOND SUCCESS IF USERNAME AND PASSWORD MATCH\n', async () => {
        const response = await request(app).post('/api/v1/login').set('user-agent', 'Chrome').send({ 
            "username": 'budi123', "password": 'hehe' 
        });
        token = response.body.data.token;
        assert.equal(response.body.message, "Logged in");
    });
    
});

describe('GET /api/v1/items/getUserItems', () => {

    it('RESPOND WITH 401 IF NO TOKEN PROVIDED\n', async () => {
        const response = await request(app).get('/api/v1/items/getUserItems');
        assert.equal(response.status, 401);
    });

    it('RESPOND WITH 401 IF TOKEN NOT VALID\n', async () => {
        const response = await request(app).get('/api/v1/items/getUserItems').set('Authorization', 'Bearer ' + token + '1');
        assert.equal(response.status, 401);
    });

    it('RESPOND WITH 401 AND "TOKEN EXPIRED" IF TOKEN EXPIRED\n', async () => {

        const payload = {
            id: 1,
            username: 'budi123',
            userAgent: 'Chrome',
        };
        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: 0, algorithm: 'HS512' });

        const response = await request(app).get('/api/v1/items/getUserItems').set('Authorization', 'Bearer ' + token);
        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Please provide a valid token, your token might be expired");
    });

    it('RESPOND WITH 200 IF TOKEN VALID\n', async () => {
        const response = await request(app).get('/api/v1/items/getUserItems').set('Authorization', 'Bearer ' + token);
        assert.equal(response.status, 200);
        assert.equal(typeof(response.body.data), 'object');
    });

});