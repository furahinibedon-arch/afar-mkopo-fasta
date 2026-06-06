const fs=require('fs'),pt=require('path'),b='c:/Users/KINGKAI/.kiro/AFAR/afar-mkopo-fasta';
function w(f,c){fs.mkdirSync(pt.dirname(pt.join(b,f)),{recursive:true});fs.writeFileSync(pt.join(b,f),c,'utf8');}

// admin/page.tsx - use t.xxx
let c=fs.readFileSync(pt.join(b,'app/admin/page.tsx'),'utf8');
c=c.replace('import Layout from"@/components/Layout";','import Layout from"@/components/Layout";\nimport{useLanguage}from"@/context/LanguageContext";');
c=c.replace('export default function AdminDashboard(){','export default function AdminDashboard(){\n  const{t}=useLanguage();');
c=c.replace('"Management Dashboard"','t.managementDashboard');
c=c.replace('"Financial overview &amp; analytics."','t.financialOverview');
c=c.replace('"Total Disbursed"','t.totalDisbursed');
c=c.replace('"Total Repaid"','t.totalRepaid');
c=c.replace('"Outstanding Balance"','t.outstandingBalance');
c=c.replace('"Expected Interest"','t.expectedInterest');
c=c.replace('"Total Loans"','t.totalLoans');
c=c.replace('"Pending"','t.pending');
c=c.replace('"Active"','t.active');
c=c.replace('"Overdue Payments"','t.overduePayments');
c=c.replace('"Individual Debtor Ledger"','t.debtorLedger');
c=c.replace('"Profit &amp; Loss Overview"','t.profitLoss');
c=c.replace('"Expected Interest"','t.expectedInterest');
c=c.replace('"Overdue Exposure"','t.overduePayments');
c=c.replace('"Net Position"','t.outstandingBalance');
fs.writeFileSync(pt.join(b,'app/admin/page.tsx'),c,'utf8');

// admin/loans/page.tsx - use t.xxx
let l=fs.readFileSync(pt.join(b,'app/admin/loans/page.tsx'),'utf8');
l=l.replace('import Layout from"@/components/Layout";','import Layout from"@/components/Layout";\nimport{useLanguage}from"@/context/LanguageContext";');
l=l.replace('export default function AdminLoans(){','export default function AdminLoans(){\n  const{t}=useLanguage();');
l=l.replace('"Loan Management"','t.loanManagement');
l=l.replace('"Borrower"','t.borrower');
l=l.replace('"Status"','t.status');
l=l.replace('"Actions"','t.actions');
l=l.replace('"Disburse"','t.disburse');
fs.writeFileSync(pt.join(b,'app/admin/loans/page.tsx'),l,'utf8');

// staff/page.tsx - use t.xxx
let s2=fs.readFileSync(pt.join(b,'app/staff/page.tsx'),'utf8');
s2=s2.replace('import Layout from"@/components/Layout";','import Layout from"@/components/Layout";\nimport{useLanguage}from"@/context/LanguageContext";');
s2=s2.replace('export default function StaffPortal(){','export default function StaffPortal(){\n  const{t}=useLanguage();');
s2=s2.replace('"Loan Queue"','t.loanQueue');
s2=s2.replace('"Review and process applications."','t.reviewProcess');
s2=s2.replace('"Pending"','t.pending');
s2=s2.replace('"Reviewed"','t.reviewed');
s2=s2.replace('"Total"','t.total');
s2=s2.replace('"No pending applications."','t.noPending');
s2=s2.replace('"None yet."','t.noneYet');
s2=s2.replace('"Amount"','t.amount');
s2=s2.replace('"Period"','t.period');
s2=s2.replace('"Applied"','t.applied');
s2=s2.replace('" Approve"','t.approve');
s2=s2.replace('" Reject"','t.reject');
s2=s2.replace('"Notes (optional)"','t.notes');
fs.writeFileSync(pt.join(b,'app/staff/page.tsx'),s2,'utf8');

// admin/balance/page.tsx - use t.xxx
let bal=fs.readFileSync(pt.join(b,'app/admin/balance/page.tsx'),'utf8');
bal=bal.replace('import Layout from"@/components/Layout";','import Layout from"@/components/Layout";\nimport{useLanguage}from"@/context/LanguageContext";');
bal=bal.replace('export default function CompanyBalance(){','export default function CompanyBalance(){\n  const{t}=useLanguage();');
bal=bal.replace('"Company Balance"','t.companyBalance');
bal=bal.replace('"Track money in and out of the business."','t.trackMoney');
bal=bal.replace('"Current Balance"','t.currentBalance');
bal=bal.replace('"Total In"','t.totalIn');
bal=bal.replace('"Total Out"','t.totalOut');
bal=bal.replace('"Add Entry"','t.addEntry');
bal=bal.replace('"Type"','t.type');
bal=bal.replace('" Money In"','t.moneyIn');
bal=bal.replace('" Money Out"','t.moneyOut');
bal=bal.replace('"Description"','t.description');
bal=bal.replace('"Save Entry"','t.saveEntry');
bal=bal.replace('"No entries yet. Add one above."','t.noEntriesYet');
bal=bal.replace('"Positive"','t.positive');
bal=bal.replace('"Negative"','t.negative');
bal=bal.replace('"Saving"','t.saving');
fs.writeFileSync(pt.join(b,'app/admin/balance/page.tsx'),bal,'utf8');

// admin/borrowers/page.tsx - use t.xxx
let usr=fs.readFileSync(pt.join(b,'app/admin/borrowers/page.tsx'),'utf8');
usr=usr.replace('import Layout from"@/components/Layout";','import Layout from"@/components/Layout";\nimport{useLanguage}from"@/context/LanguageContext";');
usr=usr.replace('export default function AdminUsers(){','export default function AdminUsers(){\n  const{t}=useLanguage();');
usr=usr.replace('"User Management"','t.userManagement');
usr=usr.replace('"Add, edit, restrict or delete users."','t.addEditUsers');
usr=usr.replace('"+ Add User"','t.addUser');
usr=usr.replace('"Edit User"','t.editUser');
usr=usr.replace('"Add New User"','t.addNewUser');
usr=usr.replace('"Role"','t.role');
usr=usr.replace('"Delete User?"','t.deleteUser');
usr=usr.replace('"This will permanently delete the user and all their data."','t.deleteConfirm');
usr=usr.replace('"Yes, Delete"','t.yesDelete');
usr=usr.replace('"Cancel"','t.cancel');
usr=usr.replace('"Save Changes"','t.saveChanges');
usr=usr.replace('"Create User"','t.createUser');
usr=usr.replace('"Active"','t.active_');
usr=usr.replace('"Restricted"','t.restricted');
usr=usr.replace('" Restrict"','t.restrict');
usr=usr.replace('" Activate"','t.activate');
usr=usr.replace('"Make Admin"','t.makeAdmin');
usr=usr.replace('"Make Staff"','t.makeStaff');
usr=usr.replace('"Make Borrower"','t.makeBorrower');
usr=usr.replace('"New Password (leave blank to keep)"','t.newPasswordHint');
usr=usr.replace('"No users yet."','t.noneYet');
fs.writeFileSync(pt.join(b,'app/admin/borrowers/page.tsx'),usr,'utf8');

console.log('All pages translated');