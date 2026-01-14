const fs=require('fs');const code=fs.readFileSync('frontend/src/pages/inventory/AuditLogsPage.jsx','utf8');const idx=59273;console.log(code.slice(idx-50, idx+50));
