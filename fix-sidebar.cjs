const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content
    .replace(/bg-\[#0B1120\]/g, 'bg-sidebar')
    .replace(/bg-\[#0F172A\]/g, 'bg-sidebar')
    .replace(/text-slate-300/g, 'text-sidebar-foreground')
    .replace(/border-slate-800\/50/g, 'border-sidebar-border')
    .replace(/border-slate-800/g, 'border-sidebar-border')
    .replace(/bg-slate-800/g, 'bg-sidebar-accent')
    .replace(/bg-slate-700/g, 'bg-sidebar-accent/80');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
}

processFile(path.join(process.cwd(), 'src/apps/admin/components/Sidebar.tsx'));
processFile(path.join(process.cwd(), 'src/apps/admin/AdminLayout.tsx'));
