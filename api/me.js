const jwt=require('jsonwebtoken');
const prisma=require('./_lib/prisma');
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const auth=req.headers['authorization'];
  const token=auth&&auth.split(' ')[1];
  if(!token)return res.status(401).json({error:'No token'});
  try{
    const{userId}=jwt.verify(token,process.env.JWT_SECRET);
    const user=await prisma.user.findUnique({where:{id:userId},include:{borrowerProfile:true}});
    if(!user)return res.status(404).json({error:'User not found'});
    const{password:_,...safe}=user;
    res.json(safe);
  }catch(e){res.status(401).json({error:'Invalid token'});}
};