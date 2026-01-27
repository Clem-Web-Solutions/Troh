const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Phase = require('./Phase');
const Document = require('./Document');
const Folder = require('./Folder');
const Finance = require('./Finance');
const Activity = require('./Activity');
const Transaction = require('./Transaction');

// Associations

// User (Client) <-> Projects
User.hasMany(Project, { foreignKey: 'clientId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Project.belongsTo(User, { foreignKey: 'projectManagerId', as: 'projectManager' });

// Project <-> Phases
Project.hasMany(Phase, { foreignKey: 'projectId', as: 'phases' });
Phase.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project <-> Folders
Project.hasMany(Folder, { foreignKey: 'projectId', as: 'folders' });
Folder.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Folder <-> Documents
Folder.hasMany(Document, { foreignKey: 'folderId', as: 'documents' });
Document.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });

// Project <-> Documents (Direct Documents)
Project.hasMany(Document, { foreignKey: 'projectId', as: 'documents' });
Document.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project <-> Finance
Project.hasOne(Finance, { foreignKey: 'projectId', as: 'finance' });
Finance.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project <-> Transaction
Project.hasMany(Transaction, { foreignKey: 'projectId', as: 'transactions' });
Transaction.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Activity Associations
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Activity.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

module.exports = {
    sequelize,
    User,
    Project,
    Phase,
    Document,
    Folder,
    Finance,
    Activity,
    Transaction,
};
