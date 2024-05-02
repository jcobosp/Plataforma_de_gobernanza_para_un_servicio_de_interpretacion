const Sequelize = require('sequelize');
const url = process.env.DATABASE_URL || "sqlite:blog.sqlite";
const sequelize = new Sequelize(url, { logging: false });

const Post = require('./post')(sequelize, Sequelize.DataTypes);
const Attachment = require('./attachment')(sequelize, Sequelize.DataTypes);
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Team = require('./team')(sequelize, Sequelize.DataTypes);
const UserTeam = require('./userTeam')(sequelize, Sequelize.DataTypes);
const UserPostVotes = require('./userPostVotes')(sequelize, Sequelize.DataTypes);
const DeletedPost = require('./deletedPosts')(sequelize, Sequelize.DataTypes);

Attachment.hasOne(Post, {as: 'post', foreignKey: 'attachmentId'});
Post.belongsTo(Attachment, {as: 'attachment', foreignKey: 'attachmentId'});
User.hasMany(Post, {as: 'posts', foreignKey: 'authorId'});
Post.belongsTo(User, {as: 'author', foreignKey: 'authorId'});
Attachment.hasOne(Team, {as: 'team', foreignKey: 'attachmentId'});
Team.belongsTo(Attachment, {as: 'attachment', foreignKey: 'attachmentId'});
User.hasMany(Team, {as: 'teams', foreignKey: 'authorId'});
Team.belongsTo(User, {as: 'author', foreignKey: 'authorId'});

Team.belongsTo(User, { as: 'adminUser', foreignKey: 'adminTeamId' });
User.hasMany(Team, { as: 'adminTeams', foreignKey: 'adminTeamId' });
User.belongsToMany(Team, { through: UserTeam, foreignKey: 'userId' });
Team.belongsToMany(User, { through: UserTeam, foreignKey: 'teamId' });

Post.belongsTo(Team, { as: 'team', foreignKey: 'TeamId' });
Team.hasMany(Post, { as: 'posts', foreignKey: 'TeamId' });

User.belongsToMany(Post, { through: UserPostVotes, foreignKey: 'userId' });
Post.belongsToMany(User, { through: UserPostVotes, foreignKey: 'postId' });

UserPostVotes.belongsTo(User, { foreignKey: 'userId' });
UserPostVotes.belongsTo(Post, { foreignKey: 'postId' });

Attachment.hasOne(DeletedPost, {as: 'deletedPost', foreignKey: 'attachmentId'});
DeletedPost.belongsTo(Attachment, {as: 'attachment', foreignKey: 'attachmentId'});

module.exports = sequelize;
