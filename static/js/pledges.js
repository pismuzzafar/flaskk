const grid = document.getElementById('pledgesGrid');
const statTotal = document.getElementById('statTotal');
const statCategories = document.getElementById('statCategories');
const statLocations = document.getElementById('statLocations');
const filterBar = document.getElementById('filterBar');

let allPledges = [];
let currentFilter = 'all';

async function loadPledges() {
    try {
        const res = await fetch('/api/pledges');
        allPledges = await res.json();
        updateStats();
        renderPledges();
    } catch (err) {
        grid.innerHTML = '<div class="empty-state">Failed to load data.</div>';
        console.error(err);
    }
}

function updateStats() {
    statTotal.textContent = allPledges.length;
    statCategories.textContent = new Set(allPledges.map(p => p.category)).size;
    statLocations.textContent = new Set(allPledges.map(p => p.location.toLowerCase())).size;
}

function renderPledges() {
    const filtered = currentFilter === 'all'
        ? allPledges
        : allPledges.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-emoji">🌱</div>
                <div>No pledges yet${currentFilter !== 'all' ? ' in this category' : ''}.</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="pledge-card glass">
            <div class="pledge-category">${escapeHtml(p.category)}</div>
            <div class="pledge-name">${escapeHtml(p.name)}</div>
            <div class="pledge-location">📍 ${escapeHtml(p.location)}</div>
            <div class="pledge-description">"${escapeHtml(p.description)}"</div>
            <div class="pledge-footer">
                <span>${p.createdAt}</span>
                <button class="delete-btn" onclick="deletePledge(${p.id})" title="Hapus">🗑️</button>
            </div>
        </div>
    `).join('');
}

filterBar.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-chip')) {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.category;
        renderPledges();
    }
});

async function deletePledge(id) {
    if (!confirm('Delete this pledge?')) return;
    try {
        await fetch(`/api/pledges/${id}`, { method: 'DELETE' });
        loadPledges();
    } catch (err) {
        alert('Failed to delete.');
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

loadPledges();