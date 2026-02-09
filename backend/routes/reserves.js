const express = require('express');
const router = express.Router();
const { Reserve } = require('../models');

router.post('/', async (req, res) => {
    try {
        const { project_id, description } = req.body;
        const reserve = await Reserve.create({
            project_id,
            description,
            status: 'open'
        });
        res.json(reserve);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating reserve' });
    }
});

router.put('/:id/resolve', async (req, res) => {
    try {
        const reserveId = req.params.id;
        const reserve = await Reserve.findByPk(reserveId);
        if (!reserve) return res.status(404).json({ error: 'Reserve not found' });

        reserve.status = 'resolved';
        reserve.resolved_date = new Date();
        await reserve.save();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error resolving reserve' });
    }
});

module.exports = router;
