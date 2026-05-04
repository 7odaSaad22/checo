// ===== Cheko Fotoshope - Main Application =====

// --- Database (localStorage) ---
const DB = {
    getClients() {
        return JSON.parse(localStorage.getItem('cheko_clients') || '[]');
    },
    saveClients(clients) {
        localStorage.setItem('cheko_clients', JSON.stringify(clients));
    },
    addClient(client) {
        const clients = this.getClients();
        client.id = Date.now().toString();
        client.createdAt = new Date().toISOString();
        clients.push(client);
        this.saveClients(clients);
        return client;
    },
    deleteClient(id) {
        const clients = this.getClients().filter(c => c.id !== id);
        this.saveClients(clients);
    },
    updateClient(id, data) {
        const clients = this.getClients();
        const idx = clients.findIndex(c => c.id === id);
        if (idx !== -1) {
            clients[idx] = { ...clients[idx], ...data };
            this.saveClients(clients);
        }
    },
    findClient(query) {
        const q = query.trim().toLowerCase();
        return this.getClients().filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q)
        );
    },
    getPortfolio() {
        return JSON.parse(localStorage.getItem('cheko_portfolio') || '[]');
    },
    savePortfolio(items) {
        localStorage.setItem('cheko_portfolio', JSON.stringify(items));
    },
    addPortfolioItem(item) {
        const items = this.getPortfolio();
        item.id = Date.now().toString();
        items.push(item);
        this.savePortfolio(items);
        return item;
    },
    deletePortfolioItem(id) {
        const items = this.getPortfolio().filter(i => i.id !== id);
        this.savePortfolio(items);
    },
    getSettings() {
        return JSON.parse(localStorage.getItem('cheko_settings') || '{}');
    },
    saveSettings(settings) {
        localStorage.setItem('cheko_settings', JSON.stringify(settings));
    },
    getAdminPassword() {
        return localStorage.getItem('cheko_admin_pass') || 'admin123';
    },
    setAdminPassword(pass) {
        localStorage.setItem('cheko_admin_pass', pass);
    }
};

// --- Loading Screen ---
window.addEventListener('load', () => {
    const loader = document.querySelector('.loading-screen');
    if (loader) {
        setTimeout(() => loader.classList.add('hidden'), 800);
    }
});

// --- Navbar Scroll ---
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
});

// --- Mobile Menu ---
function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            toggle.classList.toggle('active');
        });
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('open');
                toggle.classList.remove('active');
            });
        });
    }
}

// --- Notification ---
function showNotification(message, isError = false) {
    let notif = document.querySelector('.notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerHTML = `<i class="fas fa-check-circle"></i><p></p>`;
        document.body.appendChild(notif);
    }
    notif.classList.toggle('error', isError);
    notif.querySelector('i').className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    notif.querySelector('p').textContent = message;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
}

// --- Particles ---
function createParticles() {
    const container = document.querySelector('.hero-bg-particles');
    if (!container) return;
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.animationDuration = (4 + Math.random() * 4) + 's';
        p.style.width = (2 + Math.random() * 4) + 'px';
        p.style.height = p.style.width;
        container.appendChild(p);
    }
}

// --- Fade In Animations ---
function initFadeIn() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// --- Google Drive Helpers ---
function extractDriveId(url) {
    // Supports various Google Drive URL formats
    const patterns = [
        /\/d\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/,
        /\/folders\/([a-zA-Z0-9_-]+)/
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

function getDriveThumbnail(fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

function getDriveDirectLink(fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// --- Check if session is expired ---
function isSessionExpired(expiryDate) {
    if (!expiryDate) return false;
    return new Date() > new Date(expiryDate);
}

// --- Time remaining ---
function getTimeRemaining(expiryDate) {
    const now = new Date();
    const end = new Date(expiryDate);
    const diff = end - now;
    if (diff <= 0) return 'منتهي';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} يوم و ${hours} ساعة`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعة و ${mins} دقيقة`;
}

// --- Format Date ---
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ===== SESSIONS PAGE =====
function initSessionsPage() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('clientSearch');
    if (!searchBtn || !searchInput) return;

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') performSearch();
    });
}

