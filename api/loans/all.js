const jwt=require('jsonwebtoken');
const prisma=require('../_lib/prisma');
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const auth=req.headers['authorization']||req.headers['Authorization']||'';
  const t=auth.replace('Bearer ','').trim();
  if(!t)return res.status(401).json({error:'No token provided'});
  try{
    const u=jwt.verify(t,process.env.JWT_SECRET);
    if(u.role==='BORROWER')return res.status(403).json({error:'Forbidden'});
    const loans=await prisma.loan.findMany({
      orderBy:{createdAt:'desc'},
      include:{borrower:{select:{firstName:true,lastName:true,email:true,phone:true}},repayments:true}
    });
    res.json(loans);
  }catch(e){
    res.status(401).json({error:'Invalid token: '+e.message});
  }
};