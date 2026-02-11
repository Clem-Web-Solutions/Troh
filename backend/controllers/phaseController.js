const { Phase, Project, Activity, PhaseTask } = require('../models');

// Get all phases for a project
exports.getPhases = async (req, res) => {
    try {
        const { projectId } = req.params;
        const phases = await Phase.findAll({
            where: { projectId },
            include: [{ model: PhaseTask, as: 'tasks' }],
            order: [['order', 'ASC'], ['id', 'ASC'], [{ model: PhaseTask, as: 'tasks' }, 'id', 'ASC']]
        });

        // Format for frontend
        const formattedPhases = phases.map(p => {
            const json = p.toJSON();
            // Map PhaseTasks to subtasks format expected by frontend
            json.subtasks = (json.tasks || []).map(t => ({
                id: t.id,
                name: t.name,
                completed: t.status === 'done',
                notes: t.approval_status === 'rejected' ? 'Rejected' : '' // or store notes elsewhere?
            }));
            delete json.tasks; // Clean up
            return json;
        });

        res.json(formattedPhases);
    } catch (error) {
        console.error(error);
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

        if (status) phase.status = status;

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

        await phase.save();

        // Handle Subtasks Sync
        if (req.body.subtasks && Array.isArray(req.body.subtasks)) {
            const incomingTasks = req.body.subtasks;

            // Get existing tasks for this phase
            const existingTasks = await PhaseTask.findAll({ where: { phaseId: phase.id } });
            const existingTaskIds = new Set(existingTasks.map(t => t.id));
            const incomingTaskIds = new Set(incomingTasks.filter(t => t.id && typeof t.id === 'number').map(t => t.id));

            // Delete tasks not in the incoming list
            for (const existingTask of existingTasks) {
                if (!incomingTaskIds.has(existingTask.id)) {
                    await existingTask.destroy();
                }
            }

            for (const task of incomingTasks) {
                const isNew = typeof task.id === 'string' || task.id > 1000000000000; // Heuristic for Date.now() ID

                if (isNew) {
                    // Create new
                    await PhaseTask.create({
                        phaseId: phase.id,
                        name: task.name,
                        status: task.completed ? 'done' : 'todo'
                    });
                } else {
                    // Update existing
                    const existingTask = await PhaseTask.findByPk(task.id);
                    if (existingTask) {
                        existingTask.name = task.name;
                        existingTask.status = task.completed ? 'done' : 'todo';
                        await existingTask.save();
                    }
                }
            }
        }

        // Recalculate Project Progress based on TASKS
        const allPhases = await Phase.findAll({
            where: { projectId: phase.projectId },
            include: [{ model: PhaseTask, as: 'tasks' }]
        });

        let totalTasks = 0;
        let completedTasks = 0;

        allPhases.forEach(p => {
            if (p.tasks) {
                p.tasks.forEach(t => {
                    totalTasks++;
                    if (t.status === 'done') completedTasks++;
                });
            }
        });

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Determine Project Status (Must match DB ENUM: Etude, Chantier, Livré, Suspendu)
        let projectStatus = 'Etude';
        // If progress started but not finished -> Chantier (In Progress)
        if (progress > 0 && progress < 100) projectStatus = 'Chantier';
        // If finished -> Livré (Delivered/Completed)
        if (progress === 100) projectStatus = 'Livré';

        // Override if "Chantier" is detected via other means? 
        // Keep existing logic if user prefers specific statuses, but "En cours" matches the badge logic.
        // Actually the prompt said "l'état du projet soit évoluer".
        // Let's keep it simple.

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

        // Return updated phase with refreshed tasks
        const updatedPhase = await Phase.findByPk(id, { include: [{ model: PhaseTask, as: 'tasks' }] });
        const json = updatedPhase.toJSON();
        json.subtasks = (json.tasks || []).map(t => ({
            id: t.id,
            name: t.name,
            completed: t.status === 'done',
        }));
        delete json.tasks;

        res.json({ ...json, progress, projectStatus });
    } catch (error) {
        console.error('Error updating phase:', error);
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
