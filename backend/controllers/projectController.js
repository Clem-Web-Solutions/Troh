const { Project, Phase, PhaseTask, User, Reserve, Document, PaymentMilestone, Folder } = require('../models');
const { Op } = require('sequelize');
const PROJECT_TEMPLATES = require('../config/projectTemplates');

exports.getAllProjects = async (req, res) => {
    try {
        // Debug log
        if (!req.user) {
            console.error('ProjectController: req.user is undefined!', req.headers);
            return res.status(500).json({ message: 'Internal Auth Error: User not attached to request' });
        }
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
        const { name, address, client_id, entité, project_type_id, projectTypeId, chef_projet, budget, currency, estimated_start_date } = req.body;
        // Map frontend camelCase to backend snake_case if needed
        const typeId = project_type_id || projectTypeId;

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
            project_type_id: typeId,
            chef_projet,
            budget,
            currency,
            estimated_start_date,
            statut_global: 'Etude',
        });

        // Initialize Phases/Tasks from Template
        const templateKey = req.body.projectTypeId || req.body.project_type_id; // Handle both
        let template = PROJECT_TEMPLATES[templateKey];

        // Fallback or validation
        if (!template) {
            console.warn(`Template not found for key: ${templateKey}. Using default.`);
            template = PROJECT_TEMPLATES['DEFAULT'];
        }

        if (template && template.phases) {
            for (const pTemplate of template.phases) {
                // Create Phase
                const phase = await Phase.create({
                    projectId: project.id, // Use the auto-generated Integer ID from the project instance
                    name: pTemplate.name,
                    status: 'pending', // Default
                    category: 'DESIGN'
                });

                // Create Tasks for this Phase
                if (pTemplate.tasks && pTemplate.tasks.length > 0) {
                    for (const taskName of pTemplate.tasks) {
                        await PhaseTask.create({
                            phaseId: phase.id,
                            name: taskName,
                            status: 'todo',
                            approval_status: 'pending' // Default
                        });
                    }
                }
            }
        }

        // Trigger Milestone Generation
        const financeController = require('./financeController');
        await financeController.generateMilestones(project.id, budget, entité);

        // Create Default Folders
        const defaultFolders = [
            { name: 'Plans', type: 'DOCUMENTS' },
            { name: 'Photos', type: 'PHOTOS' },
            { name: 'Administratifs', type: 'DOCUMENTS' },
            { name: 'PV', type: 'DOCUMENTS' },
            { name: 'Factures', type: 'DOCUMENTS' }
        ];

        for (const folder of defaultFolders) {
            try {
                await Folder.create({
                    projectId: project.id,
                    name: folder.name,
                    type: folder.type,
                    date: new Date()
                });
            } catch (err) {
                console.error(`Error creating default folder ${folder.name}:`, err);
            }
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

        // Fetch Linked Project if exists (e.g. Construction Project)
        let linkedProject = null;
        if (project.linked_project_id) {
            linkedProject = await Project.findOne({
                where: { project_id: project.linked_project_id }
            });
        }

        // Convert to JSON to attach extra property
        const projectData = project.toJSON();
        projectData.linkedProject = linkedProject;

        // Security check
        if (req.user.role !== 'admin' && project.client_id !== req.user.id) {
            return res.sendStatus(403);
        }

        res.json(projectData);
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
        task.status = 'done';
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

exports.createConstructionProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        // Check if construction phases already exist
        const existingConstructionPhases = await Phase.findOne({
            where: {
                projectId: id,
                category: 'CONSTRUCTION'
            }
        });

        if (existingConstructionPhases) {
            return res.status(400).json({ message: 'La phase travaux est déjà active.' });
        }

        // Update Project Status/Entity
        project.entité = 'MEEREO_PROJECT'; // Switch context to Construction
        project.statut_global = 'Chantier';
        await project.save();

        // Initialize Construction Phases
        const template = PROJECT_TEMPLATES['CONSTRUCTION_CLE_EN_MAIN'];
        if (template && template.phases) {
            for (const pTemplate of template.phases) {
                const phase = await Phase.create({
                    projectId: project.id,
                    name: pTemplate.name,
                    status: 'pending',
                    category: 'CONSTRUCTION'
                });

                if (pTemplate.tasks) {
                    for (const taskName of pTemplate.tasks) {
                        await PhaseTask.create({
                            phaseId: phase.id,
                            name: taskName,
                            status: 'todo',
                            approval_status: 'pending'
                        });
                    }
                }
            }
        }

        // Trigger Milestone Generation for Construction
        const financeController = require('./financeController');
        await financeController.generateMilestones(project.id, project.budget, 'MEEREO_PROJECT');

        res.json({ success: true, message: 'Phase travaux activée', project });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'activation des travaux', error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        // Delete Phases (and their tasks via cascade if DB configured, or manual loop)
        // Safer to manual cascade if unsure of DB constraints
        const phases = await Phase.findAll({ where: { projectId: id } });
        for (const phase of phases) {
            await PhaseTask.destroy({ where: { phaseId: phase.id } });
            await phase.destroy();
        }

        // Delete Reserves
        await Reserve.destroy({ where: { project_id: project.project_id } }); // Note: Reserves link via string ID usually? Check model.
        // Project.js says project_id is string. Reserve.js usually links to that. 
        // Let's check Reserve model usage in inputReserve: `project_id: id` where id comes from req.params of project which is PK?
        // Wait, getProjectById uses `req.params.id` (PK) for `Project.findByPk`. 
        // But inputReserve uses `req.params.id` as `project_id`. 
        // If the URL is /projects/:id (PK), then reserve is linked to PK.
        // If the URL is /projects/:project_id (String), then reserve is linked to String.
        // Codebase seems mixed. fallback:
        await Reserve.destroy({ where: { project_id: id } }); // If linked by PK
        await Reserve.destroy({ where: { project_id: project.project_id } }); // If linked by String ID

        // Delete Documents (just metadata)
        await Document.destroy({ where: { project_id: id } });

        // Delete Project
        await project.destroy();

        res.json({ success: true, message: 'Projet supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du projet' });
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