function performSearch() {
    const query = document.getElementById('clientSearch').value.trim();
    if (!query) {
        showNotification('من فضلك اكتب اسمك أو رقم هاتفك', true);
        return;
    }

    const results = DB.findClient(query);
    const resultsDiv = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const expiredDiv = document.getElementById('sessionExpired');
    const photosGrid = document.getElementById('photosGrid');
    const timerSpan = document.getElementById('remainingTime');
    const clientNameSpan = document.getElementById('resultClientName');

    // Hide all
    resultsDiv.classList.remove('active');
    noResults.classList.remove('active');
    expiredDiv.classList.remove('active');

    if (results.length === 0) {
        noResults.classList.add('active');
        return;
    }

    const client = results[0];

    // Check expiry
    if (isSessionExpired(client.expiryDate)) {
        expiredDiv.classList.add('active');
        return;
    }

    // Show results
    clientNameSpan.textContent = client.name;
    timerSpan.textContent = getTimeRemaining(client.expiryDate);

    // Display photos
    photosGrid.innerHTML = '';

    if (client.photos && client.photos.length > 0) {
        client.photos.forEach((photo, idx) => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.innerHTML = `
                <img src="${photo.thumbnail || photo.url}" alt="صورة ${idx + 1}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22><rect fill=%22%23141414%22 width=%22400%22 height=%22400%22/><text fill=%22%23888%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22>📷</text></svg>'">
                <a href="${photo.url}" target="_blank" class="download-btn" title="فتح الصورة">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            `;
            card.querySelector('img').addEventListener('click', () => openLightbox(photo.thumbnail || photo.url));
            photosGrid.appendChild(card);
        });
    }

    // If drive link exists, show it
    if (client.driveLink) {
        const driveCard = document.createElement('div');
        driveCard.style.gridColumn = '1 / -1';
        driveCard.style.textAlign = 'center';
        driveCard.style.padding = '20px';
        driveCard.innerHTML = `
            <a href="${client.driveLink}" target="_blank" class="btn-secondary" style="display:inline-flex">
                <i class="fab fa-google-drive"></i>
                فتح مجلد الصور على Google Drive
            </a>
        `;
        photosGrid.appendChild(driveCard);
    }

    resultsDiv.classList.add('active');

    // Update timer every minute
    if (window._timerInterval) clearInterval(window._timerInterval);
    window._timerInterval = setInterval(() => {
        if (isSessionExpired(client.expiryDate)) {
            clearInterval(window._timerInterval);
            resultsDiv.classList.remove('active');
            expiredDiv.classList.add('active');
        } else {
            timerSpan.textContent = getTimeRemaining(client.expiryDate);
        }
    }, 60000);
}

// --- Lightbox ---
function openLightbox(src) {
    let lb = document.querySelector('.lightbox');
    if (!lb) {
        lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.innerHTML = `
            <button class="lightbox-close"><i class="fas fa-times"></i></button>
            <img src="" alt="صورة">
        `;
        lb.addEventListener('click', e => {
            if (e.target === lb || e.target.closest('.lightbox-close')) {
                lb.classList.remove('active');
            }
        });
        document.body.appendChild(lb);
    }
    lb.querySelector('img').src = src;
    lb.classList.add('active');
}

