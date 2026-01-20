const parser = require('./node_modules/@babel/parser');
const fs = require('fs');
const code = fs.readFileSync('frontend/src/pages/inventory/AuditLogsPage.jsx', 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('parse ok');
} catch (e) {
  console.error(e.message);
  console.error(e.codeFrame);
}
