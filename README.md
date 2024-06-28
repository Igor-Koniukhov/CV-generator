# CV Generator
- CV PDF Format Generator from HTML Templates. Allows users to choose from multiple CV templates. The chosen template
  can be customized by editing fields with necessary data. All changes can be saved and the final CV can be downloaded
  in PDF format.

## For starting:
```bash
npm install
```

- in the root of the project:

```bash
node server.js
```
  
### How to Add a New Template
1. Create a Directory:
- In the templates directory, create a new folder with your template name.
2. Add Necessary Files:
- In your new directory, add three files: index.html, styles.css, and thumbnail.png.
3. Structure the HTML Content:
- Ensure that all content in the body of index.html is wrapped in a <div> with the class container.
4. Mark Editable Sections:
- Any section within the container that can be edited should have the class editable.
#### Structure sample:
```
/templates/
  /your-template-name/
    index.html
    styles.css
    thumbnail.png

```

#### Example of index.html with necessary classes:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Template Name</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="editable">
            <h1>Your Name</h1>
            <p>Contact Information</p>
        </header>
        <section class="editable">
            <h2>Profile</h2>
            <p>Your profile description here.</p>
        </section>
        <!-- Add more sections as needed -->
    </div>
</body>
</html>
```