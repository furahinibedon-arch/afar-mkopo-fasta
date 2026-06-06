const jwt=require('jsonwebtoken');const bcrypt=require('bcrypt');const prisma=require('../../_lib/prisma');
async function guard(req,res){const t=(req.headers['authorization']||'').split(' ')[1];if(!t){res.status(401).json({error:'No token'});return null;}try{const u=jwt.verify(t,process.env.JWT_SECRET);if(u.role!=='ADMIN'){res.status(403).json({error:'Admins only'});return null;}return u;}catch(e){res.status(401).json({error:'Invalid token'});return null;}}
module.exports=async(req,res)=>{
  const u=await guard(req,res);if(!u)return;
  const{id}=req.query;
  if(req.method==='PATCH'){
    const{email,firstName,lastName,phone,role,isActive,password}=req.body;
    const data={};
    if(email)data.email=email;if(firstName)data.firstName=firstName;if(lastName)data.lastName=lastName;
    if(phone)data.phone=phone;if(role)data.role=role;if(typeof isActive==='boolean')data.isActive=isActive;
    if(password)data.password=await bcrypt.hash(password,10);
    try{const user=await prisma.user.update({where:{id},data});const{password:_,...safe}=user;return res.json(safe);}
    catch(e){return res.status(400).json({error:e.message});}
  }
  if(req.method==='DELETE'){
    try{await prisma.user.delete({where:{id}});return res.json({message:'User deleted'});}
    catch(e){return res.status(400).json({error:e.message});}
  }
  res.status(405).json({error:'Method not allowed'});
};