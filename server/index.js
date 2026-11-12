import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '20kb' }));

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
  subject: { type: String, trim: true, maxlength: 160, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  createdAt: { type: Date, default: Date.now }
});
const Inquiry = mongoose.model('Inquiry', inquirySchema);

const requireDatabase = (req,res,next) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({message:'Database is not connected. Configure MONGODB_URI.'});
  next();
};
const requireAdmin = (req,res,next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i,'');
  if (!token) return res.status(401).json({message:'Authentication required'});
  try { req.admin = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({message:'Session expired. Sign in again.'}); }
};

app.get('/api/health',(req,res)=>res.json({status:'ok',database:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.post('/api/inquiries', requireDatabase, async (req,res) => {
  try {
    const {name,email,subject='',message}=req.body || {};
    if (typeof name!=='string' || name.trim().length<2 || typeof email!=='string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof message!=='string' || message.trim().length<10) return res.status(400).json({message:'Please provide a valid name, email and message.'});
    const inquiry=await Inquiry.create({name:name.trim(),email:email.trim(),subject:String(subject).trim(),message:message.trim()});
    res.status(201).json({message:'Inquiry received',id:inquiry._id});
  } catch(error) { console.error(error); res.status(500).json({message:'Could not save inquiry'}); }
});
app.post('/api/admin/login', requireDatabase, async (req,res) => {
  try {
    const password=String(req.body?.password || '');
    if (!process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) return res.status(503).json({message:'Admin credentials are not configured on the server.'});
    const valid=await bcrypt.compare(password,process.env.ADMIN_PASSWORD_HASH);
    if (!valid) return res.status(401).json({message:'Incorrect password'});
    const token=jwt.sign({role:'admin'},process.env.JWT_SECRET,{expiresIn:'8h'});
    res.json({token});
  } catch(error) { console.error(error); res.status(500).json({message:'Login failed'}); }
});
app.get('/api/admin/inquiries', requireDatabase, requireAdmin, async (req,res) => {
  try { res.json(await Inquiry.find().sort({createdAt:-1}).limit(200).lean()); }
  catch(error) { console.error(error); res.status(500).json({message:'Could not load inquiries'}); }
});

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('MongoDB connected')).catch(err=>console.error('MongoDB connection error:',err.message));
} else console.warn('MONGODB_URI is missing. Contact submissions and admin login are disabled until configured.');

if (process.env.NODE_ENV === 'production') {
  const dist=path.resolve(__dirname,'../dist');
  app.use(express.static(dist));
  app.get('*',(req,res)=>res.sendFile(path.join(dist,'index.html')));
}
app.listen(PORT,()=>console.log(`Zemen server running on port ${PORT}`));