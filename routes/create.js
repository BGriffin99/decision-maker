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

    const userID = (await queries.getUserID(email, name)).id;
    const title = req.body.title;
    await queries.addPoll(userID, title);

    const pollID = (await queries.getPollID(userID, title)).id;
    const choices = req.body.choice;
    let choiceDescription = "";
    for (let choice of choices) {
      await queries.addChoice(pollID, choice, choiceDescription);
    }

    let adminLink = "/polls/";
    adminLink += (await queries.getPollLinks(pollID)).user_link;
    adminLink += "/results";
    res.redirect(adminLink);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
