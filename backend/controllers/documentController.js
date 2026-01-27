const { Document, Activity } = require('../models');

exports.uploadDocument = async (req, res) => {
    try {
        const { projectId, category, folderId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier uploadé' });
        }

        const document = await Document.create({
            projectId,
            folderId: folderId ? parseInt(folderId) : null,
            name: req.file.originalname,
            category,
            url: `/uploads/${req.file.filename}`,
        });

        // Log Activity
        await Activity.create({
            type: 'DOCUMENT_UPLOADED',
            description: `Document ajouté: ${req.file.originalname}`,
            projectId,
            userId: req.user.id
        });

        res.status(201).json(document);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur upload' });
    }
};

exports.getDocumentsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const documents = await Document.findAll({ where: { projectId } });
        res.json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur récupération documents' });
    }
};
