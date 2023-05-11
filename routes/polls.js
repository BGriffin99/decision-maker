const express = require('express');
const router  = express.Router();
const queries = require('../db/queries/queries');
const mailgun = require('mailgun-js');
const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

router.post('/create', async function(req, res, next) {
  try {
    const { title, options, creator_email } = req.body;

    // Insert poll into database and get submission link and user link
    const { submissionLink, userLink } = await queries.createPoll(title, options, creator_email);

    // Send email to poll creator with admin link and submission link
    const emailData = {
      from: 'Poll App <pollapp@example.com>',
      to: creator_email,
      subject: 'Your Poll Links',
      text: `Here's your admin link for the poll: ${userLink}\nHere's the submission link for the poll: ${submissionLink}`
    };

    mg.messages().send(emailData, function (error, body) {
      if (error) {
        console.error(error);
      } else {
        console.log(body);
      }
    });

    res.redirect(`/polls/${submissionLink}`);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

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

router.post('/:id/vote', async function(req, res, next) {
  try {
    const submissionLink = req.params.id;
    const { name, rankings } = req.body;

    const pollId = (await queries.getPollIdBySubmissionLink(submissionLink)).poll_id;
    await queries.addSubmission(pollId, rankings, name);

    const { creator_email, title } = await queries.getPollCreatorEmailAndTitle(pollId);

    // Send email to poll creator with submission update notification
    const emailData = {
      from: 'Poll App <pollapp@example.com>',
      to: creator_email,
      subject: `New submission for your poll "${title}"`,
      text: `Someone has submitted their rankings for your poll. Check the results here: ${process.env.BASE_URL}/polls/${submissionLink}/results`
    };

    mg.messages().send(emailData, function (error, body) {
      if (error) {
        console.error(error);
      } else {
        console.log(body);
      }
    });

    const adminLink = (await queries.getPollLinks(pollId)).user_link;
    res.redirect(`/polls/${adminLink}/results`);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post('/', async function(req, res, next) {
  try {
    const { title, creator_email, choices } = req.body;
    const userLink = generateRandomString(8);
    const submissionLink = generateRandomString(8);

    const poll = await queries.createPoll(title, creator_email, userLink, submissionLink);

    const choicesArray = choices.split('\n').filter(choice => choice !== '');
    await Promise.all(choicesArray.map(choice => queries.createChoice(poll.id, choice)));

    // Send email to poll creator with admin link and submission link
    const emailData = {
      from: 'Poll App <pollapp@example.com>',
      to: creator_email,
      subject: `Your poll "${title}" has been created`,
      text: `Your poll has been created. You can view the results and manage the poll at ${process.env.BASE_URL}/polls/${userLink}/results.\n\nTo submit your rankings for the poll, visit ${process.env.BASE_URL}/polls/${submissionLink}`
    };

    mg.messages().send(emailData, function (error, body) {
      if (error) {
        console.error(error);
      } else {
        console.log(body);
      }
    });

    res.redirect(`/polls/${userLink}/results`);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
module.exports = router;
