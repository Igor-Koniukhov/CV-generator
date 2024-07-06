const puppeteer = require("puppeteer");
const path = require("path");
const {getTemplates} = require('../utils/helpers')
const fs = require("fs");
const {JSDOM} = require("jsdom");
const archiver = require('archiver');
const {glob} = require('glob')
const temp = require('temp');
const {PORT} = require('../utils/constants')
const cheerio = require('cheerio');

const downloadPdfHandler = async (req, res) => {
  try {
    const scale = parseFloat(req.query.scale) || 1.0;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}/editor`, {waitUntil: 'networkidle0'});
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      width: '210mm',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {top: 0, bottom: 0, left: 0, right: 0},
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
}

const downloadCompressedFileHandler = async (req, res) => {
  
  const tempFilePath = temp.path({ suffix: '.zip' });
  const output = fs.createWriteStream(tempFilePath);
  const archive = archiver('zip', {
    zlib: {level: 9}
  })
  
  output.on('close', () => {
    res.download(tempFilePath, 'compressed.zip', (err) => {
      if (err) {
        console.error(err)
      }
      fs.unlink(tempFilePath, (err)=>{
        if(err){
          console.error(err)
        }
      })
    })
  })
  
  archive.on('error', (err) => {
    throw err
  })
  
  archive.pipe(output)
  
 const files = await glob(["public/*.{html,css}"]);
  files.forEach(file => {
    let fileContent = fs.readFileSync(file, 'utf8');
    
    if (path.extname(file) === '.html') {
      // Load the HTML content using cheerio
      const $ = cheerio.load(fileContent);
      
      // Remove the specified elements
      $('#download-pdf, #scale-slider, #scale-value, .back-button, #download-btn, .back-button').remove();
      
      // Get the modified HTML content
      fileContent = $.html();
    }
    
    // Write the modified content to a temporary file
    const tempFile = temp.path({ suffix: path.extname(file) });
    fs.writeFileSync(tempFile, fileContent);
    
    // Add the temporary file to the archive
    archive.file(tempFile, { name: path.relative('public', file) });
  });
  
  archive.finalize();
}

const applyTemplateHandler = (req, res) => {
  const {template} = req.body;
  const templatesDir = path.join(__dirname, '../templates', template);
  const publicDir = path.join(__dirname, '../public');
  
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
}

const saveTemplateChangesHandler = (req, res) => {
  const newContent = req.body.content;
  
  const filePath = path.join(__dirname, '../public', 'index.html');
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
}
const renderHomePageHandler = (req, res) => {
  res.sendFile(path.join(__dirname, "../", 'index.html'));
}

const templateHandler = (req, res) => {
  const templates = getTemplates();
  res.json(templates);
}

const editorHandler = (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
}

module.exports = {
  downloadPdfHandler,
  editorHandler,
  renderHomePageHandler,
  templateHandler,
  applyTemplateHandler,
  saveTemplateChangesHandler,
  downloadCompressedFileHandler
}