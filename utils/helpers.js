const fs = require('fs');
const path = require('path');

const getTemplates = () => {
  const templatesDir = path.join(__dirname, '../templates');
  return fs.readdirSync(templatesDir).filter(file => {
    return fs.statSync(path.join(templatesDir, file)).isDirectory();
  });
};
const ensureIndexHtmlExists = () => {
  const publicHtmlPath = path.join(__dirname, '../public', 'index.html');
  const templateHtmlPath = path.join(__dirname, '../public', 'sample', 'index.html');
  
  if (!fs.existsSync(publicHtmlPath)) {
    console.log('index.html not found in public directory. Copying from sample template...');
    fs.copyFileSync(templateHtmlPath, publicHtmlPath);
    console.log('index.html copied successfully.');
  }
};


module.exports = {getTemplates, ensureIndexHtmlExists}