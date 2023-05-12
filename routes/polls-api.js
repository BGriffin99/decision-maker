/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into /users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

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

  // Add a route to create a new poll
router.post('/polls', async function(req, res) {
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



  module.exports = router;