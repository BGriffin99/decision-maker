const db = require('../connection');

const addUser = (email, name) => {
  return db.query(`
  INSERT INTO users (email, name)
  VALUES ($1, $2)
  RETURNING id;`,
  [email, name]
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
  VALUES ($1, string_to_array($2, ',')::INTEGER[], $3);`,
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
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get poll: ${err.message}`);
    });
};

const getPollTitleByUserLink = userLink => {
  return db.query(`
  SELECT title
  FROM polls
  WHERE user_link = $1;`,
  [userLink]
  )
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get poll: ${err.message}`);
    });
};

const getPollForVoting = submissionLink => {
  return db.query(`
  SELECT polls.id AS poll_id,
    polls.title AS title,
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

const getPollIdByUserLink = userLink => {
  return db.query(`
  SELECT polls.id AS poll_id
  FROM polls
    JOIN choices ON polls.id = choices.poll_id
  WHERE polls.user_link = $1;`,
  [userLink]
  )
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get poll: ${err.message}`);
    });
};

const getPollIdBySubmissionLink = submissionLink => {
  return db.query(`
  SELECT polls.id AS poll_id
  FROM polls
    JOIN choices ON polls.id = choices.poll_id
  WHERE polls.submission_link = $1;`,
  [submissionLink]
  )
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get poll: ${err.message}`);
    });
};

const getPollBySubmissionLink = submissionLink => {
  return db.query(`
  SELECT polls.id AS poll_id,
    polls.title AS title,
    choices.id AS choice_id,
    choices.choice AS choice_title,
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
  SELECT polls.id AS poll_id,
    polls.title AS title,
    choices.id AS choice_id,
    choices.choice AS choice_title,
    choices.description AS choice_description
  FROM polls
    JOIN choices ON polls.id = choices.poll_id
  WHERE polls.user_link = $1;`,
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
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get choice count: ${err.message}`);
    });
};

const getPollResults = async(userLink) => {
  const pollId = (await getPollIdByUserLink(userLink)).poll_id;
  const choiceCount = (await getChoiceCount(pollId)).count;

  let queryString = `
    SELECT choices.choice AS choice,
      choices.description AS description,
      SUM(
        CASE`;
  for (let i = 0; i < choiceCount; i++) { // loop through choices, apply weighting, and append to the query string
    queryString += `
          WHEN submissions.choices_rank[${i + 1}] = choices.id THEN ${choiceCount - i}`;
  }
  queryString += `
          ELSE 0
        END
      ) AS score,
      ARRAY[`;
  for (let i = 0; i < choiceCount; i++) {
    queryString += `
        SUM(CASE WHEN submissions.choices_rank[${i + 1}] = choices.id THEN 1 ELSE 0 END)`;
    if (i !== choiceCount - 1) {
      queryString += `,`;
    }
  }
  queryString += `
      ] AS vote_counts
    FROM choices
      JOIN polls ON polls.id = choices.poll_id
      JOIN submissions ON submissions.poll_id = polls.id
    WHERE polls.id = $1
    GROUP BY choices.id
    ORDER BY
      score DESC,`;
  for (let i = 0; i < choiceCount; i++) {
    queryString += `
      SUM(CASE WHEN submissions.choices_rank[${i + 1}] = choices.id THEN 1 ELSE 0 END) DESC`;
    if (i !== choiceCount - 1) {
      queryString += `,`;
    }
  }
  queryString += `;`;
  const values = [pollId];
  return db.query(queryString, values)
    .then(res => res.rows)
    .catch(err => {
      throw new Error(`Failed to get results: ${err.message}`);
    });
};

const getPollLinks = pollId => {
  return db.query(`
  SELECT user_link, submission_link
  FROM polls
  WHERE polls.id = $1;`,
  [pollId]
  )
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get user: ${err.message}`);
    });
};

const getUser = pollId => {
  return db.query(`
  SELECT email, name
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

const getUserID = (email, name) => {
  return db.query(`
  SELECT id
  FROM users
  WHERE email = $1
    AND name = $2
  ORDER BY id DESC
  LIMIT 1;`,
  [email, name]
  )
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get user: ${err.message}`);
    });
};

const getPollID = (userID, title) => {
  return db.query(`
  SELECT id
  FROM polls
  WHERE user_id = $1
    AND title = $2
  ORDER BY id DESC
  LIMIT 1;`,
  [userID, title]
  )
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get poll: ${err.message}`);
    });
};

const getSubmissionEmail = (pollId) => {
  return db.query(`
  SELECT users.email AS email,
    users.name AS name,
    polls.title AS title,
    polls.user_link AS user_link,
    polls.submission_link AS submission_link
  FROM users
    JOIN polls ON users.id = polls.user_id
    JOIN submissions ON submissions.poll_id = polls.id
  WHERE polls.id = $1
  ORDER BY submissions.id DESC
  LIMIT 1;`,
  [pollId]
  )
    .then(res => res.rows[0])
    .catch(err => {
      throw new Error(`Failed to get submission info: ${err.message}`);
    });
}

module.exports = {
  addUser,
  addPoll,
  addChoice,
  addSubmission,
  getPollTitle,
  getPollTitleByUserLink,
  getPollForVoting,
  getPollIdBySubmissionLink,
  getPollBySubmissionLink,
  getPollIdByUserLink,
  getPollByUserLink,
  getChoiceCount,
  getPollResults,
  getPollLinks,
  getUser,
  getUserID,
  getPollID,
  getSubmissionEmail
};
