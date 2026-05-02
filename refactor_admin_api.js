const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'admin-web', 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import axios from 'axios'
  content = content.replace(/import axios from 'axios';/g, "import axios from '../axios';");

  // Remove the base URL from regular strings
  content = content.replace(/'http:\/\/localhost:5000\/api/g, "'");

  // Remove the base URL from template literals
  content = content.replace(/`http:\/\/localhost:5000\/api/g, "`");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Refactored ${file}`);
});
