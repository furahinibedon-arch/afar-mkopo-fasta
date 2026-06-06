const fs=require('fs'),pt=require('path'),b='c:/Users/KINGKAI/.kiro/AFAR/afar-mkopo-fasta';
function w(f,c){fs.mkdirSync(pt.dirname(pt.join(b,f)),{recursive:true});fs.writeFileSync(pt.join(b,f),c,'utf8');}

// Add applicationData back to schema
let schema=fs.readFileSync(pt.join(b,'prisma/schema.prisma'),'utf8');
if(!schema.includes('applicationData')){
  schema=schema.replace('  purpose          String?','  purpose          String?\n  applicationData  Json?');
  fs.writeFileSync(pt.join(b,'prisma/schema.prisma'),schema,'utf8');
}

// Fix loans API to save applicationData
let api=fs.readFileSync(pt.join(b,'api/loans.js'),'utf8');
if(!api.includes('applicationData')){
  api=api.replace(
    "const loan=await prisma.loan.create({data:{borrowerId:user.userId,amount:amt,interestRate:rate,repaymentPeriod:period,totalAmount:total,monthlyPayment:monthly,purpose:loanPurpose||purpose||''}});",
    "const{loanAmount:_la,amount:_a,interestRate:_ir,repaymentPeriod:_rp,loanPurpose:_lp,purpose:_p,dailyPayment:_dp,...appData}=req.body;const loan=await prisma.loan.create({data:{borrowerId:user.userId,amount:amt,interestRate:rate,repaymentPeriod:period,totalAmount:total,monthlyPayment:monthly,purpose:loanPurpose||purpose||'',applicationData:appData}});"
  );
  fs.writeFileSync(pt.join(b,'api/loans.js'),api,'utf8');
}
console.log('schema+api done');