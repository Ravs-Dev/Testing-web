// Data Storage
let documents = JSON.parse(localStorage.getItem('documents')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Surat Masuk' },
    { id: 2, name: 'Surat Keluar' },
    { id: 3, name: 'Laporan' },
    { id: 4, name: 'Keuangan' },
    { id: 5, name: 'Kepegawaian' },
    { id: 6, name: 'Lainnya' }
];
let downloadCount = parseInt(localStorage.getItem('downloadCount')) || 0;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkLogin();
    loadDashboard();
    loadDocuments();
    loadCategories();
    updateCategorySelects();
});

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        showApp();
        showToast('Login berhasil!', 'success');
    } else {
        showToast('Username atau password salah!', 'error');
    }
});

function checkLogin() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showApp();
    }
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContainer').classList.add('active');
    const username = localStorage.getItem('username') || 'Administrator';
    document.getElementById('userName').textContent = username;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    location.reload();
});

// Navigation
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.getAttribute('data-page');
        
        document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        document.getElementById(page + 'Page').style.display = 'block';

        const titles = {
            'dashboard': 'Dashboard',
            'documents': 'Dokumen',
            'categories': 'Kategori',
            'settings': 'Pengaturan'
        };
        document.getElementById('pageTitle').textContent = titles[page];

        if (page === 'documents') loadDocuments();
        if (page === 'categories') loadCategories();
        if (page === 'dashboard') loadDashboard();
    });
});

// Mobile Menu
document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
});

