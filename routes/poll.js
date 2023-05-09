const mailgunConfig = require('./config');
const express = require('express');
const router  = express.Router();
const mailgun = require('mailgun-js')({apiKey: mailgunConfig.api_key, domain: mailgunConfig.domain});
const uuidv4 = require('uuidv4');

module.exports = (knex) => {
  // Submit new poll to db
  router.post("/", (req, res) => {
    let question = req.body.question;
    let options = req.body.options;
    let option_info = req.body.info;
    let user_id = req.session.id;
    let poll_id = uuidv4();
    knex('polls')
    .returning('id')
    .insert({id: poll_id, question: question, type: 1, creator_id: user_id})
    .then(function(newId) {
      poll_id = newId;
      options.forEach((option, index) => {
        knex('options')
        .insert({description:option, poll_id: newId[0], info: option_info[index]})
        .finally();
      })
    })
    .then(() => {
      getEmailFromPollId(poll_id[0]).then((email) => {
        console.log(email)
          getNameFromUserId(user_id).then((name) => {
            console.log(email)
          var data = {
            from: 'finest-devs@hotmail.com',
            to: email[0].email,
            subject: `Links to your latest poll titled: ${question}`,
            text: `Hi ${name[0].name}! \n
  Here's your administrative link: localhost:8080/polls/${poll_id[0]}/admin \n
  Here's the link to send to your voters: localhost:8080/polls/${poll_id[0]} \n\n
  Brought to you by the finest devs at Finest Devs Corp`
        };
        mailgun.messages().send(data, function (error, body) {
          console.log(body);
          })
        })
    })
      res.send(poll_id);
    });
  });

// Render poll admin page
  router.get("/:poll_id/admin", (req, res) => {
    const userId = req.session.id;
    const pollId = req.params.poll_id;
    let descriptions = [];
    let data = {};
    let scores = [];
    let question = "";
    isCreator(userId, pollId).then((creator) => {
      if (creator) {
        getOptionsByPollId(pollId).then((options) => {
          // get descriptions
          options.forEach((element) => {
            descriptions.push(element.description);
          });
          // get poll question
          question = options[0].question
        })
        .then(() => {
          getRanksByPollId(pollId).then((result) => {
            // count scores
            result.forEach((element) => {
              if (data[element.description]) {
                data[element.description] += element.rank;
              } else {
                data[element.description] = element.rank;
              }
            });

            //Get scores from data and push to data array

            descriptions.forEach((description) => {
                scores.push(data[description]);
            });

            // vars to use um EJS template
            const templatedVars = {
              descriptions,
              scores,
              question,
              pollId
            };

            res.render("admin_poll", templatedVars);
          });
        })
      } else {
        res.send("You don't have permission to acess this page");
      }
    });


  });

  // send email from admin page to admin
  router.post('/:poll_id/admin', (req, res) => {
    let question = req.body.question;
    let descriptionsOptions = req.body.descriptionsOptions
    let pollId = req.body.pollId
    console.log(pollId)
    let emailMsg = "";
    for (let option in descriptionsOptions) {
      emailMsg += "\n" + option + ": " + descriptionsOptions[option] + " points" + "\n"
    }
    getEmailFromPollId(pollId).then((email) => {
      getNameFromEmail(email[0].email).then((name) => {
        var data = {
          from: 'finest-devs@hotmail.com',
          to: email[0].email,
          subject: `Results to your question: ${question}`,
          text: `Hi ${name[0].name}! \n
The votes are in, here are the final scores to your question: ${question} \n
${emailMsg} \n\n
Brought to you by the finest devs at Finest Devs Corp`
        };
        mailgun.messages().send(data, function (error, body) {
          console.log(body);
        });
      })
    })
  })

  // New poll
  router.get("/new", (req, res) => {
    res.render("new_poll");
  });

  // Render participant page
  router.get("/:poll_id", (req, res) => {

    const pollId = req.params.poll_id;

    // Get polls.question and options for that poll
    knex.select('polls.question', 'options.description', 'options.id', 'options.info')
    .from('polls')
    .innerJoin('options', 'polls.id', 'options.poll_id')
    .where('polls.id', pollId)
    .then((result) => {
      let options = [];
      let question = "";

      question = result[0].question;
      result.forEach((element) => {
        let option = {
          id: element.id,
          description: element.description,
          info: element.info
        }
        options.push(option);
      });

      const templatedVars = {
        id: pollId,
        question,
        options
      }
      console.log(templatedVars);
      res.render("voting-poll", templatedVars);
    });

  });

  // Submit participant choices
  router.post("/:poll_id", (req, res) => {
    // Set ranks for each option
    const userId = req.session.id;
    const pollId = req.params.poll_id;
    console.log("poll id", pollId)
    console.log("params", req.params)
    const {options} = req.body;
    const ranks = [];

    for (let i = options.length; i >= 1; i--) {
      ranks.push(i);
    }
    getEmailFromPollId(pollId).then((email) => {
      getNameFromUserId(userId).then((name) => {
        getNameFromEmail(email[0].email).then((nameCreator) => {
          getQuestionByPollId(pollId).then((question) => {
            console.log("email", email[0].email)
            var data = {
              from: 'finest-devs@hotmail.com',
              to: email[0].email,
              subject: `Results to your question: ${question[0].question}`,
              text: `Hi ${nameCreator[0].name}! \n
  ${name[0].name} has voted on your question: ${question[0].question} \n
  You can revist your poll from the following links: \n
  Here's your administrative link: localhost:8080/polls/${pollId}/admin \n
  Here's the link to send to your voters: localhost:8080/polls/${pollId}  \n\n
  Brought to you by the finest devs at Finest Devs Corp`
            };
            mailgun.messages().send(data, function (error, body) {
              console.log(body);
            });
          })
        })        
      })
    })
    // Sent user choices to database
    ranks.forEach((rank, i) => {
      knex('users_choices')
      .insert({user_id: userId, option_id: options[i].id, rank: rank})
      .then(() => {

        console.log("sucessfully inserted to users_choices");
      });
    });


    res.send('<p style="font-family: Helvetica; font-size: 6vw;">Thank you for voting</p><img src="/images/qsmile.png" width="30%">');
  });

  // returns if the poll belongs to user
  function isCreator(userId, pollId) {
    return new Promise((resolve, reject) => {
      knex.select('creator_id')
        .from('polls')
        .where({'id': pollId})
        .then((result) => {
          if (result[0].creator_id === userId) {
            resolve(true);
          } else {
            resolve(false);
          }
          reject();
        });
    });
  }
  // get question from poll id
  function getQuestionByPollId (pollId) {
    return new Promise((resolve, reject) => {
      knex.select('question')
        .from('polls')
        .where('id', pollId)
        .then((result) => {
          resolve(result);
        })
    })
  }
  //returns number of options of a poll
  function getOptionsByPollId (pollId) {
    return new Promise((resolve, reject) => {
      knex.select('options.description', 'polls.question')
        .from('options')
        .where('poll_id', pollId)
        .innerJoin('polls', 'polls.id', 'options.poll_id')
        .then((result) => {
          resolve(result)
        });
    })
  }
  //returns array of descriptions from options
  function getRanksByPollId (pollId) {
    return new Promise((resolve, reject) => {
      knex.select('options.description', 'users_choices.rank')
        .from('options')
        .innerJoin('users_choices', 'options.id', 'users_choices.option_id')
        .innerJoin('polls', 'polls.id', 'options.poll_id')
        .where('polls.id', pollId)
        .then((result) => {
          resolve(result);
      });
    });
  }
  // returns email from users by matching pollId
  function getEmailFromPollId (pollId) {
    return new Promise((resolve, reject) => {
      knex.select('users.email')
      .from('users')
      .innerJoin('polls', 'polls.creator_id', 'users.id')
      .where('polls.id', pollId)
      .then((result) => {
        resolve(result);
      });
    });
  }
  // returns name from users matching user id
  function getNameFromUserId (userId) {
    return new Promise((resolve, reject) => {
      knex.select('name')
        .from('users')
        .where('id', userId)
        .then((result) => {
          resolve(result);
        })
    })
  }
  // returns name from users matching email
  function getNameFromEmail (email) {
    return new Promise((resolve, reject) => {
      knex.select('name')
        .from('users')
        .where('email', email)
        .then((result) => {
          resolve(result);
        })
    })
  }

  return router;
}