// ===== ADMIN PAGE =====
function initAdminPage() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginSection = document.getElementById('adminLogin');
    const dashboard = document.getElementById('adminDashboard');
    
    if (!loginForm) return;

    // Check if already logged in
    if (sessionStorage.getItem('admin_logged') === 'true') {
        loginSection.style.display = 'none';
        dashboard.classList.add('active');
        loadDashboard();
    }

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const pass = document.getElementById('adminPass').value;
        if (pass === DB.getAdminPassword()) {
            sessionStorage.setItem('admin_logged', 'true');
            loginSection.style.display = 'none';
            dashboard.classList.add('active');
            loadDashboard();
            showNotification('تم تسجيل الدخول بنجاح');
        } else {
            showNotification('كلمة المرور غير صحيحة', true);
        }
    });

    // Tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).style.display = 'block';
        });
    });

    // Add Client Form
    const addClientForm = document.getElementById('addClientForm');
    if (addClientForm) {
        addClientForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('clientName').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const driveLink = document.getElementById('clientDriveLink').value.trim();
            const duration = parseInt(document.getElementById('clientDuration').value);
            const durationUnit = document.getElementById('clientDurationUnit').value;
            const notes = document.getElementById('clientNotes').value.trim();
            const photoLinks = document.getElementById('clientPhotoLinks').value.trim();

            if (!name || !phone) {
                showNotification('من فضلك أدخل اسم العميل ورقم الهاتف', true);
                return;
            }

            // Calculate expiry
            const now = new Date();
            let expiryDate;
            switch (durationUnit) {
                case 'hours':
                    expiryDate = new Date(now.getTime() + duration * 60 * 60 * 1000);
                    break;
                case 'days':
                    expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
                    break;
                case 'weeks':
                    expiryDate = new Date(now.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'months':
                    expiryDate = new Date(now.setMonth(now.getMonth() + duration));
                    break;
                default:
                    expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
            }

            // Parse photo links
            const photos = [];
            if (photoLinks) {
                photoLinks.split('\n').filter(l => l.trim()).forEach(link => {
                    link = link.trim();
                    const driveId = extractDriveId(link);
                    if (driveId) {
                        photos.push({
                            url: getDriveDirectLink(driveId),
                            thumbnail: getDriveThumbnail(driveId),
                            driveId: driveId
                        });
                    } else {
                        photos.push({
                            url: link,
                            thumbnail: link
                        });
                    }
                });
            }

            DB.addClient({
                name,
                phone,
                driveLink,
                expiryDate: expiryDate.toISOString(),
                notes,
                photos
            });

            showNotification('تم إضافة العميل بنجاح ✓');
            addClientForm.reset();
            loadDashboard();
        });
    }

    // Add Portfolio Form
    const addPortfolioForm = document.getElementById('addPortfolioForm');
    if (addPortfolioForm) {
        addPortfolioForm.addEventListener('submit', e => {
            e.preventDefault();
            const title = document.getElementById('portfolioTitle').value.trim();
            const category = document.getElementById('portfolioCategory').value;
            const imageUrl = document.getElementById('portfolioImage').value.trim();

            if (!title || !imageUrl) {
                showNotification('من فضلك أدخل العنوان ورابط الصورة', true);
                return;
            }

            const driveId = extractDriveId(imageUrl);
            const finalUrl = driveId ? getDriveDirectLink(driveId) : imageUrl;
            const thumbUrl = driveId ? getDriveThumbnail(driveId) : imageUrl;

            DB.addPortfolioItem({
                title,
                category,
                imageUrl: finalUrl,
                thumbnail: thumbUrl
            });

            showNotification('تم إضافة العمل بنجاح ✓');
            addPortfolioForm.reset();
            loadDashboard();
        });
    }

    // Settings Form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        const settings = DB.getSettings();
        const nameInput = document.getElementById('photographerName');
        const bioInput = document.getElementById('photographerBio');
        const phoneInput = document.getElementById('photographerPhone');
        const instaInput = document.getElementById('photographerInsta');
        const newPassInput = document.getElementById('newAdminPass');
        
        if (nameInput && settings.name) nameInput.value = settings.name;
        if (bioInput && settings.bio) bioInput.value = settings.bio;
        if (phoneInput && settings.phone) phoneInput.value = settings.phone;
        if (instaInput && settings.instagram) instaInput.value = settings.instagram;

        settingsForm.addEventListener('submit', e => {
            e.preventDefault();
            DB.saveSettings({
                name: nameInput.value.trim(),
                bio: bioInput.value.trim(),
                phone: phoneInput.value.trim(),
                instagram: instaInput.value.trim()
            });
            if (newPassInput.value.trim()) {
                DB.setAdminPassword(newPassInput.value.trim());
            }
            showNotification('تم حفظ الإعدادات بنجاح ✓');
        });
    }
}

