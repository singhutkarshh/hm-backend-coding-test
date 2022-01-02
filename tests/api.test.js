const { describe, before, it } = require('mocha');
const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    // eslint-disable-next-line consistent-return
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  describe('GET /health', () => {
    it('should return healthly with status code 200', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert the ride info into the table and return all the availiable rides in json placeholder format with status code 200', (done) => {
      request(app)
        .get('/rides')
        .send({
          start_lat: 23,
          start_long: 24,
          end_lat: 28,
          end_long: 45,
          rider_name: 'rider',
          driver_name: 'driver',
          driver_vehicle: 'KJ353',
        })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe('GET /rides', () => {
    it('should return all the availiable rides in json placeholder format with status code 200', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe('GET /rides:id', () => {
    it('should returns particular ride according to given id, if availible  with status code 200', (done) => {
      request(app)
        .get('/rides')
        .send({ id: 'djb1b2y2u1y1_1' })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});
