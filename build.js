const fs=require('fs'),pt=require('path'),b='c:/Users/KINGKAI/.kiro/AFAR/afar-mkopo-fasta';
function w(f,c){fs.mkdirSync(pt.dirname(pt.join(b,f)),{recursive:true});fs.writeFileSync(pt.join(b,f),c,'utf8');}

// Fix loans.js - store full app data as JSON in purpose field
w('api/loans.js',`const jwt=require('jsonwebtoken');
const prisma=require('./_lib/prisma');
async function auth(req){
  const t=(req.headers['authorization']||'').replace('Bearer ','').trim();
  if(!t)throw Object.assign(new Error('No token'),{status:401});
  return jwt.verify(t,process.env.JWT_SECRET);
}
module.exports=async(req,res)=>{
  try{
    const user=await auth(req);
    if(req.method==='GET'){
      const loans=await prisma.loan.findMany({where:{borrowerId:user.userId},orderBy:{createdAt:'desc'},include:{repayments:true}});
      const parsed=loans.map(l=>{let appData={};try{const p=JSON.parse(l.purpose||'{}');if(p.__appData){appData=p.__appData;return{...l,purpose:p.purpose||'',applicationData:appData};}}catch(e){}return l;});
      return res.json(parsed);
    }
    if(req.method==='POST'){
      const{loanAmount,amount,interestRate=20,repaymentPeriod=30,loanPurpose,purpose,...rest}=req.body;
      const amt=parseFloat(loanAmount||amount||0);
      const rate=parseFloat(interestRate);
      const period=parseInt(repaymentPeriod);
      const total=amt*(1+rate/100);
      const monthly=total/period;
      const purposeText=loanPurpose||purpose||'';
      const purposeField=JSON.stringify({purpose:purposeText,__appData:rest});
      const loan=await prisma.loan.create({data:{borrowerId:user.userId,amount:amt,interestRate:rate,repaymentPeriod:period,totalAmount:total,monthlyPayment:monthly,purpose:purposeField}});
      return res.status(201).json(loan);
    }
    res.status(405).json({error:'Method not allowed'});
  }catch(e){res.status(e.status||500).json({error:e.message});}
};`);

// Fix loans/all.js - parse appData from purpose field
w('api/loans/all.js',`const jwt=require('jsonwebtoken');
const prisma=require('../_lib/prisma');
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const auth=req.headers['authorization']||'';
  const t=auth.replace('Bearer ','').trim();
  if(!t)return res.status(401).json({error:'No token provided'});
  try{
    const u=jwt.verify(t,process.env.JWT_SECRET);
    if(u.role==='BORROWER')return res.status(403).json({error:'Forbidden'});
    const loans=await prisma.loan.findMany({
      orderBy:{createdAt:'desc'},
      include:{borrower:{select:{firstName:true,lastName:true,email:true,phone:true}},repayments:true}
    });
    const parsed=loans.map(l=>{
      let purposeText=l.purpose||'';
      let appData={};
      try{
        const p=JSON.parse(l.purpose||'{}');
        if(p.__appData){appData=p.__appData;purposeText=p.purpose||'';}
      }catch(e){}
      return{...l,purpose:purposeText,applicationData:appData};
    });
    res.json(parsed);
  }catch(e){
    res.status(401).json({error:'Invalid token: '+e.message});
  }
};`);

console.log('loans API fixed - using purpose field for appData');