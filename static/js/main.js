const form = document.getElementById('myForm');
const namaDepanInput = document.getElementById('namaDepan');
const namaBelakangInput = document.getElementById('namaBelakang');
const errorNamaDepan = document.getElementById('errorNamaDepan');
const errorNamaBelakang = document.getElementById('errorNamaBelakang');
const successBanner = document.getElementById('successBanner');
const submissionList = document.getElementById('submissionList');

// Clear error styling when user types
namaDepanInput.addEventListener('input', () => {
    namaDepanInput.classList.remove('error');
    errorNamaDepan.classList.remove('show');
});
namaBelakangInput.addEventListener('input', () => {
    namaBelakangInput.classList.remove('error');
    errorNamaBelakang.classList.remove('show');
});

// Submit form via fetch (AJAX) — no page reload
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const namaDepan = namaDepanInput.value.trim();
    const namaBelakang = namaBelakangInput.value.trim();
    let isValid = true;

    namaDepanInput.classList.remove('error');
    namaBelakangInput.classList.remove('error');
    errorNamaDepan.classList.remove('show');
    errorNamaBelakang.classList.remove('show');
    successBanner.classList.remove('show');

    if (namaDepan === '') {
        namaDepanInput.classList.add('error');
        errorNamaDepan.classList.add('show');
        isValid = false;
    }
    if (namaBelakang === '') {
        namaBelakangInput.classList.add('error');
        errorNamaBelakang.classList.add('show');
        isValid = false;
    }
    if (!isValid) return;

    try {
        const res = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ namaDepan, namaBelakang })
        });
        const data = await res.json();

        if (data.success) {
            successBanner.textContent = '✅ ' + data.message;
            successBanner.classList.add('show');
            form.reset();
            loadSubmissions();
        } else {
            alert(data.error || 'Terjadi kesalahan');
        }
    } catch (err) {
        alert('Gagal terhubung ke server.');
        console.error(err);
    }
});

// Load submissions from database
async function loadSubmissions() {
    try {
        const res = await fetch('/api/submissions');
        const data = await res.json();

        if (data.length === 0) {
            submissionList.innerHTML = '<li class="empty">Belum ada data.</li>';
            return;
        }

        submissionList.innerHTML = data.map(item => `
            <li class="submission-item">
                <div>
                    <strong>${escapeHtml(item.namaDepan)} ${escapeHtml(item.namaBelakang)}</strong>
                    <div class="meta">${item.createdAt}</div>
                </div>
                <button class="delete-btn" onclick="deleteSubmission(${item.id})" title="Hapus">🗑️</button>
            </li>
        `).join('');
    } catch (err) {
        submissionList.innerHTML = '<li class="empty">Gagal memuat data.</li>';
        console.error(err);
    }
}

// Delete a submission
async function deleteSubmission(id) {
    if (!confirm('Hapus data ini?')) return;
    try {
        await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
        loadSubmissions();
    } catch (err) {
        alert('Gagal menghapus data.');
    }
}

// Prevent XSS when injecting names into HTML
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Load list when page opens
loadSubmissions();