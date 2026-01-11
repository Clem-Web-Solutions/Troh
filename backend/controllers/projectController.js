const { Project, Phase, User } = require('../models');

exports.getAllProjects = async (req, res) => {
    try {
        const { role, id } = req.user;
        let projects;

        if (role === 'admin') {
            projects = await Project.findAll({
                include: [
                    { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
                    { model: User, as: 'projectManager', attributes: ['id', 'name', 'email'] }
                ]
            });
        } else {
            projects = await Project.findAll({
                where: { clientId: id },
                include: [
                    {
                        model: Phase,
                        as: 'phases',
                    },
                    { model: User, as: 'projectManager', attributes: ['id', 'name', 'email'] }
                ],
                order: [
                    [{ model: Phase, as: 'phases' }, 'order', 'ASC'],
                    [{ model: Phase, as: 'phases' }, 'id', 'ASC']
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
        const { name, address, clientId, budget, projectManagerId } = req.body;

        const project = await Project.create({
            name,
            address,
            clientId,
            projectManagerId: projectManagerId || req.user.id, // Assign selected PM or default to creator
            status: 'Etude',
        });

        // Optionnel: Créer des phases par défaut
        const phases = ['Conception', 'Administratif', 'Travaux', 'Livraison'];
        for (const phaseName of phases) {
            await Phase.create({ projectId: project.id, name: phaseName });
        }

        res.status(201).json(project);
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
                { model: User, as: 'projectManager', attributes: ['id', 'name', 'email'] },
                { model: Phase, as: 'phases' }
            ]
        });

        if (!project) return res.status(404).json({ message: 'Projet introuvable' });

        // Security check for clients
        if (req.user.role !== 'admin' && project.clientId !== req.user.id) {
            return res.sendStatus(403);
        }

        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // status, progress, etc.

        await Project.update(updateData, { where: { id } });
        const updatedProject = await Project.findByPk(id);

        res.json(updatedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id);

        if (!project) return res.status(404).json({ message: 'Projet introuvable' });

        // Security: only admin can delete
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        await project.destroy();
        res.json({ message: 'Projet supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
};
