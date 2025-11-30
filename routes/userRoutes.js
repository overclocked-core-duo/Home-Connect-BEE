// userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserById } = require('../services/userService');

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = getUserById(id);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;
