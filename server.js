const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(express.static('public'));

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
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
