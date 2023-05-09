/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into /users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {
	router.post('/', (req, res) => {
		let email = req.body.$email;
		knex.select('email')
			.from('users')
			.where('email', email)
			.then((rows) => {
				// console.log(rows)
				if (rows.length === 0) {
					knex('users')
					.returning('email')
					.insert({email: email})
					.then((newId) => {
						console.log(newId);
						req.session.id = newId[0];
						res.send("done");
					});
				} else {
					console.log("already exists");
					// console.log(rows[0].id)
					req.session.id = rows[0].id;
					// console.log(req.session.id)
					res.send("done");
				}

			})
			.catch((err) => {
				console.log(err)
			})
		})

	return router;
}