const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(express.static('.'));

const ensureIndexHtmlExists = () => {
  const publicHtmlPath = path.join(__dirname, 'public', 'index.html');
  const templateHtmlPath = path.join(__dirname, 'public', 'sample', 'index.html');
  
  if (!fs.existsSync(publicHtmlPath)) {
    console.log('index.html not found in public directory. Copying from sample template...');
    fs.copyFileSync(templateHtmlPath, publicHtmlPath);
    console.log('index.html copied successfully.');
  }
};

const getTemplates = () => {
  const templatesDir = path.join(__dirname, 'templates');
  return fs.readdirSync(templatesDir).filter(file => {
    return fs.statSync(path.join(templatesDir, file)).isDirectory();
  });
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/templates', (req, res) => {
  const templates = getTemplates();
  res.json(templates);
});

app.post('/apply-template', (req, res) => {
  const {template} = req.body;
  const templatesDir = path.join(__dirname, 'templates', template);
  const publicDir = path.join(__dirname, 'public');
  
  const templateHtmlPath = path.join(templatesDir, 'index.html');
  const publicHtmlPath = path.join(publicDir, 'index.html');
  
  fs.readFile(templateHtmlPath, 'utf8', (err, templateHtml) => {
    if (err) {
      console.error('Error reading template file:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    fs.readFile(publicHtmlPath, 'utf8', (err, publicHtml) => {
      if (err) {
        console.error('Error reading public file:', err);
        return res.status(500).send('Internal Server Error');
      }
      
      const templateDom = new JSDOM(templateHtml);
      const templateContainer = templateDom.window.document.querySelector('.container').innerHTML;
      
      const publicDom = new JSDOM(publicHtml);
      publicDom.window.document.querySelector('.container').innerHTML = templateContainer;
      
      const updatedHtml = publicDom.serialize();
      fs.writeFile(publicHtmlPath, updatedHtml, (err) => {
        if (err) {
          console.error('Error writing public file:', err);
          return res.status(500).send('Internal Server Error');
        }
        
        const srcStylePath = path.join(templatesDir, 'styles.css');
        const destStylePath = path.join(publicDir, 'styles.css');
        fs.copyFileSync(srcStylePath, destStylePath);
        
        res.send('Template applied successfully!');
      });
    });
  });
});

app.post('/save', (req, res) => {
  const newContent = req.body.content;
  
  const filePath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(filePath, 'utf8', (err, html) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    document.querySelector('.container').innerHTML = newContent;
    const updatedHtml = dom.serialize();
    fs.writeFile(filePath, updatedHtml, (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.send('File saved successfully');
    });
  });
});

app.get('/download-pdf', async (req, res) => {
  try {
    const scale = parseFloat(req.query.scale) || 1.0;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}/editor`, {waitUntil: 'networkidle0'});
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {top: '0px', bottom: '0px', left: '0px', right: '0px'},
      scale: scale
    });
    
    await browser.close();
    
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.use(express.static('public'));

app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

ensureIndexHtmlExists();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
