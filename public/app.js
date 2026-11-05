// --- Helpers for Saved ---
function getSaved() {
  return JSON.parse(localStorage.getItem('savedJobs') || '[]');
}
function isSaved(id) {
  return getSaved().includes(id);
}
function toggleSave(id, title) {
  let saved = getSaved();
  if (saved.includes(id)) {
    saved = saved.filter(s => s !== id);
  } else {
    saved.push(id);
    alert(title + ' saved! Check Saved tab.');
  }
  localStorage.setItem('savedJobs', JSON.stringify(saved));
  loadJobs();
}

// --- Smart Apply Button - FIXED ---
function getApplyButton(j) {
  // Email
  if (j.applyType === 'email') {
    const subject = encodeURIComponent(`Application: ${j.title} - ${j.company}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in the ${j.title} position at ${j.company} I saw on Sebenta Jobs.\n\nPlease find my CV attached.\n\nThank you.`);
    return `<a target="_blank" href="mailto:${j.applyValue}?subject=${subject}&body=${body}" class="apply-btn" style="background:#007bff;">✉️ Apply via Email</a>`;
  }
  // Portal
  if (j.applyType === 'portal') {
    return `<a target="_blank" href="${j.applyValue}" class="apply-btn" style="background:#0a2540;">🌐 Apply via Portal</a>`;
  }
  // WhatsApp - default for everything else
  const phone = j.applyValue || j.phone || j.whatsapp || '';
  const cleanPhone = String(phone).replace(/\s/g, '');
  const fullPhone = cleanPhone.startsWith('268') ? cleanPhone : '268' + cleanPhone;
  const text = encodeURIComponent(`Hi, I'm interested in the ${j.title} position at ${j.company} on Sebenta Jobs.`);
  return `<a target="_blank" href="https://wa.me/${fullPhone}?text=${text}" class="apply-btn" style="background:#25D366;">💬 WhatsApp Apply</a>`;
}

// --- Load Jobs ---
async function loadJobs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/jobs?${query}`);
  const jobs = await res.json();
  document.getElementById('jobs').innerHTML = jobs.map(j => `
    <div class="job-card">
      <h4>${j.title} — ${j.company}</h4>
      <p>${j.location} • ${j.type} • ${j.levelName || ''}</p>
      <p><b>${j.salary}</b> • Deadline: ${j.deadline || 'Open'}</p>
      ${getApplyButton(j)}
      <button onclick="toggleSave(${j.id}, '${j.title}')" style="margin-left:8px; padding:9px 12px; border-radius:20px; border:1px solid #007bff; background:${isSaved(j.id) ? '#007bff' : 'white'}; color:${isSaved(j.id) ? 'white' : '#007bff'}; font-weight:700; cursor:pointer;">${isSaved(j.id) ? '✓ Saved' : '🔖 Save'}</button>
    </div>
  `).join('') || '<p>No jobs found. Try another category.</p>';
}

// --- Filters ---
document.querySelectorAll('#categories button').forEach(btn => {
  btn.onclick = () => loadJobs({ level: btn.dataset.level });
});
document.getElementById('showAll').onclick = () => loadJobs();
document.querySelectorAll('#filters button').forEach(btn => {
  btn.onclick = () => loadJobs({ location: btn.dataset.location });
});
document.getElementById('search').oninput = (e) => loadJobs({ search: e.target.value });

// --- Post a Job Form ---
document.getElementById('jobForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  const msg = document.getElementById('formMsg');
  if (res.ok) {
    msg.textContent = "✅ Job posted! It is now live.";
    msg.style.color = "green";
    form.reset();
    loadJobs();
  } else {
    msg.textContent = "❌ " + result.error;
    msg.style.color = "red";
  }
});

// --- Bottom Nav ---
function setActiveNav(id) {
  document.querySelectorAll('.bottom-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('navHome').onclick = (e) => {
  e.preventDefault();
  setActiveNav('navHome');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadJobs();
};

document.getElementById('navPost').onclick = (e) => {
  e.preventDefault();
  setActiveNav('navPost');
  document.getElementById('postForm').scrollIntoView({ behavior: 'smooth' });
};

document.getElementById('navSaved').onclick = async (e) => {
  e.preventDefault();
  setActiveNav('navSaved');
  const savedIds = getSaved();
  if (savedIds.length === 0) {
    document.getElementById('jobs').innerHTML = '<p>You have no saved jobs yet. Tap 🔖 Save on any job.</p>';
    document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const res = await fetch('/api/jobs');
  const all = await res.json();
  const savedJobs = all.filter(j => savedIds.includes(j.id));
  document.getElementById('jobs').innerHTML = savedJobs.map(j => `
    <div class="job-card">
      <h4>${j.title} — ${j.company}</h4>
      <p>${j.location} • ${j.type} • ${j.levelName || ''}</p>
      <p><b>${j.salary}</b> • Deadline: ${j.deadline || 'Open'}</p>
      ${getApplyButton(j)}
      <button onclick="toggleSave(${j.id}, '${j.title}')">Remove Save</button>
    </div>
  `).join('');
  document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
};

document.getElementById('navProfile').onclick = async (e) => {
  e.preventDefault();
  setActiveNav('navProfile');
  document.getElementById('postForm').style.display = 'none';
  const res = await fetch('/api/jobs');
  const all = await res.json();
  document.getElementById('profileSavedCount').textContent = getSaved().length;
  document.getElementById('profileTotalCount').textContent = all.length;
  const modal = document.getElementById('profileModal');
  modal.style.display = 'flex';
};

document.getElementById('closeProfile').onclick = () => {
  document.getElementById('profileModal').style.display = 'none';
  setActiveNav('navHome');
};

// Close when you tap the dark background
document.getElementById('profileModal').onclick = (e) => {
  if (e.target.id === 'profileModal') {
    e.target.style.display = 'none';
    setActiveNav('navHome');
  }
};

loadJobs();

// --- Splash Screen ---
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.style.display = 'none';
        window.scrollTo(0, 0);
      }, 400);
    }
  }, 1800);
});