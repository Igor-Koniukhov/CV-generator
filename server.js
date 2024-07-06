const express = require('express');
const bodyParser = require('body-parser');
const {ensureIndexHtmlExists} = require('./utils/helpers')
const {PORT}=require('./utils/constants')
const {
  downloadPdfHandler,
  editorHandler,
  renderHomePageHandler,
  templateHandler,
  applyTemplateHandler,
  saveTemplateChangesHandler,
  downloadCompressedFileHandler
} = require('./handlers/handlers')

const app = express();


app.use(bodyParser.json());
app.use(express.static('.'));

app.get('/', renderHomePageHandler);
app.get('/templates', templateHandler);
app.post('/apply-template', applyTemplateHandler);
app.post('/save', saveTemplateChangesHandler );
app.get('/download-pdf', downloadPdfHandler);

app.use(express.static('public'));
app.get('/editor', editorHandler);
app.get('/download', downloadCompressedFileHandler)

ensureIndexHtmlExists();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
