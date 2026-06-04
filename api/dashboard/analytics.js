const jwt=require('jsonwebtoken');
const prisma=require('../_lib/prisma');
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const t=(req.headers['authorization']||'').split(' ')[1];
  if(!t)return res.status(401).json({error:'No token'});
  try{
    const u=jwt.verify(t,process.env.JWT_SECRET);
    if(u.role==='BORROWER')return res.status(403).json({error:'Forbidden'});
    const[disbAgg,repaidAgg,loans,overdueRepayments]=await Promise.all([
      prisma.transaction.aggregate({where:{type:'DISBURSEMENT'},_sum:{amount:true}}),
      prisma.transaction.aggregate({where:{type:'REPAYMENT'},_sum:{amount:true}}),
      prisma.loan.findMany({orderBy:{createdAt:'desc'},include:{borrower:{select:{firstName:true,lastName:true,email:true,phone:true}},repayments:true}}),
      prisma.repayment.findMany({where:{status:'OVERDUE'},include:{loan:{include:{borrower:{select:{firstName:true,lastName:true}}}}}}),
    ]);
    res.json({
      totalDisbursed:disbAgg._sum.amount||0,
      totalRepaid:repaidAgg._sum.amount||0,
      loans,overdueRepayments,
    });
  }catch(e){res.status(500).json({error:e.message});}
};