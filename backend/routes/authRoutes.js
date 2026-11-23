const router=require('express').Router();const c=require('../controllers/authController');const {requireAuth,requireCsrf}=require('../middleware/authMiddleware');
router.get('/csrf',c.csrf);router.post('/login',c.login);router.get('/me',c.me);router.post('/logout',requireAuth,requireCsrf,c.logout);module.exports=router;
