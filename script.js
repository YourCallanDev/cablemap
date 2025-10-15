let canvas = new fabric.Canvas('cableCanvas', {
  isDrawingMode: false,
  backgroundColor: '#202020'
});

canvas.setHeight(window.innerHeight - 180);
canvas.setWidth(window.innerWidth);

let currentColor = '#ff0000';
let drawingMode = 'free';
let isDrawing = false;
let startX, startY;
let currentLine;

// Resize handling
window.addEventListener('resize', () => {
  canvas.setHeight(window.innerHeight - 180);
  canvas.setWidth(window.innerWidth);
  canvas.renderAll();
});

// Handle tool change
document.getElementById('toolSelect').onchange = (e) => {
  drawingMode = e.target.value;
  canvas.isDrawingMode = drawingMode === 'free';
};

// Handle colour change
document.getElementById('colourSelect').onchange = (e) => {
  currentColor = e.target.value;
  canvas.freeDrawingBrush.color = currentColor;
};

document.getElementById('customColor').oninput = (e) => {
  currentColor = e.target.value;
  canvas.freeDrawingBrush.color = currentColor;
};

// Drawing logic
canvas.on('mouse:down', function(o) {
  if (drawingMode === 'line' || drawingMode === 'curve') {
    isDrawing = true;
    const pointer = canvas.getPointer(o.e);
    startX = pointer.x;
    startY = pointer.y;
    currentLine = new fabric.Path(`M ${startX} ${startY}`, {
      stroke: currentColor,
      strokeWidth: 3,
      fill: '',
      selectable: false
    });
    canvas.add(currentLine);
  }
});

canvas.on('mouse:move', function(o) {
  if (!isDrawing) return;
  const pointer = canvas.getPointer(o.e);
  if (drawingMode === 'line') {
    currentLine.path = [
      ['M', startX, startY],
      ['L', pointer.x, pointer.y]
    ];
  } else if (drawingMode === 'curve') {
    currentLine.path = [
      ['M', startX, startY],
      ['Q', (startX + pointer.x) / 2, (startY + pointer.y) / 2 - 50, pointer.x, pointer.y]
    ];
  }
  canvas.renderAll();
});

canvas.on('mouse:up', () => { isDrawing = false; });

// File upload (image only)
document.getElementById('fileUpload').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(f) {
    fabric.Image.fromURL(f.target.result, function(img) {
      img.scaleToWidth(canvas.width);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  };
  reader.readAsDataURL(file);
};

// Save and Load
document.getElementById('saveBtn').onclick = () => {
  const data = JSON.stringify(canvas.toJSON());
  localStorage.setItem('cablemapSave', data);
  alert('Plan saved locally!');
};

document.getElementById('loadBtn').onclick = () => {
  const data = localStorage.getItem('cablemapSave');
  if (data) canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
  else alert('No saved plan found.');
};

// Export
document.getElementById('exportBtn').onclick = () => {
  const link = document.createElement('a');
  link.download = 'CableMap.png';
  link.href = canvas.toDataURL({ format: 'png' });
  link.click();
};

// Clear canvas
document.getElementById('clearBtn').onclick = () => {
  if (confirm('Clear the entire canvas?')) canvas.clear();
};
