const jwt=require('jsonwebtoken');const bcrypt=require('bcrypt');const prisma=require('./_lib/prisma');
async function guard(req,res){const t=(req.headers['authorization']||'').split(' ')[1];if(!t){res.status(401).json({error:'No token'});return null;}try{const u=jwt.verify(t,process.env.JWT_SECRET);if(u.role!=='ADMIN'){res.status(403).json({error:'Admins only'});return null;}return u;}catch(e){res.status(401).json({error:'Invalid token'});return null;}}
module.exports=async(req,res)=>{
  const u=await guard(req,res);if(!u)return;
  if(req.method==='GET'){
    const users=await prisma.user.findMany({orderBy:{createdAt:'desc'},select:{id:true,email:true,firstName:true,lastName:true,phone:true,role:true,isActive:true,createdAt:true}});
    return res.json(users);
  }
  if(req.method==='POST'){
    const{email,password,firstName,lastName,phone,role='BORROWER'}=req.body;
    if(!email||!password||!firstName||!lastName||!phone)return res.status(400).json({error:'All fields required'});
    const hashed=await bcrypt.hash(password,10);
    try{const user=await prisma.user.create({data:{email,password:hashed,firstName,lastName,phone,role}});const{password:_,...safe}=user;return res.status(201).json(safe);}
    catch(e){return res.status(400).json({error:'Email or phone already exists'});}
  }
  res.status(405).json({error:'Method not allowed'});
};