function loadDashboard() {
    const clients = DB.getClients();
    const portfolio = DB.getPortfolio();
    
    // Stats
    const totalClients = document.getElementById('totalClients');
    const activeClients = document.getElementById('activeClients');
    const expiredClients = document.getElementById('expiredClients');
    const totalPortfolio = document.getElementById('totalPortfolio');
    
    const active = clients.filter(c => !isSessionExpired(c.expiryDate));
    const expired = clients.filter(c => isSessionExpired(c.expiryDate));
    
    if (totalClients) totalClients.textContent = clients.length;
    if (activeClients) activeClients.textContent = active.length;
    if (expiredClients) expiredClients.textContent = expired.length;
    if (totalPortfolio) totalPortfolio.textContent = portfolio.length;

    // Clients Table
    const tbody = document.getElementById('clientsTableBody');
    if (tbody) {
        if (clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">
                        <i class="fas fa-users" style="font-size:2rem; margin-bottom:10px; display:block; opacity:0.3;"></i>
                        لا يوجد عملاء بعد
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = clients.map(c => `
                <tr>
                    <td style="color:var(--text-light); font-weight:600;">${c.name}</td>
                    <td dir="ltr">${c.phone}</td>
                    <td>${c.photos ? c.photos.length : 0}</td>
                    <td>
                        <span class="status-badge ${isSessionExpired(c.expiryDate) ? 'status-expired' : 'status-active'}">
                            ${isSessionExpired(c.expiryDate) ? 'منتهي' : 'نشط'}
                        </span>
                    </td>
                    <td>${isSessionExpired(c.expiryDate) ? 'منتهي' : getTimeRemaining(c.expiryDate)}</td>
                    <td>
                        <button class="action-btn" onclick="renewClient('${c.id}')" title="تجديد">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteClient('${c.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Portfolio Table
    const portfolioBody = document.getElementById('portfolioTableBody');
    if (portfolioBody) {
        if (portfolio.length === 0) {
            portfolioBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:40px; color:var(--text-muted);">
                        <i class="fas fa-images" style="font-size:2rem; margin-bottom:10px; display:block; opacity:0.3;"></i>
                        لا توجد أعمال بعد
                    </td>
                </tr>
            `;
        } else {
            portfolioBody.innerHTML = portfolio.map(p => `
                <tr>
                    <td>
                        <div style="width:50px;height:50px;border-radius:8px;overflow:hidden;border:1px solid var(--border-color);">
                            <img src="${p.thumbnail || p.imageUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 50 50%22><rect fill=%22%23141414%22 width=%2250%22 height=%2250%22/></svg>'">
                        </div>
                    </td>
                    <td style="color:var(--text-light); font-weight:600;">${p.title}</td>
                    <td>${p.category || 'عام'}</td>
                    <td>
                        <button class="action-btn delete" onclick="deletePortfolio('${p.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
}

function deleteClient(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        DB.deleteClient(id);
        loadDashboard();
        showNotification('تم حذف العميل');
    }
}

function renewClient(id) {
    const clients = DB.getClients();
    const client = clients.find(c => c.id === id);
    if (!client) return;

    // Renew for 7 days from now
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);
    DB.updateClient(id, { expiryDate: newExpiry.toISOString() });
    loadDashboard();
    showNotification('تم تجديد السيشن لمدة 7 أيام');
}

function deletePortfolio(id) {
    if (confirm('هل أنت متأكد من حذف هذا العمل؟')) {
        DB.deletePortfolioItem(id);
        loadDashboard();
        showNotification('تم حذف العمل');
    }
}

function adminLogout() {
    sessionStorage.removeItem('admin_logged');
    location.reload();
}

// ===== PORTFOLIO PAGE =====
function initPortfolioPage() {
    loadPortfolioGrid();
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadPortfolioGrid(btn.dataset.filter);
        });
    });
}

function loadPortfolioGrid(filter = 'all') {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    let items = DB.getPortfolio();
    
    // Add demo items if empty
    if (items.length === 0) {
        items = getDemoPortfolio();
    }

    if (filter !== 'all') {
        items = items.filter(i => i.category === filter);
    }

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-images" style="display:block;"></i>
                <p>لا توجد أعمال في هذا القسم</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="portfolio-item fade-in" onclick="openLightbox('${item.imageUrl || item.thumbnail}')">
            <img src="${item.thumbnail || item.imageUrl}" alt="${item.title}" loading="lazy" 
                onerror="this.src='https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&h=300&fit=crop'">
            <div class="portfolio-overlay">
                <h3>${item.title}</h3>
                <span>${item.category || 'عام'}</span>
            </div>
        </div>
    `).join('');

    initFadeIn();
}

function getDemoPortfolio() {
    return [
        { id: 'd1', title: 'جلسة تصوير زفاف', category: 'wedding', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop' },
        { id: 'd2', title: 'بورتريه احترافي', category: 'portrait', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop' },
        { id: 'd3', title: 'تصوير منتجات', category: 'product', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
        { id: 'd4', title: 'تصوير خارجي', category: 'outdoor', imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop' },
        { id: 'd5', title: 'جلسة عائلية', category: 'portrait', imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop' },
        { id: 'd6', title: 'حفل تخرج', category: 'event', imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop' },
        { id: 'd7', title: 'تصوير أزياء', category: 'portrait', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop' },
        { id: 'd8', title: 'جلسة زفاف كلاسيك', category: 'wedding', imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop' },
        { id: 'd9', title: 'تصوير طبيعة', category: 'outdoor', imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=450&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop' }
    ];
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    createParticles();
    initFadeIn();
    initSessionsPage();
    initAdminPage();
    initPortfolioPage();
});
