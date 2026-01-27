const { Phase, Project, Activity } = require('../models');

// Get all phases for a project
exports.getPhases = async (req, res) => {
    try {
        const { projectId } = req.params;
        const phases = await Phase.findAll({
            where: { projectId },
            order: [['order', 'ASC'], ['id', 'ASC']]
        });
        res.json(phases);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching phases', error: error.message });
    }
};

// Create a new phase
exports.createPhase = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name } = req.body;

        const phase = await Phase.create({
            projectId,
            name,
            status: 'Pending', // Default
            startDate: new Date(),
        });

        res.status(201).json(phase);
    } catch (error) {
        res.status(500).json({ message: 'Error creating phase', error: error.message });
    }
};

// Update a phase (toggle status)
exports.updatePhase = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expect 'Completed' or 'Pending'

        const phase = await Phase.findByPk(id);
        if (!phase) {
            return res.status(404).json({ message: 'Phase not found' });
        }

        phase.status = status || phase.status;

        // Allow manual date updates for planning
        if (req.body.startDate) phase.startDate = req.body.startDate;
        if (req.body.endDate) phase.endDate = req.body.endDate;

        // Auto-set endDate on completion if not manually provided/already set
        if (status === 'Completed' && !phase.endDate) {
            phase.endDate = new Date();
        } else if (status === 'Pending' && !req.body.endDate) {
            phase.endDate = null;
        }

        if (req.body.order !== undefined) {
            phase.order = req.body.order;
        }

        if (req.body.description !== undefined) {
            phase.description = req.body.description;
        }

        if (req.body.subtasks !== undefined) {
            phase.subtasks = req.body.subtasks;
        }

        await phase.save();

        // Recalculate Project Progress
        const allPhases = await Phase.findAll({ where: { projectId: phase.projectId } });
        const totalPhases = allPhases.length;
        const completedPhases = allPhases.filter(p => p.status === 'Completed').length;
        const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

        // Determine Project Status
        let projectStatus = 'Etude';
        if (progress > 0 && progress < 100) projectStatus = 'Chantier';
        if (progress === 100) projectStatus = 'Completed'; // Or 'Livré'

        await Project.update(
            { progress, status: projectStatus },
            { where: { id: phase.projectId } }
        );

        if (status === 'Completed') {
            await Activity.create({
                type: 'PHASE_COMPLETED',
                description: `Étape terminée: ${phase.name} (${progress}%)`,
                projectId: phase.projectId,
                userId: req.user.id
            });
        }

        res.json({ ...phase.toJSON(), progress, projectStatus }); // Return updated info if needed
    } catch (error) {
        res.status(500).json({ message: 'Error updating phase', error: error.message });
    }
};

// Delete a phase
exports.deletePhase = async (req, res) => {
    try {
        const { id } = req.params;
        const phase = await Phase.findByPk(id);

        if (!phase) {
            return res.status(404).json({ message: 'Phase not found' });
        }

        await phase.destroy();
        res.json({ message: 'Phase deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting phase', error: error.message });
    }
};
