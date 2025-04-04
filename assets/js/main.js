
AOS.init({
  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 900, // values from 0 to 3000, with step 50ms
  easing: 'ease', // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

});

document.addEventListener("DOMContentLoaded", function () {

  // Criar o mapa 
  var map = L.map('map', {
    center: [-22.1256, -51.3925], // Coordenadas do centro de Presidente Prudente
    zoom: 13,
  });


  // Adicionar os tiles do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Ícone personalizado para o ponto de coleta
  var pointIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/684/684908.png', // Ícone de ponto
    iconSize: [32, 32],  // Tamanho do ícone
    iconAnchor: [16, 32], // Posição da âncora do ícone
    popupAnchor: [0, -32] // Posição do popup em relação ao ícone
  });

  // Adicionar um marcador no SENAI
  L.marker([-22.1206, -51.4059], { icon: pointIcon }).addTo(map)
    .bindPopup("📍 Ponto de Coleta - SENAI Presidente Prudente");
});

document.getElementById("map-container").addEventListener("click", function () {
  let mapDiv = document.getElementById("map");
  let container = document.getElementById("map-container");

  if (!container.classList.contains("expanded")) {
    // Expandindo o mapa
    container.classList.add("expanded");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.zIndex = "9999";
    mapDiv.style.borderRadius = "0"; // Removendo o border-radius ao expandir
  } else {
    // Revertendo a expansão
    container.classList.remove("expanded");
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.height = "400px";
    mapDiv.style.borderRadius = "10%"; // Restaurando o border-radius
  }
});



// Pré-visualização da imagem selecionada
document.querySelector('input[type="file"]').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const preview = document.getElementById('preview-img');
    const previewDiv = document.getElementById('preview');
    const fileInfo = document.getElementById('file-info');

    preview.src = URL.createObjectURL(file);
    fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    previewDiv.style.display = 'block';
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('preview');
  const previewImg = document.getElementById('preview-img');
  const fileInfo = document.getElementById('file-info');
  const uploadForm = document.getElementById('uploadForm');
  const uploadStatus = document.getElementById('uploadStatus');

  // Preview da imagem
  fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      previewImg.src = URL.createObjectURL(file);
      fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
      preview.style.display = 'block';
    }
  });

  // Envio via AJAX para melhor feedback
  uploadForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const file = fileInput.files[0];

    if (!file) {
      uploadStatus.innerHTML = '<div class="alert alert-danger">Por favor, selecione uma imagem</div>';
      return;
    }

    uploadStatus.innerHTML = '<div class="alert alert-info">Enviando imagem...</div>';

    fetch(this.action, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          uploadStatus.innerHTML = `<div class="alert alert-danger">Erro: ${data.error}</div>`;
        } else {
          uploadStatus.innerHTML = `
                  <div class="alert alert-success">
                      Upload bem-sucedido!<br>
                      <a href="${data.caminho}" target="_blank">Ver imagem</a>
                  </div>`;
        }
      })
      .catch(error => {
        uploadStatus.innerHTML = `<div class="alert alert-danger">Erro: ${error.message}</div>`;
      });
  });
});

document.getElementById('uploadForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Por favor, selecione uma imagem antes de enviar!');
    return;
  }

  // Exibe a imagem selecionada
  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('imagePreview').innerHTML = `
          <h5 class="mt-3">Pré-visualização:</h5>
          <img src="${e.target.result}" class="img-thumbnail" style="max-height: 300px;">
          <p>${file.name} (${(file.size / 1024).toFixed(2)} KB)</p>
      `;
  };
  reader.readAsDataURL(file);

  // Envia para o backend
  const formData = new FormData();
  formData.append('avatar', file);

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      alert('Imagem enviada com sucesso!');
      console.log('Resposta do servidor:', data);
    })
    .catch(error => {
      alert('Erro ao enviar imagem: ' + error.message);
      console.error('Erro:', error);
    });
});

// Mostra a imagem imediatamente quando selecionada
document.getElementById('fileInput').addEventListener('change', function (e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      document.getElementById('imagePreview').innerHTML = `
              <h5 class="mt-3">Pré-visualização:</h5>
              <img src="${event.target.result}" class="img-thumbnail" style="max-height: 300px;">
              <p>${file.name} (${(file.size / 1024).toFixed(2)} KB)</p>
          `;
    };

    reader.readAsDataURL(file);
  }
});