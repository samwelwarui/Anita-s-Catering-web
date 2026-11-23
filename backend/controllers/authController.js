const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const db = require('../database/db');
function csrf(req,res){ if(!req.session.csrfToken) req.session.csrfToken=crypto.randomBytes(32).toString('hex'); res.json({csrfToken:req.session.csrfToken}); }
function login(req,res){
 const { username, password } = req.body || {};
 const admin = db.prepare('SELECT id, username, password_hash FROM admins WHERE username=?').get(String(username||''));
 if(!admin || !bcrypt.compareSync(String(password||''), admin.password_hash)) return res.status(401).json({error:'Invalid username or password.'});
 req.session.regenerate(err=>{ if(err) return res.status(500).json({error:'Unable to start session.'}); req.session.adminId=admin.id; req.session.username=admin.username; req.session.csrfToken=crypto.randomBytes(32).toString('hex'); res.json({message:'Signed in.', username:admin.username, csrfToken:req.session.csrfToken}); });
}
function me(req,res){ if(!req.session.adminId) return res.status(401).json({authenticated:false}); res.json({authenticated:true,username:req.session.username,csrfToken:req.session.csrfToken}); }
function logout(req,res){ req.session.destroy(()=>{res.clearCookie('anita.sid');res.json({message:'Signed out.'});}); }
module.exports={csrf,login,me,logout};