// Load Dashboard
function loadDashboard() {
    document.getElementById('totalDocs').textContent = documents.length;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalDownloads').textContent = downloadCount;
    
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    document.getElementById('totalStorage').textContent = (totalSize / 1024 / 1024).toFixed(2) + ' MB';

    // Recent Documents
    const recentDocs = documents.slice(-5).reverse();
    const recentContainer = document.getElementById('recentDocs');
    
    if (recentDocs.length === 0) {
        recentContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Belum ada dokumen</h3>
                <p>Upload dokumen pertama Anda</p>
            </div>
        `;
    } else {
        recentContainer.innerHTML = recentDocs.map(doc => createDocumentItem(doc)).join('');
    }
}

// Load Documents
function loadDocuments() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;

    let filtered = documents.filter(doc => {
        const matchSearch = doc.title.toLowerCase().includes(searchTerm) || 
                           doc.description.toLowerCase().includes(searchTerm);
        const matchCategory = !categoryFilter || doc.categoryId == categoryFilter;
        return matchSearch && matchCategory;
    });

    const container = document.getElementById('allDocs');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Tidak ada dokumen</h3>
                <p>Coba ubah filter pencarian</p>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(doc => createDocumentItem(doc)).join('');
    }
}

// Create Document Item
function createDocumentItem(doc) {
    const category = categories.find(c => c.id == doc.categoryId);
    const iconClass = getFileIconClass(doc.fileType);
    const date = new Date(doc.uploadDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return `
        <div class="document-item">
            <div class="doc-icon ${iconClass}">
                <i class="fas ${getFileIcon(doc.fileType)}"></i>
            </div>
            <div class="doc-info">
                <h4>${doc.title}</h4>
                <p>${doc.description || 'Tidak ada deskripsi'}</p>
                <div class="doc-meta">
                    <span><i class="fas fa-folder"></i> ${category ? category.name : 'Lainnya'}</span>
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-hdd"></i> ${(doc.size / 1024).toFixed(2)} KB</span>
                </div>
            </div>
            <div class="doc-actions">
                <button class="btn-icon download" onclick="downloadDoc(${doc.id})" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteDoc(${doc.id})" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function getFileIconClass(fileType) {
    if (fileType === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(fileType)) return 'doc';
    if (['xls', 'xlsx'].includes(fileType)) return 'xls';
    if (['jpg', 'jpeg', 'png'].includes(fileType)) return 'img';
    return 'other';
}

function getFileIcon(fileType) {
    if (fileType === 'pdf') return 'fa-file-pdf';
    if (['doc', 'docx'].includes(fileType)) return 'fa-file-word';
    if (['xls', 'xlsx'].includes(fileType)) return 'fa-file-excel';
    if (['ppt', 'pptx'].includes(fileType)) return 'fa-file-powerpoint';
    if (['jpg', 'jpeg', 'png'].includes(fileType)) return 'fa-file-image';
    if (['zip', 'rar'].includes(fileType)) return 'fa-file-archive';
    return 'fa-file';
}

// Load Categories
function loadCategories() {
    const container = document.getElementById('categoryList');
    container.innerHTML = categories.map(cat => {
        const count = documents.filter(d => d.categoryId == cat.id).length;
        return `
            <div class="document-item">
                <div class="doc-icon other">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="doc-info">
                    <h4>${cat.name}</h4>
                    <p>${count} dokumen</p>
                </div>
                <div class="doc-actions">
                    <button class="btn-icon delete" onclick="deleteCategory(${cat.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Update Category Selects
function updateCategorySelects() {
    const selects = [document.getElementById('filterCategory'), document.getElementById('docCategory')];
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Semua Kategori</option>';
        if (select.id === 'docCategory') {
            select.innerHTML = '<option value="">Pilih Kategori</option>';
        }
        categories.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
        select.value = currentValue;
    });
}

// Search & Filter
document.getElementById('searchInput').addEventListener('input', loadDocuments);
document.getElementById('filterCategory').addEventListener('change', loadDocuments);

// Upload Modal
document.getElementById('uploadBtn').addEventListener('click', function() {
    document.getElementById('uploadModal').classList.add('active');
});

document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('uploadModal').classList.remove('active');
});

document.getElementById('fileUpload').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.querySelector('#fileUpload p').textContent = file.name;
    }
});

// Upload Form
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const file = document.getElementById('fileInput').files[0];
    if (!file) {
        showToast('Pilih file terlebih dahulu!', 'error');
        return;
    }

    const title = document.getElementById('docTitle').value;
    const description = document.getElementById('docDescription').value;
    const categoryId = document.getElementById('docCategory').value;

    const fileType = file.name.split('.').pop().toLowerCase();
    
    const newDoc = {
        id: Date.now(),
        title: title,
        description: description,
        fileName: file.name,
        fileType: fileType,
        size: file.size,
        categoryId: categoryId,
        uploadDate: new Date().toISOString()
    };

    documents.push(newDoc);
    localStorage.setItem('documents', JSON.stringify(documents));

    // Reset form
    document.getElementById('uploadForm').reset();
    document.querySelector('#fileUpload p').textContent = 'Klik untuk pilih file atau drag & drop';
    document.getElementById('uploadModal').classList.remove('active');

    loadDocuments();
    loadDashboard();
    showToast('Dokumen berhasil diupload!', 'success');
});

// Download Document
function downloadDoc(id) {
    const doc = documents.find(d => d.id === id);
    if (doc) {
        downloadCount++;
        localStorage.setItem('downloadCount', downloadCount);
        loadDashboard();
        showToast(`Downloading: ${doc.fileName}`, 'success');
    }
}

// Delete Document
function deleteDoc(id) {
    if (confirm('Yakin ingin menghapus dokumen ini?')) {
        documents = documents.filter(d => d.id !== id);
        localStorage.setItem('documents', JSON.stringify(documents));
        loadDocuments();
        loadDashboard();
        showToast('Dokumen berhasil dihapus!', 'success');
    }
}

// Add Category
document.getElementById('addCategoryBtn').addEventListener('click', function() {
    const name = prompt('Masukkan nama kategori:');
    if (name && name.trim()) {
        const newCategory = {
            id: Date.now(),
            name: name.trim()
        };
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategories();
        updateCategorySelects();
        showToast('Kategori berhasil ditambahkan!', 'success');
    }
});

// Delete Category
function deleteCategory(id) {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategories();
        updateCategorySelects();
        showToast('Kategori berhasil dihapus!', 'success');
    }
}

// Toast Notification
function showToast(message, type) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    toast.className = 'toast active ' + type;
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#11998e';
    } else {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#eb3349';
    }

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}
