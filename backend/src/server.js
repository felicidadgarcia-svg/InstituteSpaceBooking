import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { pool } from './db.js';
const app = express();
const PORT = Number(process.env.PORT || 3000);
const types = ['classroom','computer_lab','meeting_room','workshop','other'];
app.use(cors({origin: process.env.CORS_ORIGIN || 'http://localhost:5173'}));
app.use(express.json({limit:'100kb'}));
app.get('/api/health', async (_req,res) => { try { await pool.query('SELECT 1'); res.json({status:'ok',database:'connected'}); } catch { res.status(503).json({status:'error',message:'Database unavailable'}); } });
app.get('/api/spaces', async (req,res,next) => { try {
 const where=['is_active=TRUE'], params=[]; const {type,capacity,search}=req.query;
 if(type && type!=='all'){if(!types.includes(type)) return res.status(400).json({error:'Invalid space type.'});where.push('space_type=?');params.push(type);}
 if(capacity){const n=Number(capacity);if(!Number.isInteger(n)||n<1)return res.status(400).json({error:'Capacity must be a positive integer.'});where.push('capacity>=?');params.push(n);}
 if(search?.trim()){where.push('(name LIKE ? OR building LIKE ? OR description LIKE ?)');const q=`%${search.trim()}%`;params.push(q,q,q);}
 const [rows]=await pool.query(`SELECT id,name,space_type AS type,building,floor_label AS floor,capacity,description,equipment FROM spaces WHERE ${where.join(' AND ')} ORDER BY building,name`,params);
 res.json(rows.map(r=>({...r,equipment:typeof r.equipment==='string'?JSON.parse(r.equipment):r.equipment}))); } catch(e){next(e);} });
app.get('/api/bookings', async (req,res,next)=>{try{
 const {date,spaceId,status='confirmed'}=req.query; const where=[],p=[];
 if(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return res.status(400).json({error:'Date must use YYYY-MM-DD.'});where.push('b.booking_date=?');p.push(date);}
 if(spaceId){const n=Number(spaceId);if(!Number.isInteger(n)||n<1)return res.status(400).json({error:'Invalid spaceId.'});where.push('b.space_id=?');p.push(n);}
 if(status!=='all'){where.push('b.status=?');p.push(status);}
 const [rows]=await pool.query(`SELECT b.id,b.space_id AS spaceId,s.name AS spaceName,b.booked_by AS bookedBy,b.email,b.purpose,DATE_FORMAT(b.booking_date,'%Y-%m-%d') AS bookingDate,TIME_FORMAT(b.start_time,'%H:%i') AS startTime,TIME_FORMAT(b.end_time,'%H:%i') AS endTime,b.status FROM bookings b JOIN spaces s ON s.id=b.space_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY b.booking_date,b.start_time`,p);res.json(rows);
 }catch(e){next(e);}});
app.get('/api/bookings/:id',async(req,res,next)=>{try{const id=Number(req.params.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:'Invalid booking id.'});const [r]=await pool.query(`SELECT b.id,b.space_id AS spaceId,s.name AS spaceName,b.booked_by AS bookedBy,b.email,b.purpose,DATE_FORMAT(b.booking_date,'%Y-%m-%d') AS bookingDate,TIME_FORMAT(b.start_time,'%H:%i') AS startTime,TIME_FORMAT(b.end_time,'%H:%i') AS endTime,b.status FROM bookings b JOIN spaces s ON s.id=b.space_id WHERE b.id=?`,[id]);if(!r.length)return res.status(404).json({error:'Booking not found.'});res.json(r[0]);}catch(e){next(e);}});
app.post('/api/bookings',async(req,res,next)=>{const {spaceId,bookedBy,email,purpose,bookingDate,startTime,endTime}=req.body||{};const id=Number(spaceId);
 if(!Number.isInteger(id)||id<1)return res.status(400).json({error:'Choose a valid space.'});
 if(![bookedBy,email,purpose,bookingDate,startTime,endTime].every(v=>typeof v==='string'&&v.trim()))return res.status(400).json({error:'All fields are required.'});
 if(!/^\S+@\S+\.\S+$/.test(email.trim()))return res.status(400).json({error:'Enter a valid email address.'});
 if(!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate))return res.status(400).json({error:'Date must use YYYY-MM-DD.'});
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)||startTime>=endTime)return res.status(400).json({error:'End time must be later than start time.'});
 if(bookedBy.trim().length>120||purpose.trim().length>250)return res.status(400).json({error:'Name or purpose is too long.'});
 let conn;try{conn=await pool.getConnection();await conn.beginTransaction();const [s]=await conn.query('SELECT id FROM spaces WHERE id=? AND is_active=TRUE FOR UPDATE',[id]);if(!s.length){await conn.rollback();return res.status(404).json({error:'Space not found or inactive.'});}
 const [conflicts]=await conn.query("SELECT id FROM bookings WHERE space_id=? AND booking_date=? AND status='confirmed' AND start_time < ? AND end_time > ? LIMIT 1",[id,bookingDate,endTime,startTime]);if(conflicts.length){await conn.rollback();return res.status(409).json({error:'This space is already booked for part of that time slot.'});}
 const [r]=await conn.query('INSERT INTO bookings(space_id,booked_by,email,purpose,booking_date,start_time,end_time) VALUES(?,?,?,?,?,?,?)',[id,bookedBy.trim(),email.trim().toLowerCase(),purpose.trim(),bookingDate,startTime,endTime]);await conn.commit();res.status(201).json({id:r.insertId,message:'Booking created successfully.'});
 }catch(e){if(conn)await conn.rollback();next(e);}finally{if(conn)conn.release();}});
app.patch('/api/bookings/:id/cancel',async(req,res,next)=>{try{const id=Number(req.params.id);if(!Number.isInteger(id)||id<1)return res.status(400).json({error:'Invalid booking id.'});const [r]=await pool.query("UPDATE bookings SET status='cancelled' WHERE id=? AND status='confirmed'",[id]);if(!r.affectedRows)return res.status(404).json({error:'Active booking not found.'});res.json({message:'Booking cancelled.'});}catch(e){next(e);}});
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:'Unexpected server error.'});});
app.listen(PORT,'0.0.0.0',()=>console.log(`Institute Space Booking API listening on ${PORT}`));
