const jwt=require('jsonwebtoken');
const prisma=require('../../_lib/prisma');
module.exports=async(req,res)=>{
  if(req.method!=='PATCH')return res.status(405).json({error:'Method not allowed'});
  const t=(req.headers['authorization']||'').replace('Bearer ','').trim();
  if(!t)return res.status(401).json({error:'No token'});
  try{
    const u=jwt.verify(t,process.env.JWT_SECRET);
    if(u.role==='BORROWER')return res.status(403).json({error:'Forbidden'});
    const{id}=req.query;
    const{status,notes}=req.body;
    const allowed=['APPROVED','REJECTED','DISBURSED','REPAID','DEFAULTED'];
    if(!allowed.includes(status))return res.status(400).json({error:'Invalid status'});
    // Store notes/reason in purpose JSON
    const existing=await prisma.loan.findUnique({where:{id}});
    let purposeData={};
    try{purposeData=JSON.parse(existing.purpose||'{}');}catch(e){}
    if(notes)purposeData.staffNotes=notes;
    if(status==='REJECTED'&&notes)purposeData.rejectionReason=notes;
    const loan=await prisma.loan.update({
      where:{id},
      data:{status,disbursedAt:status==='DISBURSED'?new Date():undefined,purpose:JSON.stringify(purposeData)}
    });
    if(notes){try{await prisma.staffAction.create({data:{loanId:id,staffId:u.userId,action:status,notes}});}catch(e){}}
    res.json(loan);
  }catch(e){res.status(500).json({error:e.message});}
};