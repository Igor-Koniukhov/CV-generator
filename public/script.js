document.addEventListener('DOMContentLoaded', () => {
  let scale = 1.0;
  
  const makeEditable = (element) => {
    element.contentEditable = true;
    element.focus();
    
    document.querySelectorAll('.buttons').forEach(btn => btn.remove());
    
    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'btn-save'
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
      element.contentEditable = false;
      buttons.remove();
      saveChanges();
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn-cancel'
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      element.innerHTML = element.originalContent;
      element.contentEditable = false;
      buttons.remove();
    });
    
    buttons.appendChild(cancelButton);
    buttons.appendChild(saveButton);
    element.appendChild(buttons);
    
    element.addEventListener('blur', (event) => {
      if (!element.contains(event.relatedTarget)) {
        element.contentEditable = false;
        buttons.remove();
      }
    });
    
    buttons.addEventListener('focusout', (event) => {
      if (!element.contains(event.relatedTarget)) {
        element.contentEditable = false;
        buttons.remove();
      }
    });
  };
  
  const saveChanges = () => {
    const containerContent = document.querySelector('.container').innerHTML;
    fetch('/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({content: containerContent}),
    })
      .then(response => response.text())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error saving changes:', error);
      });
  };
  
  document.querySelectorAll('.editable').forEach((element) => {
    element.addEventListener('dblclick', () => {
      if (!element.isEditing) {
        element.isEditing = true;
        element.originalContent = element.innerHTML;
        makeEditable(element);
      }
    });
    
    element.addEventListener('focusout', (event) => {
      if (!element.contains(event.relatedTarget)) {
        element.isEditing = false;
      }
    });
  });
  
  document.getElementById('download-pdf').addEventListener('click', () => {
    window.open(`/download-pdf?scale=${scale}`, '_blank');
  });
  
  const scaleSlider = document.getElementById('scale-slider');
  const scaleValue = document.getElementById('scale-value');
  scaleSlider.addEventListener('input', (event) => {
    scale = event.target.value;
    scaleValue.textContent = scale;
  });
});
