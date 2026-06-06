const fs=require('fs'),pt=require('path'),b='c:/Users/KINGKAI/.kiro/AFAR/afar-mkopo-fasta';
let page=fs.readFileSync(pt.join(b,'app/borrower/page.tsx'),'utf8');

// Fix 1: loanAmount schema - use coerce to handle NaN from valueAsNumber
page=page.replace(
  'loanAmount:z.number({invalid_type_error:"Enter amount"}).min(1000,"Min Tsh 1,000")',
  'loanAmount:z.coerce.number({invalid_type_error:"Enter amount"}).min(1000,"Min Tsh 1,000")'
);

// Fix 2: loanAmountWords required
page=page.replace(
  'loanAmountWords:z.string().min(3,"Required")',
  'loanAmountWords:z.string().min(1,"Required")'
);

// Fix 3: defaultValues - set loanAmount to 0 so it's not undefined/NaN
page=page.replace(
  'defaultValues:{loanAmount:undefined}',
  'defaultValues:{loanAmount:0,loanAmountWords:""}'
);

// Fix 4: display 0 as empty in the input
page=page.replace(
  '{...register("loanAmount",{valueAsNumber:true})} className="input-field" placeholder="e.g. 500000"',
  '{...register("loanAmount",{valueAsNumber:true,setValueAs:(v)=>v===""?0:Number(v)})} className="input-field" placeholder="e.g. 500000"'
);

fs.writeFileSync(pt.join(b,'app/borrower/page.tsx'),page,'utf8');
console.log('borrower wizard fixed');