const express = require('express');
const router  = express.Router();
const queries = require('../db/queries/queries');

router.post('/:id/submissions', async function(req, res, next) {
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
      const adminLink = `${req.protocol}://${req.get('host')}/polls/${pollId}/results`;
      const voteLink = `${req.protocol}://${req.get('host')}/polls/${pollId}/vote`;

      // Send email to the creator with the links
      await mailer.sendSubmissionReceivedEmail(creator_email, adminLink, voteLink);

      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

// Add a route to create a new poll
// router.post('/', async function(req, res) {
//   try {
//     const { creatorEmail, choices } = req.body;

//     // Insert the poll into the database and get the ID
//     const { rows: [{ id }] } = await db.query(
//       'INSERT INTO polls (creator_email) VALUES ($1) RETURNING id',
//       [creatorEmail]
//     );

//     // Insert the choices into the database
//     await Promise.all(choices.map(({ title, description }) =>
//       db.query(
//         'INSERT INTO choices (poll_id, title, description) VALUES ($1, $2, $3)',
//         [id, title, description]
//       )
//     ));

//     // Generate submission and admin links
//     const submissionLink = `${req.protocol}://${req.get('host')}/polls/${id}`;
//     const adminLink = `${req.protocol}://${req.get('host')}/polls/${id}/admin`;

//     // Send email to the creator with the links
//     await mailer.sendPollCreatedEmail(creatorEmail, submissionLink, adminLink);

//     res.status(201).json({ submissionLink, adminLink });
//   } catch (err) {
//     console.error(err);
//     res.sendStatus(500);
//   }
// });

// vote link
router.get('/:id', async function(req, res, next) {
  try {
    const { rows: [{ choices }] } = await db.query(
      'SELECT json_agg(choices) FROM choices WHERE poll_id = $1',
      [req.params.id]
    );
    res.render('show-poll', { choices, pollId: req.params.id });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// admin link
router.get('/:id/results', async function(req, res, next) {
  try {
    const userLink = req.params.id;
    const poll = await queries.getPollByUserLink(userLink);
    console.log(poll);
    let templateVars = {
      pollID: poll[0].poll_id,
      title: poll[0].title,
      choiceID: poll[0].choice_id,
      choice: poll[0].choice_title,
      choiceDescription: poll[0].choice_description
    };
    console.log(templateVars);
    res.render('result-poll', templateVars);
  } catch (error) {
    next(error);
  }
});

/*
router.get('/:id/results', async function(req, res, next) {
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
*/

module.exports = router;