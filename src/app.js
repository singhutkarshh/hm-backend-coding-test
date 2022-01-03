const express = require('express');

const bodyParser = require('body-parser');

const app = express();
const jsonParser = bodyParser.json();

const logger = require('../logs/index');

module.exports = (db) => {
  /**
   * @swagger
   * /health:
   *  get:
   *   description: Use it to check the health of the server.
   *                The API returns healthy if server is up and running.
   *   responses:
   *     '200':
   *        description: Successfull! Server is in healthy condition.
   */
  app.get('/health', (req, res) => res.send('Healthy'));

  /**
   * @swagger
   * /rides:
   *  post:
   *   description: Input info related to your ride i.e. latitude ,
   *                longitude, rider-info, driver-info etc.
   *                The API first validates the input, if valid inserts the info
   *                into the database into their respective rows else throws
   *                the error code and message.
   *
   *   responses:
   *     '200':
   *        description: returns all the availiable rides in json placeholder format.
   *     '400':
   *        description: {error code , error message}
   */
  app.post('/rides', jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90
         || startLongitude < -180 || startLongitude > 180) {
      logger.error({ error_code: 'VALIDATION_ERROR' });
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 to 90 and -180 to 180 degrees respectively',
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      logger.error({ error_code: 'VALIDATION_ERROR' });
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 to 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      logger.error({ error_code: 'VALIDATION_ERROR' });
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      logger.error({ error_code: 'VALIDATION_ERROR' });
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      logger.error({ error_code: 'VALIDATION_ERROR' });
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    const values = [req.body.start_lat, req.body.start_long, req.body.end_lat,
      req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

    // eslint-disable-next-line consistent-return
    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
      if (err) {
        logger.error({ error_code: 'SERVER_ERROR' });
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      /* replaced err in the following line with error
       since err was already defined in the upperscope at line 60 */
      db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (error, rows) => {
        if (error) {
          logger.error({ error_code: 'SERVER_ERROR' });
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }
        // added return statement
        return res.send(rows);
      });
    });
    logger.error({ error_code: 'SERVER_ERROR' });
    return res.send({
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    });
  });

  /**
   * @swagger
   * /rides:
   *  get:
   *   description: The API searches for all the availible riders into the database rows
   *                and if found return them else returns error with code and message.
   *   responses:
   *     '200':
   *        description: returns all the availiable rides in json format.
   *     '404':
   *        description: {error code , error message}
   */

  app.get('/rides', (req, res) => {
    // included pagination
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    // eslint-disable-next-line consistent-return
    db.all('SELECT * FROM Rides', (err, rows) => {
      if (err) {
        logger.error({ error_code: 'SERVER_ERROR' });
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        logger.error({ error_code: 'RIDES_NOT_FOUND_ERROR' });
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }
      if (endIndex < rows.length) {
        results.next = {
          page: page + 1,
          limit,
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit,
        };
      }
      results.results = rows.slice(startIndex, endIndex);
      res.status(200).send(results);
    });
  });

  /**
   * @swagger
   * /rides/:id:
   *  get:
   *   description: Use it to search for a specific availiable ride.
   *   responses:
   *     '200':
   *        description: returns particular ride if availible in json.
   *     '404':
   *        description: {error code , error message}
   */

  app.get('/rides/:id', (req, res) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, (err, rows) => {
      if (err) {
        logger.error({ error_code: 'SERVER_ERROR' });
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        logger.error({ error_code: 'RIDES_NOT_FOUND_ERROR' });
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }
      // added return statement
      return res.send(rows);
    });
  });

  return app;
};
