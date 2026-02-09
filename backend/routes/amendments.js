const express = require('express');
const router = express.Router();
const { Amendment } = require('../models');

router.post('/', async (req, res) => {
    try {
        const { project_id, title, description, amount_added } = req.body;
        const amendment = await Amendment.create({
            project_id, // Ensure this matches Project PK type
            title,
            description,
            amount_added,
            status: 'draft'
        });
        res.json(amendment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating amendment' });
    }
});

router.put('/:id/validate', async (req, res) => {
    try {
        const { validated_by } = req.body;
        const amendmentId = req.params.id;

        const amendment = await Amendment.findByPk(amendmentId);
        if (!amendment) return res.status(404).json({ error: 'Amendment not found' });

        amendment.status = 'approved';
        // amendment.validated_by = validated_by;
        // amendment.approved_at = new Date();
        await amendment.save();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error validating amendment' });
    }
});

module.exports = router;
