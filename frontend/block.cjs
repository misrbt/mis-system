const fs=require('fs');const lines=fs.readFileSync('frontend/src/pages/inventory/AuditLogsPage.jsx','utf8').split(/\n/);for(let i=948;i<972;i++){console.log((i+1)+':'+lines[i]);}
