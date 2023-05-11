const express = require("express");
const router = express.Router();
const queries = require("../db/queries/queries");

router.get("/", (req, res) => {
  res.render("create-poll");
});

router.post("/", async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    await queries.addUser(email, name);

    const userId = (await queries.getUserID(email, name)).id;
    const title = req.body.title;
    await queries.addPoll(userId, title);

    const pollId = (await queries.getPollID(userId, title)).id;
    const choices = req.body.choice;
    const choiceDescription = req.body.choicedescription;
    for (let i = 0; i < choices.length; i++) {
      if (choices[i] !== "") {
        await queries.addChoice(pollId, choices[i], choiceDescription[i]);
      }
    }

    const userLink = (await queries.getPollLinks(pollId)).user_link;
    const submissionLink = (await queries.getPollLinks(pollId)).submission_link;
    res.render('share-poll', { title, name, email, userLink, submissionLink });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// router.post("/", async (req, res, next) => {
//   try {
//     const { id: pollId } = req.params;
//     const email = req.body.email;
//     const name = req.body.name;
//     const { rows: [{ id }] } = await queries.addUser(email, name);
//     console.log(id);

//     // const userID = (await queries.getUserID(email, name)).id;
//     const title = req.body.title;
//     await queries.addPoll(userID, title);

//     const pollID = (await queries.getPollID(userID, title)).id;
//     const choices = req.body.choice;
//     const choiceDescription = req.body.choicedescription;
//     for (let i = 0; i < choices.length; i++) {
//       if (choices[i] !== "") {
//         await queries.addChoice(pollID, choices[i], choiceDescription[i]);
//       }
//     }

//     const adminLink = (await queries.getPollLinks(pollId)).user_link;
//     res.redirect(`/polls/${adminLink}/results`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal server error");
//   }
// });

module.exports = router;
