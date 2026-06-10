const form = document.getElementById('pledgeForm');
const nameInput = document.getElementById('name');
const locationInput = document.getElementById('location');
const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const successBanner = document.getElementById('successBanner');

const errors = {
    name: document.getElementById('errorName'),
    location: document.getElementById('errorLocation'),
    category: document.getElementById('errorCategory'),
    description: document.getElementById('errorDescription')
};

const fields = [
    { input: nameInput, key: 'name' },
    { input: locationInput, key: 'location' },
    { input: categoryInput, key: 'category' },
    { input: descriptionInput, key: 'description' }
];

fields.forEach(({ input, key }) => {
    const clear = () => {
        input.classList.remove('error');
        errors[key].classList.remove('show');
    };
    input.addEventListener('input', clear);
    input.addEventListener('change', clear);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const values = {
        name: nameInput.value.trim(),
        location: locationInput.value.trim(),
        category: categoryInput.value,
        description: descriptionInput.value.trim()
    };

    fields.forEach(({ input, key }) => {
        input.classList.remove('error');
        errors[key].classList.remove('show');
    });
    successBanner.classList.remove('show');

    let isValid = true;
    fields.forEach(({ input, key }) => {
        if (!values[key]) {
            input.classList.add('error');
            errors[key].classList.add('show');
            isValid = false;
        }
    });
    if (!isValid) return;

    try {
        const res = await fetch('/api/pledges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        });
        const data = await res.json();

        if (data.success) {
        successBanner.textContent = `✅ Thank you ${values.name}! Your pledge has been recorded.`;
        successBanner.classList.add('show');
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { window.location.href = '/pledges'; }, 1800);
        } else {
        alert(data.error || 'Something went wrong');
        }
        } catch (err) {
        alert('Failed to connect to server.');
        console.error(err);
}
});