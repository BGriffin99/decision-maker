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
    const choiceDescription = req.body.choicedescription;
    for (let i = 0; i < choices.length; i++) {
      if (choices[i] !== "") {
        await queries.addChoice(pollID, choices[i], choiceDescription[i]);
      }
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
