const { Project, Phase, PhaseTask, User, Reserve, Document, PaymentMilestone } = require('../models');
const { Op } = require('sequelize');

exports.getAllProjects = async (req, res) => {
    try {
        const { role, id } = req.user;
        let projects;

        if (role === 'admin') {
            projects = await Project.findAll({
                include: [
                    { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
                    // { model: User, as: 'projectManager', attributes: ['id', 'name', 'email'] } // If we kept this relation
                ]
            });
        } else {
            projects = await Project.findAll({
                where: { client_id: id },
                include: [
                    { model: Phase, as: 'phases' },
                    { model: User, as: 'client', attributes: ['id', 'name', 'email'] }
                ],
                order: [
                    [{ model: Phase, as: 'phases' }, 'date_debut', 'ASC']
                ]
            });
        }

        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des projets' });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, address, client_id, entité, project_type_id, chef_projet } = req.body;

        if (!entité || !client_id) {
            return res.status(400).json({ message: 'Entité et User ID requis' });
        }

        // Generate ID
        // Format: RD-2026-CL012
        // Prefix: RD (Raw Design) or MP (Meereo Project)
        const prefix = entité === 'RAW_DESIGN' ? 'RD' : 'MP';
        const year = new Date().getFullYear();

        // Find last project to increment
        const lastProject = await Project.findOne({
            where: {
                project_id: {
                    [Op.like]: `${prefix}-${year}-%`
                }
            },
            order: [['date_creation', 'DESC']]
        });

        let newSequence = 1;
        if (lastProject) {
            const parts = lastProject.project_id.split('-');
            const lastSeq = parseInt(parts[2].replace('CL', '')); // Assuming CL prefix
            if (!isNaN(lastSeq)) newSequence = lastSeq + 1;
        }

        const projectId = `${prefix}-${year}-CL${String(newSequence).padStart(3, '0')}`;

        const project = await Project.create({
            project_id: projectId,
            name,
            address,
            client_id,
            entité,
            project_type_id,
            chef_projet,
            statut_global: 'Etude',
        });

        // Initialize Phases based on type (Logic to be expanded if needed)
        // For now, we create empty phases or default phases if provided in request or hardcoded mapping?
        // User didn't specify phase creation logic detailedly, but existing code had `defaultPhases`.
        // I will keep a simple default phase creation.

        const defaultPhases = [
            { etape: 'Conception', phase_id_suffix: 'PH-01' },
            { etape: 'Préparation', phase_id_suffix: 'PH-02' },
            { etape: 'Exécution', phase_id_suffix: 'PH-03' }
        ];

        for (const p of defaultPhases) {
            await Phase.create({
                phase_id: `${projectId}-${p.phase_id_suffix}`,
                project_id: projectId,
                etape: p.etape,
                statut: 'pending'
            });
        }

        res.status(201).json({ success: true, project_id: projectId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du projet' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id, {
            include: [
                { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
                { model: Phase, as: 'phases', include: [{ model: PhaseTask, as: 'tasks' }, { model: PaymentMilestone, as: 'milestones' }] },
                { model: Reserve, as: 'reserves' },
                { model: Document, as: 'documents' }
            ]
        });

        if (!project) return res.status(404).json({ message: 'Projet introuvable' });

        // Security check
        if (req.user.role !== 'admin' && project.client_id !== req.user.id) {
            return res.sendStatus(403);
        }

        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.addPhaseTask = async (req, res) => {
    // ...
};

exports.approveTask = async (req, res) => {
    try {
        const { id } = req.params; // project_id (unused here if task_id is unique, but good for verify)
        const { task_id } = req.body;

        const task = await PhaseTask.findByPk(task_id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.approval_status = 'approved';
        task.statut = 'done';
        await task.save();

        res.json({ success: true, task_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error approving task' });
    }
};

exports.inputReserve = async (req, res) => {
    try {
        const { id } = req.params; // project_id
        const { description, severity, photo_url } = req.body;

        const reserveId = `RES-${id}-${Date.now().toString().slice(-4)}`;

        const reserve = await Reserve.create({
            reserve_id: reserveId,
            project_id: id,
            description,
            severity,
            photo_url,
            status: 'open'
        });

        res.json({ success: true, reserve_id: reserveId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating reserve' });
    }
};

exports.getReserves = async (req, res) => {
    try {
        const { id } = req.params;
        const reserves = await Reserve.findAll({ where: { project_id: id } });
        res.json(reserves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching reserves' });
    }
}
