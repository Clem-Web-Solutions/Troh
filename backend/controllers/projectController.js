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
            projectManagerId: projectManagerId || req.user.id,
            status: 'Etude',
        });

        // Créer les phases structurées par défaut
        const defaultPhases = [
            {
                name: 'Études et conception',
                category: 'Phase 1',
                order: 1,
                subtasks: [
                    { name: 'Esquisse', completed: false },
                    { name: 'APS (Avant-Projet Sommaire)', completed: false },
                    { name: 'APD (Avant-Projet Définitif)', completed: false },
                    { name: 'Dossier administratif', completed: false }
                ]
            },
            {
                name: 'Préparation travaux',
                category: 'Phase 2',
                order: 2,
                subtasks: [
                    { name: 'DCE (Dossier de Consultation des Entreprises)', completed: false },
                    { name: 'Consultation entreprises', completed: false },
                    { name: 'Planning prévisionnel', completed: false }
                ]
            },
            {
                name: 'Réalisation',
                category: 'Phase 3',
                order: 3,
                subtasks: [
                    { name: 'Démarrage chantier', completed: false },
                    { name: 'Avancement par lots', completed: false },
                    { name: 'Jalons clés', completed: false }
                ]
            },
            {
                name: 'Livraison',
                category: 'Phase 4',
                order: 4,
                subtasks: [
                    { name: 'Réception', completed: false },
                    { name: 'Levée de réserves', completed: false },
                    { name: 'DOE (Dossier des Ouvrages Exécutés)', completed: false }
                ]
            }
        ];

        for (const phaseData of defaultPhases) {
            await Phase.create({
                projectId: project.id,
                name: phaseData.name,
                category: phaseData.category,
                order: phaseData.order,
                subtasks: phaseData.subtasks,
                status: 'pending'
            });
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
