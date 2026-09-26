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

// ==========================================
// LOGIN (DIPERBAIKI: Menggunakan .trim() agar spasi tidak mengganggu)
// ==========================================
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // .trim() menghapus spasi di awal/akhir, .toLowerCase() mengubah ke huruf kecil
    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value.trim();

    console.log("Mencoba login dengan:", { username, password }); // Untuk debugging di Console

    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', 'Administrator');
        showApp();
        showToast('Login berhasil! Selamat datang.', 'success');
    } else {
        showToast('Username atau password salah! (Gunakan: admin / admin123)', 'error');
        document.getElementById('loginPassword').value = ''; // Reset password field
    }
});

function checkLogin() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showApp();
    }
}

function showApp() {
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (appContainer) appContainer.classList.add('active');
    
    const username = localStorage.getItem('username') || 'Administrator';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = username;
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
        const targetPage = document.getElementById(page + 'Page');
        if (targetPage) targetPage.style.display = 'block';

        const titles = {
            'dashboard': 'Dashboard',
            'documents': 'Dokumen',
            'categories': 'Kategori',
            'settings': 'Pengaturan'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

        if (page === 'documents') loadDocuments();
        if (page === 'categories') loadCategories();
        if (page === 'dashboard') loadDashboard();
        
        // Close mobile menu if open
        document.getElementById('sidebar').classList.remove('active');
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
                           (doc.description && doc.description.toLowerCase().includes(searchTerm));
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
        day: 'numeric', month: 'short', year: 'numeric'
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
                    <button class="btn-icon delete" onclick="deleteCategory(${cat
