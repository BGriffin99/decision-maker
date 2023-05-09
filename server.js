// load .env data into process.env
require('dotenv').config();

// Web server config
const sassMiddleware = require('./lib/sass-middleware');
const express = require('express');
const morgan = require('morgan');

const PORT = process.env.PORT || 8080;
const app = express();

app.set('view engine', 'ejs');

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/styles',
  sassMiddleware({
    source: __dirname + '/styles',
    destination: __dirname + '/public/styles',
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static('public'));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const userApiRoutes = require('./routes/users-api');
const widgetApiRoutes = require('./routes/widgets-api');
const usersRoutes = require('./routes/users');

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
// Note: Endpoints that return data (eg. JSON) usually start with `/api`
app.use('/api/users', userApiRoutes);
app.use('/api/widgets', widgetApiRoutes);
app.use('/users', usersRoutes);
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
const express = require('express');
const router = express.Router();
const db = require('../db');
const mailer = require('../mailer');

router.get('/', function(req, res, next) {
  res.render('index');
});

// Add a route to create a new poll
router.post('/polls', async function(req, res, next) {
  try {
    const { creatorEmail, choices } = req.body;

    // Insert the poll into the database and get the ID
    const { rows: [{ id }] } = await db.query(
      'INSERT INTO polls (creator_email) VALUES ($1) RETURNING id',
      [creatorEmail]
    );

    // Insert the choices into the database
    await Promise.all(choices.map(({ title, description }) =>
      db.query(
        'INSERT INTO choices (poll_id, title, description) VALUES ($1, $2, $3)',
        [id, title, description]
      )
    ));

    // Generate submission and admin links
    const submissionLink = `${req.protocol}://${req.get('host')}/polls/${id}`;
    const adminLink = `${req.protocol}://${req.get('host')}/polls/${id}/admin`;

    // Send email to the creator with the links
    await mailer.sendPollCreatedEmail(creatorEmail, submissionLink, adminLink);

    res.status(201).json({ submissionLink, adminLink });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.get('/polls/:id', async function(req, res, next) {
  try {
    const { rows: [{ choices }] } = await db.query(
      'SELECT json_agg(choices) FROM choices WHERE poll_id = $1',
      [req.params.id]
    );
    res.render('poll', { choices, pollId: req.params.id });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post('/polls/:id/submissions', async function(req, res, next) {
  try {
    const { pollId } = req.params;
    const { name, rankings } = req.body;

    // Insert the submission into the database
    const { rows: [{ id }] } = await db.query(
      'INSERT INTO submissions (poll_id, name, rankings) VALUES ($1, $2, $3) RETURNING id',
      [pollId, name, rankings]
    );

    // Get the creator email
    const { rows: [{ creator_email }] } = await db.query(
      'SELECT creator_email FROM polls WHERE id = $1',
      [pollId]
    );

    // Generate admin link and result link
    const adminLink = `${req.protocol}://${req.get('host')}/polls/${pollId}/admin`;
    const resultLink = `${req.protocol}://${req.get('host')}/polls/${pollId}/result`;

    // Send email to the creator with the links
    await mailer.sendSubmissionReceivedEmail(creator_email, adminLink, resultLink);

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.get('/polls/:id/admin', async function(req, res, next) {
  try {
    // Get the poll details from the database
    const pollId = req.params.id;
    const { rows: [poll] } = await db.query(
      'SELECT * FROM polls WHERE id = $1', [pollId]
    );

    // Make sure the poll exists
    if (!poll) {
      return res.status(404).send('Poll not found');
    }

    // Make sure the request is coming from the creator's email address
    const creatorEmail = poll.creator_email;
    if (req.query.email !== creatorEmail) {
      return res.status(403).send('Access denied');
    }

    // Get the poll choices and submissions from the database
    const { rows: [{ choices, submissions }] } = await db.query(
      'SELECT ' +
      '  json_agg(choices) as choices, ' +
      '  json_agg(submissions) as submissions ' +
      'FROM choices ' +
      'LEFT JOIN submissions ON choices.id = submissions.choice_id ' +
      'WHERE choices.poll_id = $1 ' +
      'ORDER BY choices.id', [pollId]
    );

    // Compute the poll results using the Borda count method
    const results = {};
    choices.forEach((choice, index) => {
      results[choice.title] = submissions.reduce((score, submission) => {
        const rank = submission.rankings[index];
        return score + (choices.length - rank);
      }, 0);
    });

    // Render the poll results page
    res.render('poll-results', {
      poll,
      choices,
      results,
      adminLink: `${req.protocol}://${req.get('host')}/polls/${pollId}/admin?email=${encodeURIComponent(creatorEmail)}`,
      submissionLink: `${req.protocol}://${req.get('host')}/polls/${pollId}/submit`
    });
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
