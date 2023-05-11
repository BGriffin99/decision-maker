const express = require('express');
const router  = express.Router();
const queries = require('../db/queries/queries');

router.post('/:id/vote', async function(req, res, next) {
  try {
    const submissionLink = req.params.id;
    const { name, rankings } = req.body;

    const pollId = (await queries.getPollIdBySubmissionLink(submissionLink)).poll_id;
    await queries.addSubmission(pollId, rankings, name);

    // const { rows: [{ creator_email }] } = await db.query(
    //   'SELECT creator_email FROM polls WHERE id = $1',
    //   [pollId]
    // );

    const adminLink = (await queries.getPollLinks(pollId)).user_link;
    res.redirect(`/polls/${adminLink}/results`);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    const submissionLink = req.params.id;
    const poll = await queries.getPollBySubmissionLink(submissionLink);
    res.render('show-poll', { submissionLink: submissionLink, title: poll[0].title, poll: poll });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.get('/:id/results', async function(req, res, next) {
  try {
    const userLink = req.params.id;
    const poll = await queries.getPollResults(userLink);
    const title = (await queries.getPollTitleByUserLink(userLink)).title;
    res.render('result-poll', { title, poll });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// router.post('/:id/vote', async function(req, res, next) {
//   try {
//     const userLink = req.params.id;
//     const poll = await queries.getPollByUserLink(userLink);
//     const choice = req.body.choice;
//     const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     const existingVote = await queries.getVoteByIpAddressAndPollId(ipAddress, poll.id);

//     if (existingVote) {
//       throw new Error('You have already voted on this poll');
//     }

//     const vote = await queries.createVote(poll.id, choice, ipAddress);

//     res.redirect(`/polls/${userLink}/results`);
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });


// Add a route to create a new poll
// router.post('/', async function(req, res) {
// try {
// const { creatorEmail, choices } = req.body;

// // Insert the poll into the database and get the ID
// const { rows: [{ id }] } = await db.query(
// 'INSERT INTO polls (creator_email) VALUES ($1) RETURNING id',
// [creatorEmail]
// );

// // Insert the choices into the database
// await Promise.all(choices.map(({ title, description }) =>
// db.query(
// 'INSERT INTO choices (poll_id, title, description) VALUES ($1, $2, $3)',
// [id, title, description]
// )
// ));

// // Generate submission and admin links
// const submissionLink = ${req.protocol}://${req.get('host')}/polls/${id};
// const adminLink = ${req.protocol}://${req.get('host')}/polls/${id}/admin;

// // Send email to the creator with the links
// // await mailer.sendPollCreatedEmail(creatorEmail, submissionLink, adminLink);

// res.status(201).json({ submissionLink, adminLink });
// } catch (err) {
// console.error(err);
// res.sendStatus(500);
// }
// });
module.exports = router;
