fetch('/templates').then(response => response.json()).then(templates => {
  const container = document.querySelector('.template-container');
  templates.forEach(template => {
    const div = document.createElement('div');
    div.className = 'template-icon';
    div.setAttribute('data-template', template);
    div.innerHTML = `
                    <img src="/templates/${template}/thumbnail.png" alt="${template}">
                    <p>${template}</p>
                `;
    div.addEventListener('click', () => {
      fetch('/apply-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template })
      }).then(response => response.text())
        .then(data => {
          alert(data);
          window.location.href = '/editor';
        });
    });
    container.appendChild(div);
  });
});