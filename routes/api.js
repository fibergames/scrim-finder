const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Use Express middleware to parse JSON requests
router.use('/posts', express.json());

router.route('/posts')
	.get(async (req, res) => {
		// Get encoded query string from URL
		const query = req.query.filters;

		// Decode and parse query as JSON
		let filters = null;
		if (query) {
			try {
				filters = JSON.parse(decodeURIComponent(query));
			} catch (e) {
				if (e instanceof SyntaxError) {
					res.status(400).send("Bad filters parameter");
				} else {
					res.status(500).send("Could not retrieve posts: " + e.message);
				}
			}
		}

		// Get posts that match filters from database
		const posts = await db.getPosts(filters);
		res.send(posts);
	})
	.post(async (req, res) => {
		try {
			await db.createPost(req.body);
		} catch (e) {
			res.status(500).send("Could not create post: " + e.message);
		}
		res.sendStatus(200);
	});

router.route('/posts/:postId')
	.get(async (req, res) => {
		let post;
		try {
			post = await db.getPost(req.params.postId);
		} catch (e) {
			res.status(500).send("Could not retrieve post: " + e.message);
		}
		if (!post) {
			res.sendStatus(404);
		} else {
			res.status(200).send(post);
		}
	})
	.post(async (req, res) => {
		try {
			await db.sendReply(req.body, req.params.postId);
		} catch (e) {
			if (e.name === 'ArgumentError') {
				res.status(400).send(e.message);
			} else {
				res.status(500).send("Could not create reply: " + e.message);
			}
		}
		res.sendStatus(200);
	});

router.route('/users')
	.get(async (req, res) => {
		let users;
		try {
			users = await db.getUsers();
		} catch (e) {
			res.status(500).send("Could not get users: " + e.message);
		}
		res.status(200).send(users);
	})
	.post(async (req, res) => {
		let { name } = req.params;
		try {
			await db.createUser(name)
		} catch (e) {
			res.status(500).send("Could not create user: " + e.message);
		}
		res.sendStatus(200);
	});

module.exports = router;