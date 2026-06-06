const fs=require('fs'),pt=require('path'),b='c:/Users/KINGKAI/.kiro/AFAR/afar-mkopo-fasta';
function w(f,c){fs.mkdirSync(pt.dirname(pt.join(b,f)),{recursive:true});fs.writeFileSync(pt.join(b,f),c,'utf8');}

// Update the staff modal to be smarter about showing data
// The Row component should show value OR a fallback
// Also show a notice if applicationData is empty (old loan)
let page=fs.readFileSync(pt.join(b,'app/staff/page.tsx'),'utf8');

// Fix Row to show dash for empty values
page=page.replace(
  "const Row=({label,value}:{label:string;value:any})=>value?(",
  "const Row=({label,value}:{label:string;value:any})=>("
);
page=page.replace(
  "):null;",
  ");"
);
// Fix Row content to always render with dash fallback
page=page.replace(
  '<span className="text-sm text-navy-800 font-medium">{value}</span>',
  '<span className="text-sm text-navy-800 font-medium">{value||<span className="text-slate-300 italic"></span>}</span>'
);

// Add a notice when applicationData is empty (old loan before system update)
page=page.replace(
  "{/* Borrower details */}",
  `{Object.keys(viewing.applicationData||{}).length===0&&(
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
                   This loan was submitted before the full form system was enabled. Only basic info is available below.
                </div>
              )}
              {/* Borrower details */}`
);

fs.writeFileSync(pt.join(b,'app/staff/page.tsx'),page,'utf8');
console.log('staff modal updated');