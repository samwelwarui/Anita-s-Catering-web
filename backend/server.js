require('dotenv').config();
const express=require('express'),session=require('express-session'),SQLiteStore=require('connect-sqlite3')(session),helmet=require('helmet'),cors=require('cors'),rateLimit=require('express-rate-limit'),bcrypt=require('bcryptjs'),path=require('node:path');
const db=require('./database/db');const authRoutes=require('./routes/authRoutes'),inquiryRoutes=require('./routes/inquiryRoutes'),reviewRoutes=require('./routes/reviewRoutes');
const app=express();const isProd=process.env.NODE_ENV==='production';
if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32){if(isProd)throw new Error('SESSION_SECRET must be at least 32 characters in production');console.warn('WARNING: Set SESSION_SECRET in backend/.env before deployment.');}
app.disable('x-powered-by');app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(cors({origin:process.env.FRONTEND_ORIGIN||'http://localhost:5500',credentials:true}));app.use(express.json({limit:'30kb'}));
app.use(session({name:'anita.sid',store:new SQLiteStore({db:'sessions.sqlite',dir:path.join(__dirname,'data')}),secret:process.env.SESSION_SECRET||'development-only-secret-change-before-deploy-123',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:isProd,maxAge:8*60*60*1000}}));
const publicLimiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many submissions. Please wait and try again.'}});
const authLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many sign-in attempts. Please wait and try again.'}});
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'Anita Catering API'}));app.use('/api/auth/login',authLimiter);app.use('/api/auth',authRoutes);
const limitPublicPosts=(req,res,next)=>req.method==='POST'?publicLimiter(req,res,next):next();
app.use('/api/inquiries',limitPublicPosts,inquiryRoutes);app.use('/api/reviews',limitPublicPosts,reviewRoutes);
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'An unexpected server error occurred.'});});
function bootstrapAdmin(){const username=process.env.ADMIN_USERNAME,password=process.env.ADMIN_PASSWORD;if(!username||!password){console.warn('Admin not provisioned: set ADMIN_USERNAME and ADMIN_PASSWORD in backend/.env.');return;}if(password.length<12)throw new Error('ADMIN_PASSWORD must be at least 12 characters.');const existing=db.prepare('SELECT id FROM admins WHERE username=?').get(username);if(!existing)db.prepare('INSERT INTO admins(username,password_hash) VALUES(?,?)').run(username,bcrypt.hashSync(password,12));}
bootstrapAdmin();const port=Number(process.env.PORT)||3000;app.listen(port,()=>console.log(`Anita Catering API listening on http://localhost:${port}`));
module.exports=app;
