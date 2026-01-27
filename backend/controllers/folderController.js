const { Folder, Document } = require('../models');

exports.createFolder = async (req, res) => {
    try {
        const { projectId, name, date, type } = req.body; // type: 'DOCUMENTS' or 'PHOTOS'

        if (!projectId || !name) {
            return res.status(400).json({ message: 'ProjectId et Name sont requis' });
        }

        const folder = await Folder.create({
            projectId,
            name,
            date: date || new Date(),
            type: type || 'DOCUMENTS'
        });

        res.status(201).json(folder);
    } catch (error) {
        console.error("Create Folder Error:", error);
        res.status(500).json({ message: 'Erreur lors de la création du dossier' });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type } = req.query; // Optional filter by type

        const whereClause = { projectId };
        if (type) {
            whereClause.type = type;
        }

        const folders = await Folder.findAll({
            where: whereClause,
            include: [{ model: Document, as: 'documents' }],
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json(folders);
    } catch (error) {
        console.error("Get Folders Error:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des dossiers' });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        // Optionally check if empty or delete cascade?
        // Standard cascade delete usually handles it if defined in DB, but Sequelize logic is safer.
        // For now, simple delete. Documents will have null folderId or be deleted depending on schema options (defaults to SET NULL usually unless cascade is set).
        // Let's just delete the folder.

        await Folder.destroy({ where: { id } });
        res.json({ message: 'Dossier supprimé' });
    } catch (error) {
        console.error("Delete Folder Error:", error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
};
