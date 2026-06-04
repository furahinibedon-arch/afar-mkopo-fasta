const jwt=require('jsonwebtoken');
const prisma=require('./_lib/prisma');
async function auth(req){
  const t=(req.headers['authorization']||'').split(' ')[1];
  if(!t)throw Object.assign(new Error('No token'),{status:401});
  return jwt.verify(t,process.env.JWT_SECRET);
}
module.exports=async(req,res)=>{
  try{
    const user=await auth(req);
    if(req.method==='GET'){
      const loans=await prisma.loan.findMany({where:{borrowerId:user.userId},orderBy:{createdAt:'desc'},include:{repayments:true}});
      return res.json(loans);
    }
    if(req.method==='POST'){
      const{loanAmount,amount,interestRate=20,repaymentPeriod=30,loanPurpose,purpose,...rest}=req.body;
      const amt=parseFloat(loanAmount||amount||0);
      const rate=parseFloat(interestRate);
      const period=parseInt(repaymentPeriod);
      const total=amt*(1+rate/100);
      const monthly=total/period;
      const loan=await prisma.loan.create({data:{borrowerId:user.userId,amount:amt,interestRate:rate,repaymentPeriod:period,totalAmount:total,monthlyPayment:monthly,purpose:loanPurpose||purpose||'',applicationData:rest}});
      return res.status(201).json(loan);
    }
    res.status(405).json({error:'Method not allowed'});
  }catch(e){res.status(e.status||500).json({error:e.message});}
};