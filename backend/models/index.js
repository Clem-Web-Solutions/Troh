const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Phase = require('./Phase');
const PhaseTask = require('./PhaseTask');
const Document = require('./Document');
const Folder = require('./Folder');
const Finance = require('./Finance');
const Activity = require('./Activity');
const Transaction = require('./Transaction');
const Amendment = require('./Amendment');
const Subcontractor = require('./Subcontractor');
const ProjectSubcontractor = require('./ProjectSubcontractor');
const Reserve = require('./Reserve');
const TimeEntry = require('./TimeEntry');
const BudgetEstimate = require('./BudgetEstimate');
const Notification = require('./Notification');
const PaymentMilestone = require('./PaymentMilestone');

// Associations

// User (Client) <-> Projects
User.hasMany(Project, { foreignKey: 'client_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

// Project <-> Phases
Project.hasMany(Phase, { foreignKey: 'project_id', as: 'phases' });
Phase.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Phase <-> PhaseTasks
Phase.hasMany(PhaseTask, { foreignKey: 'phase_id', as: 'tasks' });
PhaseTask.belongsTo(Phase, { foreignKey: 'phase_id', as: 'phase' });

// Project <-> Documents
Project.hasMany(Document, { foreignKey: 'project_id', as: 'documents' });
Document.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Project <-> Amendments
Project.hasMany(Amendment, { foreignKey: 'project_id', as: 'amendments' });
Amendment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Project <-> Reserves
Project.hasMany(Reserve, { foreignKey: 'project_id', as: 'reserves' });
Reserve.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Project <-> Budget
Project.hasMany(BudgetEstimate, { foreignKey: 'project_id', as: 'budget_estimates' });
BudgetEstimate.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Project <-> TimeEntries
Project.hasMany(TimeEntry, { foreignKey: 'project_id', as: 'time_entries' });
TimeEntry.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Project <-> Subcontractors
Project.belongsToMany(Subcontractor, { through: ProjectSubcontractor, foreignKey: 'project_id', otherKey: 'subcontractor_id', as: 'subcontractors' });
Subcontractor.belongsToMany(Project, { through: ProjectSubcontractor, foreignKey: 'subcontractor_id', otherKey: 'project_id', as: 'projects' });

// Project <-> PaymentMilestones
Project.hasMany(PaymentMilestone, { foreignKey: 'project_id', as: 'milestones' });
PaymentMilestone.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Phase <-> PaymentMilestones
Phase.hasMany(PaymentMilestone, { foreignKey: 'phase_id', as: 'milestones' });
PaymentMilestone.belongsTo(Phase, { foreignKey: 'phase_id', as: 'phase' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Legacy
Folder.hasMany(Document, { foreignKey: 'folderId', as: 'documents' });
Document.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });

module.exports = {
    sequelize,
    User,
    Project,
    Phase,
    PhaseTask,
    Document,
    Folder,
    Finance,
    Activity,
    Transaction,
    Amendment,
    Subcontractor,
    ProjectSubcontractor,
    Reserve,
    TimeEntry,
    BudgetEstimate,
    Notification,
    PaymentMilestone
};
