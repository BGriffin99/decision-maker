const express = require('express');
const router  = express.Router();
const queries = require('../db/queries/queries');
require('dotenv').config();
const mailgun = require('mailgun-js');
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

router.post('/:id/vote', async function(req, res, next) {
  try {
    const submissionLink = req.params.id;
    const { name, rankings } = req.body;

    const pollId = (await queries.getPollIdBySubmissionLink(submissionLink)).poll_id;
    await queries.addSubmission(pollId, rankings, name);

    const submission = await queries.getSubmissionEmail(pollId);

    // Send email to poll creator with submission update notification
    const emailData = {
      from: 'Pollarizing App <pollarizing@example.com>',
      to: submission.email,
      subject: 'New submission for your poll',
      text: `Someone has submitted their rankings for your poll "${submission.title}"!\n
Here's your admin link for the poll to view the results:\nhttp://localhost:8080/polls/${submission.user_link}/results\n
Here's the voting link for the poll if you'd like to share with more friends:\nhttp://localhost:8080/polls/${submission.submission_link}\n`
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

module.exports = router;
