var express = require('express');
var router = express.Router();
const postController = require('../controllers/post');
const sessionController = require('../controllers/session');
const userController = require('../controllers/user');
const teamController = require('../controllers/team');   
const reputationController = require('../controllers/reputation'); 
const tokenController = require('../controllers/token'); 
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {fileSize: 20 * 1024 * 1024}
});
// Pantalla inicial
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Blog' });
});

// Pantalla Teams
router.param('teamId', teamController.load);
router.get('/teams/:teamId(\\d+)/attachment', teamController.attachment);
router.get('/teams', teamController.index);
router.get('/teams/:teamId(\\d+)', teamController.show);
router.get('/teams/new', sessionController.loginRequired, teamController.new);
router.post('/teams', upload.single('image'), teamController.create);
router.get('/teams/:teamId(\\d+)/edit', teamController.adminOrAuthorRequired, teamController.edit);
router.put('/teams/:teamId(\\d+)', upload.single('image'), teamController.update);
router.delete('/teams/:teamId(\\d+)', teamController.adminOrAuthorRequired, teamController.destroy);
router.post('/teams/:teamId/join', teamController.joinTeam);
router.post('/teams/:teamId/leave', teamController.leaveTeam);
router.post('/teams/:teamId/donate-reputation', teamController.donateReputation);


// Pantalla Reputación
router.get('/reputation', reputationController.index); 
router.post('/reputation/:userId(\\d+)/addPoint', reputationController.addPoint);

// Pantalla Tockens
// router.get('/tokens', tokenController.index); 
// router.post('/tokens/:userId(\\d+)/addToken', tokenController.addToken);
// router.post('/tokens/:userId(\\d+)/removeToken', tokenController.removeToken);
router.get('/wallet', tokenController.index); 
router.post('/wallet/:userId(\\d+)/:teamId(\\d+)/addPointWallet', tokenController.addWalletPoint);
router.post('/wallet/:userId(\\d+)/:teamId(\\d+)/removePointWallet', tokenController.removeWalletPoint);
router.post('/wallet/:userId(\\d+)/:teamId(\\d+)/addTokenToUser', tokenController.addTokenToUser);
router.post('/wallet/:userId(\\d+)/:teamId(\\d+)/removeTokenFromUser', tokenController.removeTokenFromUser);


// Pantalla Propuestas
router.param('postId', postController.load);
router.get('/posts/:postId(\\d+)/attachment', postController.attachment);
router.get('/posts', postController.index);
router.get('/posts/:postId(\\d+)', postController.show);
router.get('/posts/new', sessionController.loginRequired, postController.new);
router.post('/posts', upload.single('image'), postController.create);
router.get('/posts/:postId(\\d+)/edit', postController.adminOrAuthorRequired, postController.edit);
router.put('/posts/:postId(\\d+)', upload.single('image'), postController.update);
router.delete('/posts/:postId(\\d+)', postController.adminOrAuthorRequired, postController.destroy); 
router.post('/posts/:postId/vote', postController.vote);
router.post('/posts/:postId/change-vote', postController.changeVote);
router.post('/posts/:postId/veto', postController.adminOrAuthorRequired, postController.veto);
router.get('/posts/calculate-reputation', postController.calculateReputation);
router.get('/posts/apply-rewards', postController.applyRewards);

// Pantalla Usuarios
router.param('userId', userController.load);
router.get('/users', userController.index);
router.get('/users/:userId(\\d+)', userController.show);
router.get('/users/new', sessionController.adminRequired, userController.new);
router.post('/users', sessionController.adminRequired, userController.create);
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.edit);
router.put('/users/:userId(\\d+)', sessionController.adminOrMyselfRequired, userController.update);
router.delete('/users/:userId(\\d+)', sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.destroy);

// Pantalla Login
router.get('/login',    sessionController.new);     
router.post('/login',   sessionController.create);  
router.delete('/login', sessionController.destroy); 

module.exports = router;