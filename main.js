// Store inventory data in localStorage
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let editingProductId = null;

// Default images for categories
const defaultImages = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
  clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500',
  food: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500',
  other: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500'
};

// DOM Elements
const addProductBtn = document.getElementById('addProductBtn');
const productForm = document.getElementById('productForm');
const inventoryForm = document.getElementById('inventoryForm');
const cancelBtn = document.getElementById('cancelBtn');
const inventoryList = document.getElementById('inventoryList');
const gridView = document.getElementById('gridView');
const inventoryTable = document.getElementById('inventoryTable');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const gridViewBtn = document.getElementById('gridViewBtn');
const tableViewBtn = document.getElementById('tableViewBtn');
const imageFileInput = document.getElementById('productImageFile');
const imageUrlInput = document.getElementById('productImageUrl');
const imagePreviewContainer = document.querySelector('.image-preview-container');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImage');
const modalTitle = document.querySelector('.modal-title');

// Event Listeners
addProductBtn.addEventListener('click', () => {
  editingProductId = null;
  showProductForm('Add New Product');
});
cancelBtn.addEventListener('click', hideProductForm);
inventoryForm.addEventListener('submit', handleProductSubmit);
searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
gridViewBtn.addEventListener('click', () => switchView('grid'));
tableViewBtn.addEventListener('click', () => switchView('table'));
imageFileInput.addEventListener('change', handleImageUpload);
imageUrlInput.addEventListener('input', handleImageUrlInput);
removeImageBtn.addEventListener('click', removeUploadedImage);

// Functions
function showProductForm(title) {
  modalTitle.textContent = title;
  productForm.classList.remove('hidden');
  inventoryForm.reset();
  imagePreviewContainer.classList.add('hidden');
  imagePreview.src = '';
  
  // Remove any existing details section
  const existingDetails = document.querySelector('.product-details-section');
  if (existingDetails) {
    existingDetails.remove();
  }
}

function hideProductForm() {
  productForm.classList.add('hidden');
  removeUploadedImage();
  editingProductId = null;
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.src = e.target.result;
      imagePreviewContainer.classList.remove('hidden');
      imageUrlInput.value = ''; // Clear URL input when file is uploaded
    };
    reader.readAsDataURL(file);
  }
}

function handleImageUrlInput(e) {
  const url = e.target.value;
  if (url) {
    imagePreview.src = url;
    imagePreviewContainer.classList.remove('hidden');
    imageFileInput.value = ''; // Clear file input when URL is entered
  } else {
    imagePreviewContainer.classList.add('hidden');
  }
}

function removeUploadedImage() {
  imageFileInput.value = '';
  imageUrlInput.value = '';
  imagePreview.src = '';
  imagePreviewContainer.classList.add('hidden');
}

async function handleProductSubmit(e) {
  e.preventDefault();

  const category = document.getElementById('productCategory').value;
  let imageUrl = imagePreview.src || imageUrlInput.value || defaultImages[category];

  const product = {
    id: editingProductId || Date.now().toString(),
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    quantity: parseInt(document.getElementById('productQuantity').value),
    category: category,
    image: imageUrl,
    lastModified: new Date().toLocaleString()
  };

  if (editingProductId) {
    // Update existing product
    const index = inventory.findIndex(item => item.id === editingProductId);
    if (index !== -1) {
      inventory[index] = product;
    }
  } else {
    // Add new product
    inventory.push(product);
  }

  saveInventory();
  renderInventory();
  hideProductForm();
}

function saveInventory() {
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

function renderInventory(filteredItems = inventory) {
  // Render Grid View
  gridView.innerHTML = filteredItems.map(item => `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${item.image}" alt="${item.name}" class="product-image">
        <div class="product-price-tag">Rs. ${item.price.toFixed(2)}</div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${item.name}</h3>
        <p class="product-category">${item.category}</p>
        <p class="product-quantity">In Stock: ${item.quantity}</p>
        <p class="product-modified">Last Modified: ${item.lastModified || 'N/A'}</p>
        <div class="product-actions">
          <button class="action-btn edit-btn" onclick="editProduct('${item.id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteProduct('${item.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');

  // Render Table View
  inventoryList.innerHTML = filteredItems.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>Rs. ${item.price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>${item.lastModified || 'N/A'}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editProduct('${item.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteProduct('${item.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const categoryValue = categoryFilter.value;

  const filtered = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm);
    const matchesCategory = !categoryValue || item.category === categoryValue;
    return matchesSearch && matchesCategory;
  });

  renderInventory(filtered);
}

function switchView(view) {
  if (view === 'grid') {
    gridView.classList.remove('hidden');
    inventoryTable.classList.add('hidden');
    gridViewBtn.classList.add('active');
    tableViewBtn.classList.remove('active');
  } else {
    gridView.classList.add('hidden');
    inventoryTable.classList.remove('hidden');
    gridViewBtn.classList.remove('active');
    tableViewBtn.classList.add('active');
  }
}

// Edit and Delete functions
window.editProduct = function(id) {
  const product = inventory.find(item => item.id === id);
  if (!product) return;

  editingProductId = id;
  showProductForm('Edit Product');

  // Populate form fields with product details
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productQuantity').value = product.quantity;
  document.getElementById('productCategory').value = product.category;
  
  if (product.image) {
    imagePreview.src = product.image;
    imagePreviewContainer.classList.remove('hidden');
    if (product.image.startsWith('data:')) {
      imageFileInput.value = ''; // Clear file input for base64 images
      imageUrlInput.value = ''; // Clear URL input for base64 images
    } else {
      imageUrlInput.value = product.image;
      imageFileInput.value = '';
    }
  }

  // Show additional details in the modal
  const detailsSection = document.createElement('div');
  detailsSection.className = 'product-details-section';
  detailsSection.innerHTML = `
    <div class="details-header">Current Product Details</div>
    <div class="details-grid">
      <div class="detail-item">
        <span class="detail-label">Product ID:</span>
        <span class="detail-value">${product.id}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Last Modified:</span>
        <span class="detail-value">${product.lastModified || 'N/A'}</span>
      </div>
    </div>
  `;

  // Insert details section after the form
  const formActions = document.querySelector('.form-actions');
  formActions.parentNode.insertBefore(detailsSection, formActions);
};

window.deleteProduct = function(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    inventory = inventory.filter(item => item.id !== id);
    saveInventory();
    renderInventory();
  }
};

// Initial render
renderInventory();
switchView('grid');