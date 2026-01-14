const fs = require('fs');
const lines = fs.readFileSync('frontend/src/pages/inventory/AuditLogsPage.jsx','utf8').split(/\n/);
for(let i=1420;i<1436;i++) console.log((i+1)+':'+lines[i]);
