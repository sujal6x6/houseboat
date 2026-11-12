(() => {
  'use strict';

  const KEYS = { session: 'np_admin_session', bookings: 'np_bookings', rates: 'np_rates', rooms: 'np_rooms', gallery: 'np_gallery', settings: 'np_settings', activity: 'np_activity' };
  const defaults = {
    rates: [
      { code: 'EP', name: 'European Plan', description: 'Room only', price: 2250, eb: 580, cnb: 'Complimentary' },
      { code: 'CP', name: 'Continental Plan', description: 'Room + breakfast', price: 2850, eb: 700, cnb: 500 },
      { code: 'MAPI', name: 'Modified American Plan', description: 'Room + breakfast + one main meal', price: 4050, eb: 1100, cnb: 650 },
      { code: 'API', name: 'American Plan', description: 'Room + breakfast + lunch + dinner', price: 5250, eb: 1600, cnb: 850 }
    ],
    rooms: [
      { name: 'Heritage Suite', type: 'King bed · Lake views', image: 'images/rooms/heritage-suite-2.jpeg', available: true },
      { name: 'Deluxe Room', type: 'Queen bed · Breakfast', image: 'images/rooms/deluxe-room-1.jpeg', available: true },
      { name: 'Royal Suite', type: 'King bed · Private lounge', image: 'images/rooms/royal-suite-1.jpeg', available: true },
      { name: 'Lake View Room', type: 'Lake view · Couples', image: 'images/rooms/lakeview-room-1.jpeg', available: true },
      { name: 'Premium Room', type: 'Double bed · Attached bath', image: 'images/rooms/premium-room-2.jpeg', available: true },
      { name: 'Family Room', type: 'Family stay · Flexible beds', image: 'images/rooms/family-room.jpeg', available: true }
    ],
    gallery: [
      { name: 'Balcony sunset', src: 'images/hero/balcony-sunset.jpeg' },
      { name: 'Dining hall', src: 'images/dining/dining-hall-chandelier.jpeg' },
      { name: 'Heritage suite', src: 'images/rooms/heritage-suite-3.jpeg' },
      { name: 'Candlelight dinner', src: 'images/dining/candlelight-dinner-couple.jpeg' },
      { name: 'Royal suite', src: 'images/rooms/royal-suite-1.jpeg' },
      { name: 'Lake view room', src: 'images/rooms/lakeview-room-2.jpeg' }
    ],
    settings: { propertyName: 'New Peony Group of Houseboats', phone: '+91 96826 54524', instagram: 'https://www.instagram.com/houseboat_new_peony_/?utm_source=qr', facebook: 'https://www.facebook.com/profile.php?id=100077064371242&mibextid=wwXIfr', whatsapp: '+91 96826 54524', location: 'Nigeen Lake, Srinagar, Kashmir' },
    bookings: [
      { id: 'NP-1048', name: 'Aarav Mehta', email: 'aarav@example.com', phone: '+91 98765 43210', plan: 'MAPI', room: 'Heritage Suite', guests: 2, checkin: '2026-11-18', checkout: '2026-11-21', amount: 12150, status: 'confirmed', created: '2026-11-09' },
      { id: 'NP-1047', name: 'Sana Kapoor', email: 'sana@example.com', phone: '+91 98200 11223', plan: 'CP', room: 'Lake View Room', guests: 2, checkin: '2026-11-20', checkout: '2026-11-22', amount: 5700, status: 'pending', created: '2026-11-10' },
      { id: 'NP-1046', name: 'Daniel Brooks', email: 'daniel@example.com', phone: '+44 7700 900123', plan: 'API', room: 'Royal Suite', guests: 3, checkin: '2026-11-24', checkout: '2026-11-28', amount: 21000, status: 'confirmed', created: '2026-11-08' },
      { id: 'NP-1045', name: 'Meera Sharma', email: 'meera@example.com', phone: '+91 98999 88777', plan: 'EP', room: 'Deluxe Room', guests: 1, checkin: '2026-11-15', checkout: '2026-11-16', amount: 2250, status: 'cancelled', created: '2026-11-07' }
    ],
    activity: [
      { text: 'Aarav Mehta booking confirmed', meta: 'Today · NP-1048' },
      { text: 'MAPI rate updated to ₹4,050', meta: 'Yesterday · Rates' },
      { text: 'New gallery image added', meta: 'Yesterday · Gallery' },
      { text: 'Sana Kapoor sent an enquiry', meta: '2 days ago · NP-1047' }
    ]
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const date = value => value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(`${value}T00:00:00`)) : '—';
  const initials = name => (name || 'NP').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  let rates = read(KEYS.rates, defaults.rates);
  let rooms = read(KEYS.rooms, defaults.rooms);
  let gallery = read(KEYS.gallery, defaults.gallery);
  let settings = read(KEYS.settings, defaults.settings);
  let bookings = read(KEYS.bookings, defaults.bookings);
  let activity = read(KEYS.activity, defaults.activity);

  const toast = message => { const node = $('#toast'); if (!node) return; node.textContent = message; node.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('show'), 2800); };
  const addActivity = (text, meta = 'Just now') => { activity.unshift({ text, meta }); activity = activity.slice(0, 6); write(KEYS.activity, activity); renderActivity(); };

  const loginView = $('#loginView');
  const adminApp = $('#adminApp');
  const showApp = () => { loginView.hidden = true; adminApp.hidden = false; $('#adminUserLabel').textContent = localStorage.getItem(KEYS.session) || 'admin'; renderAll(); };
  const showLogin = () => { loginView.hidden = false; adminApp.hidden = true; };
  if (localStorage.getItem(KEYS.session)) showApp();
  $('#loginForm')?.addEventListener('submit', event => { event.preventDefault(); const user = $('#loginUser').value.trim(); const password = $('#loginPassword').value.trim(); if (!user || !password) { $('#loginError').textContent = 'Enter both username and password to continue.'; return; } localStorage.setItem(KEYS.session, user); $('#loginError').textContent = ''; showApp(); });
  $('#logoutBtn')?.addEventListener('click', () => { localStorage.removeItem(KEYS.session); showLogin(); });

  const panels = $$('.admin-view');
  const setView = view => { panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === view)); $$('.admin-nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view)); const label = { dashboard: 'Overview', bookings: 'Bookings', rates: 'Rates & plans', rooms: 'Rooms', gallery: 'Gallery', settings: 'Settings' }[view] || 'Overview'; $('#viewTitle').textContent = label; $('#adminSidebar').classList.remove('open'); $('#adminOverlay').classList.remove('open'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  $$('.admin-nav-item').forEach(item => item.addEventListener('click', () => setView(item.dataset.view)));
  $$('[data-view-link]').forEach(button => button.addEventListener('click', () => setView(button.dataset.viewLink)));
  $('#mobileMenu')?.addEventListener('click', () => { $('#adminSidebar').classList.add('open'); $('#adminOverlay').classList.add('open'); });
  $('#sidebarClose')?.addEventListener('click', () => { $('#adminSidebar').classList.remove('open'); $('#adminOverlay').classList.remove('open'); });
  $('#adminOverlay')?.addEventListener('click', () => { $('#adminSidebar').classList.remove('open'); $('#adminOverlay').classList.remove('open'); });
  $('#refreshBtn')?.addEventListener('click', () => { renderAll(); toast('Dashboard refreshed'); });

  function renderMetrics() {
    const confirmed = bookings.filter(item => item.status === 'confirmed');
    const pending = bookings.filter(item => item.status === 'pending');
    $('#metricRevenue').textContent = money(confirmed.reduce((sum, item) => sum + Number(item.amount || 0), 0));
    $('#metricConfirmed').textContent = confirmed.length;
    $('#metricOccupancy').textContent = `${Math.round((rooms.filter(room => !room.available).length / Math.max(rooms.length, 1)) * 100)}%`;
    $('#metricEnquiries').textContent = pending.length;
    $('#bookingCount').textContent = pending.length;
  }
  function renderChart() { const values = [4, 7, 5, 10, 8, 12, 9]; const max = Math.max(...values); $('#bookingChart').innerHTML = values.map(value => `<div class="chart-bar" style="--bar:${Math.round(value / max * 86)}%" data-value="${value}"></div>`).join(''); }
  function renderArrivals() { const list = bookings.filter(item => item.status !== 'cancelled').sort((a, b) => a.checkin.localeCompare(b.checkin)).slice(0, 4); $('#arrivalList').innerHTML = list.length ? list.map(item => `<div class="arrival-item"><div class="arrival-date">${date(item.checkin).replace(' ', '<br>')}</div><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.room)} · ${item.guests} guest${item.guests === 1 ? '' : 's'}</span></div><span class="status ${item.status}" style="margin-left:auto">${item.status}</span></div>`).join('') : '<p class="muted">No upcoming arrivals.</p>'; }
  function renderActivity() { $('#activityList').innerHTML = activity.map(item => `<div class="activity-item"><i class="activity-dot"></i><div><strong>${escapeHtml(item.text)}</strong><span>${escapeHtml(item.meta)}</span></div></div>`).join(''); }
  function renderDashboard() { renderMetrics(); renderChart(); renderArrivals(); renderActivity(); }

  function renderBookings() {
    const query = ($('#bookingSearch')?.value || '').toLowerCase().trim();
    const filter = $('#bookingFilter')?.value || 'all';
    const rows = bookings.filter(item => (filter === 'all' || item.status === filter) && [item.name, item.email, item.plan, item.room, item.id].join(' ').toLowerCase().includes(query));
    $('#bookingRows').innerHTML = rows.map(item => `<tr><td><div class="guest-cell"><div class="guest-initial">${initials(item.name)}</div><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.id)}</span></div></div></td><td class="date-cell">${date(item.checkin)} – ${date(item.checkout)}<small>${Math.max(1, Math.round((new Date(item.checkout) - new Date(item.checkin)) / 86400000))} nights</small></td><td><strong>${escapeHtml(item.plan)}</strong><small style="display:block;color:var(--admin-muted);margin-top:.2rem">${escapeHtml(item.room)}</small></td><td>${item.guests}</td><td class="amount">${money(item.amount)}</td><td><span class="status ${item.status}">${item.status}</span></td><td><button class="row-action" data-booking="${item.id}" aria-label="View ${escapeHtml(item.name)}">⋯</button></td></tr>`).join('');
    $('#bookingEmpty').hidden = rows.length > 0;
    $$('[data-booking]').forEach(button => button.addEventListener('click', () => openBooking(button.dataset.booking)));
  }
  $('#bookingSearch')?.addEventListener('input', renderBookings); $('#bookingFilter')?.addEventListener('change', renderBookings);
  function openBooking(id) { const item = bookings.find(booking => booking.id === id); if (!item) return; openModal(`<p class="eyebrow">Booking ${escapeHtml(item.id)}</p><h2 class="modal-title">${escapeHtml(item.name)}</h2><p class="modal-subtitle">${escapeHtml(item.email)} · ${escapeHtml(item.phone)}</p><div class="detail-grid"><div><span>Stay</span><strong>${date(item.checkin)} – ${date(item.checkout)}</strong></div><div><span>Guests</span><strong>${item.guests}</strong></div><div><span>Plan</span><strong>${escapeHtml(item.plan)}</strong></div><div><span>Room</span><strong>${escapeHtml(item.room)}</strong></div><div><span>Amount</span><strong>${money(item.amount)}</strong></div><div><span>Status</span><strong class="status ${item.status}">${item.status}</strong></div></div><div class="modal-actions"><button class="admin-btn admin-btn-quiet" data-modal-action="cancel">Cancel booking</button><button class="admin-btn admin-btn-primary" data-modal-action="confirm">Confirm booking</button></div>`); $$('.admin-modal [data-modal-action]').forEach(button => button.addEventListener('click', () => { const next = button.dataset.modalAction; const target = bookings.find(booking => booking.id === id); if (target) { target.status = next === 'confirm' ? 'confirmed' : 'cancelled'; write(KEYS.bookings, bookings); addActivity(`${target.name} booking ${target.status}`, `Just now · ${target.id}`); closeModal(); renderAll(); toast(`Booking ${target.status}`); } })); }

  function renderRates() { $('#rateAdminGrid').innerHTML = rates.map((rate, index) => `<article class="rate-admin-card"><div class="rate-admin-head"><div><span class="rate-admin-code">${escapeHtml(rate.code)}</span><h3>${escapeHtml(rate.name)}</h3><p class="rate-admin-description">${escapeHtml(rate.description)}</p></div><span class="status confirmed">Active</span></div><div class="rate-fields"><label>Nightly price<input class="rate-input" data-rate="${index}" data-field="price" type="number" min="0" value="${rate.price}"></label><label>Extra bed (EB)<input class="rate-input" data-rate="${index}" data-field="eb" type="number" min="0" value="${rate.eb}"></label><label>Child no bed<input class="rate-input" data-rate="${index}" data-field="cnb" type="text" value="${escapeHtml(rate.cnb)}"></label></div></article>`).join(''); }
  $('#saveRates')?.addEventListener('click', () => { $$('.rate-input').forEach(input => { const rate = rates[Number(input.dataset.rate)]; if (rate) rate[input.dataset.field] = input.dataset.field === 'cnb' ? input.value.trim() : Number(input.value || 0); }); write(KEYS.rates, rates); addActivity('Public meal plan rates published', 'Just now · Rates'); toast('Rates saved and published'); });
  $('#resetRates')?.addEventListener('click', () => { rates = defaults.rates.map(rate => ({ ...rate })); write(KEYS.rates, rates); renderRates(); toast('Rates reset to the supplied defaults'); });

  function renderRooms() { $('#roomAdminGrid').innerHTML = rooms.map((room, index) => `<article class="room-admin-card"><img src="${escapeHtml(room.image)}" alt="${escapeHtml(room.name)}" loading="lazy"><div class="room-admin-content"><h3>${escapeHtml(room.name)}</h3><p>${escapeHtml(room.type)}</p><div class="room-admin-meta"><span class="availability ${room.available ? 'available' : ''}">${room.available ? 'Available to book' : 'Blocked for booking'}</span><label class="switch"><input type="checkbox" data-room="${index}" ${room.available ? 'checked' : ''} aria-label="${room.name} availability"><span class="slider"></span></label></div></div></article>`).join(''); $$('#roomAdminGrid input[data-room]').forEach(input => input.addEventListener('change', () => { rooms[Number(input.dataset.room)].available = input.checked; write(KEYS.rooms, rooms); renderRooms(); renderMetrics(); toast(`${rooms[Number(input.dataset.room)].name} is ${input.checked ? 'available' : 'blocked'}`); })); }

  function renderGallery() { $('#galleryAdminGrid').innerHTML = gallery.map((item, index) => `<figure class="gallery-admin-item"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.name)}" loading="lazy"><span>${escapeHtml(item.name)}</span><button class="gallery-remove" data-gallery="${index}" aria-label="Remove ${escapeHtml(item.name)}">×</button></figure>`).join(''); $('#galleryEmpty').hidden = gallery.length > 0; $$('[data-gallery]').forEach(button => button.addEventListener('click', () => { gallery.splice(Number(button.dataset.gallery), 1); write(KEYS.gallery, gallery); renderGallery(); addActivity('Gallery image removed', 'Just now · Gallery'); toast('Gallery image removed'); })); }
  $('#galleryUpload')?.addEventListener('change', event => { [...event.target.files].forEach(file => { const src = URL.createObjectURL(file); gallery.push({ name: file.name, src }); }); write(KEYS.gallery, gallery); renderGallery(); addActivity(`${event.target.files.length} gallery image${event.target.files.length === 1 ? '' : 's'} added`, 'Just now · Gallery'); toast('Gallery updated for this browser'); event.target.value = ''; });

  function renderSettings() { const form = $('#settingsForm'); if (!form) return; Object.entries(settings).forEach(([key, value]) => { const field = form.elements[key]; if (field) field.value = value; }); }
  $('#saveSettings')?.addEventListener('click', () => { const form = $('#settingsForm'); const next = {}; [...new FormData(form).entries()].forEach(([key, value]) => { next[key] = String(value).trim(); }); settings = { ...settings, ...next }; write(KEYS.settings, settings); addActivity('Property contact settings saved', 'Just now · Settings'); toast('Settings saved'); });
  $('#clearData')?.addEventListener('click', () => { if (!window.confirm('Clear demo bookings, rates, rooms, gallery, and settings from this browser?')) return; Object.values(KEYS).filter(key => key !== KEYS.session).forEach(key => localStorage.removeItem(key)); rates = defaults.rates.map(rate => ({ ...rate })); rooms = defaults.rooms.map(room => ({ ...room })); gallery = defaults.gallery.map(item => ({ ...item })); settings = { ...defaults.settings }; bookings = defaults.bookings.map(item => ({ ...item })); activity = defaults.activity.map(item => ({ ...item })); renderAll(); toast('Demo data restored'); });

  function exportData() { const payload = { exportedAt: new Date().toISOString(), rates, rooms, gallery, settings, bookings, activity }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'new-peony-admin-backup.json'; link.click(); URL.revokeObjectURL(link.href); toast('Backup downloaded'); }
  $$('[data-action="export-data"]').forEach(button => button.addEventListener('click', exportData));
  $('#importData')?.addEventListener('change', event => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const payload = JSON.parse(reader.result); if (payload.rates) rates = payload.rates; if (payload.rooms) rooms = payload.rooms; if (payload.gallery) gallery = payload.gallery; if (payload.settings) settings = payload.settings; if (payload.bookings) bookings = payload.bookings; if (payload.activity) activity = payload.activity; Object.entries({ rates, rooms, gallery, settings, bookings, activity }).forEach(([key, value]) => write(KEYS[key], value)); renderAll(); toast('Backup restored'); } catch { toast('That backup file is not valid JSON'); } }; reader.readAsText(file); event.target.value = ''; });

  function openModal(content) { $('#modalContent').innerHTML = content; $('#modalBackdrop').hidden = false; document.body.classList.add('modal-open'); }
  function closeModal() { $('#modalBackdrop').hidden = true; document.body.classList.remove('modal-open'); }
  $('#modalClose')?.addEventListener('click', closeModal); $('#modalBackdrop')?.addEventListener('click', event => { if (event.target.id === 'modalBackdrop') closeModal(); }); document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  function newBooking() {
    const roomOptions = rooms.map(room => `<option>${escapeHtml(room.name)}</option>`).join('');
    const modal = `<p class="eyebrow">Manual reservation</p><h2 class="modal-title">Add a booking</h2><p class="modal-subtitle">Create a reservation on behalf of a guest.</p><form class="modal-form" id="newBookingForm"><label>Guest name<input name="name" required placeholder="Guest name"></label><label>Email<input name="email" type="email" placeholder="guest@example.com"></label><label>Check-in<input name="checkin" type="date" required></label><label>Check-out<input name="checkout" type="date" required></label><label>Meal plan<select name="plan"><option>EP</option><option>CP</option><option>MAPI</option><option>API</option></select></label><label>Room<select name="room">${roomOptions}</select></label><label>Guests<input name="guests" type="number" min="1" value="2"></label><div class="modal-actions"><button type="button" class="admin-btn admin-btn-quiet" data-modal-close>Close</button><button type="submit" class="admin-btn admin-btn-primary">Add booking</button></div></form>`;
    openModal(modal);
    $('#newBookingForm').addEventListener('submit', event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const rate = rates.find(item => item.code === values.plan) || rates[0];
      const nights = Math.max(1, Math.round((new Date(values.checkout) - new Date(values.checkin)) / 86400000));
      bookings.unshift({ id: `NP-${1050 + bookings.length}`, ...values, guests: Number(values.guests || 1), amount: Number(rate.price) * nights, status: 'confirmed', created: new Date().toISOString().slice(0, 10) });
      write(KEYS.bookings, bookings);
      addActivity(`${values.name} booking added`, 'Just now · Manual');
      closeModal();
      renderAll();
      toast('Booking added');
    });
    $('[data-modal-close]')?.addEventListener('click', closeModal);
  }
  $$('[data-action="new-booking"]').forEach(button => button.addEventListener('click', newBooking));
  $$('[data-action="edit-rates"]').forEach(button => button.addEventListener('click', () => setView('rates'))); $$('[data-action="open-gallery"]').forEach(button => button.addEventListener('click', () => setView('gallery'))); $$('[data-action="add-room"]').forEach(button => button.addEventListener('click', () => { setView('rooms'); toast('Room editor ready — add your room record here.'); }));
  function renderAll() { renderDashboard(); renderBookings(); renderRates(); renderRooms(); renderGallery(); renderSettings(); }
})();
