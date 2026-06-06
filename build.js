const fs=require('fs'),pt=require('path'),b='c:/Users/KINGKAI/.kiro/AFAR/afar-mkopo-fasta';
let page=fs.readFileSync(pt.join(b,'app/borrower/page.tsx'),'utf8');

// Fix 1: defaultValues - do NOT default loanAmount to 0, leave undefined so validation catches empty
page=page.replace(
  "defaultValues:{loanAmount:0,loanAmountWords:\"\",repaymentType:\"MONTHLY\"}",
  "defaultValues:{loanAmountWords:\"\",repaymentType:\"MONTHLY\"}"
);

// Fix 2: The submit button on step 3 must NOT be type="submit" until user explicitly clicks
// Change navigation logic: add a "confirmSubmit" state, show "Review & Submit" first
// then show actual submit button
// Simplest fix: change step count to 5 with a review step, OR
// just change the last step button to require a second click
// ACTUALLY the real fix: step<STEPS.length-1 should be step<3 (last step is 3, but we want to stay on it)
// Change: show Submit only after user explicitly clicks "Ready to Submit" on guarantors step

// Fix 3: Change next() to NOT advance past step 3
page=page.replace(
  "if(ok)setStep(s=>Math.min(s+1,STEPS.length-1));",
  "if(ok)setStep(s=>s+1);"
);

// Fix 4: The button logic - on step 3 show "Ready to Submit" which just enables the submit, not auto-submit
// Replace the button section
page=page.replace(
  "{step<STEPS.length-1\n            ?<button type=\"button\" onClick={next} className=\"btn-primary\">Next \u2192</button>\n            :<button type=\"submit\" disabled={busy} className=\"btn-primary\">{busy?\"Saving\u2026\":\"Submit & Print PDF\"}</button>\n          }",
  "{step<3\n            ?<button type=\"button\" onClick={next} className=\"btn-primary\">Next \u2192</button>\n            :<button type=\"submit\" disabled={busy} className=\"btn-primary\">{busy?\"Saving\u2026\":\"Submit & Print PDF\"}</button>\n          }"
);

fs.writeFileSync(pt.join(b,'app/borrower/page.tsx'),page,'utf8');
console.log('nav fixed');