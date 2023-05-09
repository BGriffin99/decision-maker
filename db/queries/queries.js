require('dotenv').config({path: '../../.env'});
const db = require('../connection');

const addUser = (email) => {
  return db.query(`
  INSERT INTO users (email)
  VALUES ($1)
  RETURNING id;`,
  [email]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to add user: ${err.message}`);
    });
};

const addPoll = (user_id, title) => {
  return db.query(`
  INSERT INTO polls (user_id, title)
  VALUES ($1, $2)
  RETURNING id;`,
  [user_id, title]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to add poll: ${err.message}`);
    });
};

const addChoice = (poll_id, choice, description) => {
  return db.query(`
  INSERT INTO choices (poll_id, choice, description)
  VALUES ($1, $2, $3);`,
  [poll_id, choice, description]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to add choice: ${err.message}`);
    });
};

const addSubmission = (poll_id, choices_rank, name) => {
  return db.query(`
  INSERT INTO submissions (poll_id, choices_rank, name)
  VALUES ($1, $2, $3);`,
  [poll_id, choices_rank, name]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to add submission: ${err.message}`);
    });
};

const getPollTitle = pollId => {
  return db.query(`
  SELECT title
  FROM polls
  WHERE polls.id = $1;`,
  [pollId]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to get poll: ${err.message}`);
    });
};

const getPollForVoting = submissionLink => {
  return db.query(`
  SELECT polls.id,
    polls.title,
    choices.id AS choice_id,
    choices.title AS choice_title,
    choices.description AS choice_description
  FROM polls
    JOIN choices ON polls.id = choices.poll_id
  WHERE polls.submission_link = $1;`,
  [submissionLink]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to get poll: ${err.message}`);
    });
};

const getPollByUserLink = userLink => {
  return db.query(`
  SELECT polls.id,
    polls.title,
    choices.id AS choice_id,
    choices.title AS choice_title,
    choices.description AS choice_description
  FROM polls
    JOIN choices ON polls.id = choices.poll_id
  WHERE polls.submission_link = $1;`,
  [userLink]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to get poll: ${err.message}`);
    });
};

const getChoiceCount = pollId => {
  return db.query(`
  SELECT COUNT(id)
  FROM choices
  WHERE poll_id = $1;`,
  [pollId]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to get choice count: ${err.message}`);
    });
};

const getPollResults = pollId => {
  const choiceCount = getChoiceCount(pollId);
  let queryString = `
    SELECT choices.choice,
      choices.description,
      SUM(
        CASE`;
  for (let i = 0; i < choiceCount; i++) { // loop through choices, apply weighting, and append to the query string
    queryString += `
          WHEN submissions.choices_rank [${i + 1}] = choices.id THEN ${choiceCount - i}`;
  }
  queryString += `
          ELSE 0
        END
      ) AS score
    FROM choices
      JOIN polls ON polls.id = choices.poll_id
      JOIN submissions ON submissions.poll_id = polls.id
    GROUP BY choices.id
    ORDER BY score DESC;`;
  const values = [pollId];
  return db.query(queryString, values)
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to get results: ${err.message}`);
    });
};

const getUser = pollId => {
  return db.query(`
  SELECT email
  FROM users
    JOIN polls ON users.id = polls.user_id
  WHERE polls.id = $1;`,
  [pollId]
  )
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to get user: ${err.message}`);
    });
};

module.exports = {
  addUser,
  addPoll,
  addChoice,
  addSubmission,
  getPollTitle,
  getPollForVoting,
  getPollByUserLink,
  getChoiceCount,
  getPollResults,
  getUser
};
