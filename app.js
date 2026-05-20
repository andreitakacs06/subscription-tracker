/* ============================================
   SubTracker - Application Logic
   ============================================ */

// ============================================
// State Management
// ============================================

const STORAGE_KEY = 'subtracker_data_v1';

const CATEGORY_COLORS = {
    entertainment: '#e84393',
    software: '#0984e3',
    fitness: '#00b894',
    cloud: '#54a0ff',
    music: '#fd79a8',
    gaming: '#a29bfe',
    news: '#ff9f43',
    productivity: '#6c5ce7',
    other: '#636e72'
};

const QUICK_TEMPLATES = [
    { name: 'Netflix', price: 15.49, category: 'entertainment', color: '#e50914' },
    { name: 'Spotify', price: 9.99, category: 'music', color: '#1db954' },
    { name: 'Disney+', price: 7.99, category: 'entertainment', color: '#0063e5' },
    { name: 'YouTube Premium', price: 13.99, category: 'entertainment', color: '#ff0000' },
    { name: 'Adobe CC', price: 54.99, category: 'software', color: '#ff0000' },
    { name: 'Microsoft 365', price: 9.99, category: 'productivity', color: '#0078d4' },
    { name: 'iCloud+', price: 2.99, category: 'cloud', color: '#3478f6' },
    { name: 'Google One', price: 1.99, category: 'cloud', color: '#4285f4' },
    { name: 'Dropbox', price: 11.99, category: 'cloud', color: '#0061ff' },
    { name: 'Gym', price: 29.99, category: 'fitness', color: '#00b894' },
    { name: 'PlayStation Plus', price: 9.99, category: 'gaming', color: '#003791' },
    { name: 'Xbox Game Pass', price: 16.99, category: 'gaming', color: '#107c10' },
    { name: 'Apple TV+', price: 9.99, category: 'entertainment', color: '#000000' },
    { name: 'HBO Max', price: 15.99, category: 'entertainment', color: '#741dee' },
    { name: 'NYTimes', price: 17.00, category: 'news', color: '#000000' },
    { name: 'Notion', price: 8.00, category: 'productivity', color: '#000000' }
];

const SAMPLE_DATA = [
    { name: 'Netflix', price: 15.49, cycle: 'monthly', category: 'entertainment', color: '#e50914', renewalDate: addDaysISO(2) },
    { name: 'Spotify Family', price: 16.99, cycle: 'monthly', category: 'music', color: '#1db954', renewalDate: addDaysISO(5) },
    { name: 'Adobe Creative Cloud', price: 54.99, cycle: 'monthly', category: 'software', color: '#ff0000', renewalDate: addDaysISO(11) },
    { name: 'Gym Membership', price: 29.99, cycle: 'monthly', category: 'fitness', color: '#00b894', renewalDate: addDaysISO(0) },
    { name: 'iCloud+ 200GB', price: 2.99, cycle: 'monthly', category: 'cloud', color: '#3478f6', renewalDate: addDaysISO(8) },
    { name: 'Dropbox Plus', price: 11.99, cycle: 'monthly', category: 'cloud', color: '#0061ff', renewalDate: addDaysISO(14) },
    { name: 'Xbox Game Pass', price: 16.99, cycle: 'monthly', category: 'gaming', color: '#107c10', renewalDate: addDaysISO(3) },
    { name: 'Disney+', price: 7.99, cycle: 'monthly', category: 'entertainment', color: '#0063e5', renewalDate: addDaysISO(19) },
    { name: 'Notion Pro', price: 96.00, cycle: 'yearly', category: 'productivity', color: '#000000', renewalDate: addDaysISO(45) },
    { name: 'Google One 2TB', price: 9.99, cycle: 'monthly', category: 'cloud', color: '#4285f4', renewalDate: addDaysISO(22) }
];

let state = {
    subscriptions: [],
    filter: 'all',
    selectedDay: null,
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
    charts: {}
};

// ============================================
// Utility Functions
// ============================================

function addDaysISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmt(amount) {
    return '$' + amount.toFixed(2);
}

function monthlyAmount(sub) {
    switch (sub.cycle) {
        case 'weekly': return sub.price * 52 / 12;
        case 'monthly': return sub.price;
        case 'quarterly': return sub.price / 3;
        case 'yearly': return sub.price / 12;
        default: return sub.price;
    }
}

function yearlyAmount(sub) {
    switch (sub.cycle) {
        case 'weekly': return sub.price * 52;
        case 'monthly': return sub.price * 12;
        case 'quarterly': return sub.price * 4;
        case 'yearly': return sub.price;
        default: return sub.price * 12;
    }
}

function daysUntil(dateStr) {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ============================================
// Persistence
// ============================================

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.subscriptions));
    } catch (e) {
        console.error('Failed to save', e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            state.subscriptions = JSON.parse(raw);
        } else {
            // Seed with sample data on first load
            state.subscriptions = SAMPLE_DATA.map(s => ({ ...s, id: uid() }));
            saveState();
        }
    } catch (e) {
        console.error('Failed to load', e);
        state.subscriptions = [];
    }
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type === 'error' ? 'error' : '');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================
// Page Routing
// ============================================

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');

    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page);
    });

    // Trigger renders specific to pages
    if (page === 'dashboard') renderDashboard();
    if (page === 'subscriptions') renderSubscriptions();
    if (page === 'calendar') renderCalendar();
    if (page === 'insights') renderInsights();
    if (page === 'add') {
        renderTemplates();
        const today = new Date();
        today.setMonth(today.getMonth() + 1);
        document.getElementById('sub-date').value = today.toISOString().split('T')[0];
    }
}

// ============================================
// Dashboard Rendering
// ============================================

function renderDashboard() {
    const subs = state.subscriptions;
    const totalMonthly = subs.reduce((sum, s) => sum + monthlyAmount(s), 0);
    const totalYearly = subs.reduce((sum, s) => sum + yearlyAmount(s), 0);
    const upcomingCount = subs.filter(s => {
        const days = daysUntil(s.renewalDate);
        return days >= 0 && days <= 7;
    }).length;

    document.getElementById('stat-monthly').textContent = fmt(totalMonthly);
    document.getElementById('stat-yearly').textContent = fmt(totalYearly);
    document.getElementById('stat-count').textContent = subs.length;
    document.getElementById('stat-upcoming').textContent = upcomingCount;
    document.getElementById('sidebar-total').textContent = fmt(totalMonthly);

    renderUpcoming();
    renderCategoryChart();
    renderTrendChart();
}

function renderUpcoming() {
    const list = document.getElementById('upcoming-list');
    const upcoming = state.subscriptions
        .map(s => ({ ...s, days: daysUntil(s.renewalDate) }))
        .filter(s => s.days >= 0 && s.days <= 30)
        .sort((a, b) => a.days - b.days)
        .slice(0, 6);

    if (upcoming.length === 0) {
        list.innerHTML = '<p class="empty-state">No upcoming renewals in the next 30 days</p>';
        return;
    }

    list.innerHTML = upcoming.map(s => {
        const urgentClass = s.days <= 1 ? 'urgent' : s.days <= 3 ? 'soon' : '';
        const dayLabel = s.days === 0 ? 'Today' : s.days === 1 ? 'Tomorrow' : `${s.days} days`;
        return `
            <div class="upcoming-item">
                <div class="upcoming-icon" style="background:${s.color}">${getInitials(s.name)}</div>
                <div class="upcoming-info">
                    <div class="upcoming-name">${escapeHtml(s.name)}</div>
                    <div class="upcoming-meta">${formatDate(s.renewalDate)} &middot; ${s.cycle}</div>
                </div>
                <div>
                    <div class="upcoming-price">${fmt(s.price)}</div>
                    <div class="upcoming-days ${urgentClass}">${dayLabel}</div>
                </div>
            </div>
        `;
    }).join('');
}

function getCategoryTotals() {
    const totals = {};
    state.subscriptions.forEach(s => {
        const monthly = monthlyAmount(s);
        totals[s.category] = (totals[s.category] || 0) + monthly;
    });
    return totals;
}

function renderCategoryChart() {
    const ctx = document.getElementById('chart-categories');
    if (!ctx) return;
    const totals = getCategoryTotals();
    const labels = Object.keys(totals).map(k => k.charAt(0).toUpperCase() + k.slice(1));
    const data = Object.values(totals).map(v => parseFloat(v.toFixed(2)));
    const colors = Object.keys(totals).map(k => CATEGORY_COLORS[k] || '#636e72');

    if (state.charts.categories) state.charts.categories.destroy();

    if (data.length === 0) {
        ctx.parentElement.innerHTML = '<p class="empty-state">No subscriptions yet</p>';
        return;
    }

    state.charts.categories = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: '#1e1e30',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#a0a0b8', padding: 12, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: $${ctx.parsed.toFixed(2)}/mo`
                    }
                }
            },
            cutout: '65%',
            animation: { animateScale: true, duration: 800 }
        }
    });
}

function renderTrendChart() {
    const ctx = document.getElementById('chart-trend');
    if (!ctx) return;

    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }

    const totalMonthly = state.subscriptions.reduce((s, x) => s + monthlyAmount(x), 0);
    // Slight variation for demo trend
    const data = months.map((_, i) => {
        const variance = (i / 5) * 0.15 + 0.85;
        return parseFloat((totalMonthly * variance).toFixed(2));
    });

    if (state.charts.trend) state.charts.trend.destroy();

    state.charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Spending',
                data,
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108, 92, 231, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6c5ce7',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `$${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#2a2a40' },
                    ticks: { color: '#a0a0b8' }
                },
                y: {
                    grid: { color: '#2a2a40' },
                    ticks: {
                        color: '#a0a0b8',
                        callback: (v) => '$' + v
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// ============================================
// Subscriptions Page
// ============================================

function renderSubscriptions() {
    const list = document.getElementById('subscriptions-list');
    let subs = [...state.subscriptions];

    if (state.filter !== 'all') {
        subs = subs.filter(s => s.category === state.filter);
    }

    subs.sort((a, b) => monthlyAmount(b) - monthlyAmount(a));

    if (subs.length === 0) {
        list.innerHTML = `
            <div class="empty-state-large">
                <h3>No subscriptions yet</h3>
                <p>Add your first subscription to get started</p>
            </div>
        `;
        return;
    }

    list.innerHTML = subs.map(s => `
        <div class="sub-card" data-id="${s.id}" style="--card-color:${s.color}">
            <div class="sub-card-header">
                <div class="sub-icon" style="background:${s.color}">${getInitials(s.name)}</div>
                <div>
                    <div class="sub-name">${escapeHtml(s.name)}</div>
                    <div class="sub-category">${s.category}</div>
                </div>
            </div>
            <div class="sub-price">${fmt(s.price)}</div>
            <div class="sub-cycle">per ${s.cycle.replace('ly', '')} &middot; ${fmt(monthlyAmount(s))}/mo equiv.</div>
            <div class="sub-renewal">
                <span class="sub-renewal-label">Next renewal</span>
                <span class="sub-renewal-date">${formatDate(s.renewalDate)}</span>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.sub-card').forEach(card => {
        card.addEventListener('click', () => openEditModal(card.dataset.id));
    });
}

// ============================================
// Calendar Page
// ============================================

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearEl = document.getElementById('cal-month-year');

    const year = state.calendarYear;
    const month = state.calendarMonth;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    monthYearEl.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Build map of renewals per day
    const renewalsByDay = {};
    state.subscriptions.forEach(s => {
        const renewals = expandRenewalsForMonth(s, year, month);
        renewals.forEach(day => {
            if (!renewalsByDay[day]) renewalsByDay[day] = [];
            renewalsByDay[day].push(s);
        });
    });

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();

    let html = '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(d => { html += `<div class="cal-day-header">${d}</div>`; });

    for (let i = 0; i < startDayOfWeek; i++) {
        html += '<div class="cal-day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const renewals = renewalsByDay[day] || [];
        const totalAmount = renewals.reduce((s, sub) => s + sub.price, 0);
        const hasRenewals = renewals.length > 0;
        const heavy = totalAmount > 50;
        const isToday = isCurrentMonth && day === todayDate;
        const isSelected = state.selectedDay === day && state.calendarMonth === month && state.calendarYear === year;

        const classes = [
            'cal-day',
            hasRenewals ? 'has-renewals' : '',
            heavy ? 'heavy' : '',
            isToday ? 'today' : '',
            isSelected ? 'selected' : ''
        ].filter(Boolean).join(' ');

        const dotsHtml = renewals.slice(0, 4).map(s =>
            `<span class="cal-dot" style="background:${s.color}"></span>`
        ).join('');

        html += `
            <div class="${classes}" data-day="${day}">
                <div class="cal-day-num">${day}</div>
                ${dotsHtml ? `<div class="cal-day-dots">${dotsHtml}</div>` : ''}
                ${hasRenewals ? `<div class="cal-day-amount">${fmt(totalAmount)}</div>` : ''}
            </div>
        `;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.cal-day:not(.empty)').forEach(el => {
        el.addEventListener('click', () => {
            state.selectedDay = parseInt(el.dataset.day);
            renderCalendar();
            renderCalendarDetails(renewalsByDay[state.selectedDay] || []);
        });
    });

    // Auto-show details for today if no selection
    if (state.selectedDay === null && isCurrentMonth) {
        renderCalendarDetails(renewalsByDay[todayDate] || [], todayDate);
    } else if (state.selectedDay !== null) {
        renderCalendarDetails(renewalsByDay[state.selectedDay] || [], state.selectedDay);
    }
}

function expandRenewalsForMonth(sub, year, month) {
    // Returns array of day numbers in the given month where renewals occur
    const result = [];
    const start = new Date(sub.renewalDate + 'T00:00:00');
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    let cycleDays;
    switch (sub.cycle) {
        case 'weekly': cycleDays = 7; break;
        case 'monthly': cycleDays = null; break; // Same day each month
        case 'quarterly': cycleDays = null; break;
        case 'yearly': cycleDays = null; break;
        default: cycleDays = null;
    }

    if (sub.cycle === 'monthly') {
        // Same day every month
        const day = start.getDate();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const renewalDay = Math.min(day, lastDay);
        if (start <= monthEnd) {
            result.push(renewalDay);
        }
    } else if (sub.cycle === 'quarterly') {
        // Every 3 months from start
        let current = new Date(start);
        while (current <= monthEnd) {
            if (current.getFullYear() === year && current.getMonth() === month) {
                result.push(current.getDate());
            }
            current = new Date(current.getFullYear(), current.getMonth() + 3, current.getDate());
        }
    } else if (sub.cycle === 'yearly') {
        if (start.getMonth() === month && start.getDate() <= new Date(year, month + 1, 0).getDate()) {
            // Find any year >= start year that matches
            if (year >= start.getFullYear()) {
                result.push(start.getDate());
            }
        }
    } else if (sub.cycle === 'weekly') {
        let current = new Date(start);
        while (current <= monthEnd) {
            if (current >= monthStart && current.getMonth() === month && current.getFullYear() === year) {
                result.push(current.getDate());
            }
            current.setDate(current.getDate() + 7);
        }
    }

    return [...new Set(result)];
}

function renderCalendarDetails(subs, day) {
    const details = document.getElementById('calendar-details');
    if (!subs || subs.length === 0) {
        details.innerHTML = `
            <h3>${day ? `Day ${day}` : 'Selected Day'}</h3>
            <p class="empty-state">No renewals on this day</p>
        `;
        return;
    }

    const total = subs.reduce((s, x) => s + x.price, 0);
    details.innerHTML = `
        <h3>${day ? `Day ${day}` : 'Selected Day'} &middot; ${fmt(total)} total</h3>
        <div class="upcoming-list">
            ${subs.map(s => `
                <div class="upcoming-item">
                    <div class="upcoming-icon" style="background:${s.color}">${getInitials(s.name)}</div>
                    <div class="upcoming-info">
                        <div class="upcoming-name">${escapeHtml(s.name)}</div>
                        <div class="upcoming-meta">${s.category} &middot; ${s.cycle}</div>
                    </div>
                    <div class="upcoming-price">${fmt(s.price)}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================
// Insights Page
// ============================================

function renderInsights() {
    renderWasteInsights();
    renderDuplicateInsights();
    renderProjectionInsights();
    renderBreakdownChart();
    renderProjectionChart();
}

function renderWasteInsights() {
    const container = document.getElementById('insight-waste');
    const subs = state.subscriptions;

    const insights = [];

    // Highest spenders
    const sorted = [...subs].sort((a, b) => yearlyAmount(b) - yearlyAmount(a));
    const top3 = sorted.slice(0, 3);

    top3.forEach(s => {
        insights.push({
            name: `${s.name} costs you yearly`,
            value: fmt(yearlyAmount(s))
        });
    });

    // Total streaming/entertainment
    const entertainment = subs.filter(s => s.category === 'entertainment');
    if (entertainment.length > 0) {
        const total = entertainment.reduce((s, x) => s + yearlyAmount(x), 0);
        insights.push({
            name: `Yearly streaming total (${entertainment.length} services)`,
            value: fmt(total)
        });
    }

    if (insights.length === 0) {
        container.innerHTML = '<p class="empty-state">Add subscriptions to see insights</p>';
        return;
    }

    container.innerHTML = insights.map(i => `
        <div class="insight-item">
            <span class="insight-item-name">${escapeHtml(i.name)}</span>
            <span class="insight-item-value">${i.value}</span>
        </div>
    `).join('');
}

function renderDuplicateInsights() {
    const container = document.getElementById('insight-duplicates');
    const subs = state.subscriptions;

    const byCategory = {};
    subs.forEach(s => {
        if (!byCategory[s.category]) byCategory[s.category] = [];
        byCategory[s.category].push(s);
    });

    const duplicates = Object.entries(byCategory)
        .filter(([, list]) => list.length > 1)
        .sort((a, b) => b[1].length - a[1].length);

    if (duplicates.length === 0) {
        container.innerHTML = '<p class="empty-state">No duplicate categories detected</p>';
        return;
    }

    container.innerHTML = duplicates.map(([cat, list]) => `
        <div class="insight-item">
            <span class="insight-item-name">${list.length} ${cat} services</span>
            <span class="insight-item-value">${fmt(list.reduce((s, x) => s + monthlyAmount(x), 0))}/mo</span>
        </div>
    `).join('');
}

function renderProjectionInsights() {
    const container = document.getElementById('insight-projections');
    const subs = state.subscriptions;

    const totalMonthly = subs.reduce((s, x) => s + monthlyAmount(x), 0);
    const totalYearly = totalMonthly * 12;
    const totalFiveYear = totalYearly * 5;
    const totalTenYear = totalYearly * 10;

    const insights = [
        { name: 'Per month', value: fmt(totalMonthly) },
        { name: 'Per year', value: fmt(totalYearly) },
        { name: 'Over 5 years', value: fmt(totalFiveYear) },
        { name: 'Over 10 years', value: fmt(totalTenYear) }
    ];

    container.innerHTML = insights.map(i => `
        <div class="insight-item">
            <span class="insight-item-name">${i.name}</span>
            <span class="insight-item-value">${i.value}</span>
        </div>
    `).join('');
}

function renderBreakdownChart() {
    const ctx = document.getElementById('chart-breakdown');
    if (!ctx) return;

    const totals = getCategoryTotals();
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
    const data = sorted.map(([, v]) => parseFloat((v * 12).toFixed(2)));
    const colors = sorted.map(([k]) => CATEGORY_COLORS[k] || '#636e72');

    if (state.charts.breakdown) state.charts.breakdown.destroy();

    state.charts.breakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Yearly Cost',
                data,
                backgroundColor: colors,
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `$${ctx.parsed.x.toFixed(2)}/year`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#2a2a40' },
                    ticks: {
                        color: '#a0a0b8',
                        callback: (v) => '$' + v
                    },
                    beginAtZero: true
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#a0a0b8' }
                }
            }
        }
    });
}

function renderProjectionChart() {
    const ctx = document.getElementById('chart-projection');
    if (!ctx) return;

    const totalMonthly = state.subscriptions.reduce((s, x) => s + monthlyAmount(x), 0);
    const labels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 10'];
    const data = [1, 2, 3, 4, 5, 10].map(y => parseFloat((totalMonthly * 12 * y).toFixed(2)));

    if (state.charts.projection) state.charts.projection.destroy();

    state.charts.projection = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Cumulative Cost',
                data,
                borderColor: '#ff9f43',
                backgroundColor: 'rgba(255, 159, 67, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#ff9f43',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `$${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#2a2a40' },
                    ticks: { color: '#a0a0b8' }
                },
                y: {
                    grid: { color: '#2a2a40' },
                    ticks: {
                        color: '#a0a0b8',
                        callback: (v) => '$' + v.toLocaleString()
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// ============================================
// Add Page
// ============================================

function renderTemplates() {
    const grid = document.getElementById('templates-grid');
    grid.innerHTML = QUICK_TEMPLATES.map((t, i) => `
        <div class="template-card" data-idx="${i}">
            <div class="template-icon" style="background:${t.color}">${getInitials(t.name)}</div>
            <div class="template-name">${escapeHtml(t.name)}</div>
            <div class="template-price">${fmt(t.price)}/mo</div>
        </div>
    `).join('');

    grid.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const t = QUICK_TEMPLATES[parseInt(card.dataset.idx)];
            const renewalDate = addDaysISO(30);
            addSubscription({
                name: t.name,
                price: t.price,
                cycle: 'monthly',
                category: t.category,
                color: t.color,
                renewalDate
            });
            showToast(`${t.name} added`);
        });
    });
}

// ============================================
// CRUD Operations
// ============================================

function addSubscription(data) {
    const sub = {
        id: uid(),
        name: data.name,
        price: parseFloat(data.price),
        cycle: data.cycle,
        category: data.category,
        color: data.color,
        renewalDate: data.renewalDate
    };
    state.subscriptions.push(sub);
    saveState();
    refreshAll();
}

function updateSubscription(id, data) {
    const idx = state.subscriptions.findIndex(s => s.id === id);
    if (idx === -1) return;
    state.subscriptions[idx] = { ...state.subscriptions[idx], ...data };
    saveState();
    refreshAll();
}

function deleteSubscription(id) {
    state.subscriptions = state.subscriptions.filter(s => s.id !== id);
    saveState();
    refreshAll();
}

function refreshAll() {
    renderDashboard();
    renderSubscriptions();
    renderCalendar();
    renderInsights();
}

// ============================================
// Edit Modal
// ============================================

function openEditModal(id) {
    const sub = state.subscriptions.find(s => s.id === id);
    if (!sub) return;

    document.getElementById('edit-id').value = sub.id;
    document.getElementById('edit-name').value = sub.name;
    document.getElementById('edit-price').value = sub.price;
    document.getElementById('edit-cycle').value = sub.cycle;
    document.getElementById('edit-date').value = sub.renewalDate;
    document.getElementById('edit-category').value = sub.category;
    document.getElementById('edit-color').value = sub.color;

    document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

// ============================================
// Helpers
// ============================================

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filter = btn.dataset.filter;
            renderSubscriptions();
        });
    });

    // Calendar navigation
    document.getElementById('cal-prev').addEventListener('click', () => {
        state.calendarMonth--;
        if (state.calendarMonth < 0) {
            state.calendarMonth = 11;
            state.calendarYear--;
        }
        state.selectedDay = null;
        renderCalendar();
    });

    document.getElementById('cal-next').addEventListener('click', () => {
        state.calendarMonth++;
        if (state.calendarMonth > 11) {
            state.calendarMonth = 0;
            state.calendarYear++;
        }
        state.selectedDay = null;
        renderCalendar();
    });

    // Add form
    document.getElementById('add-form').addEventListener('submit', e => {
        e.preventDefault();
        addSubscription({
            name: document.getElementById('sub-name').value,
            price: document.getElementById('sub-price').value,
            cycle: document.getElementById('sub-cycle').value,
            category: document.getElementById('sub-category').value,
            color: document.getElementById('sub-color').value,
            renewalDate: document.getElementById('sub-date').value
        });
        e.target.reset();
        document.getElementById('sub-color').value = '#6c5ce7';
        showToast('Subscription added!');
        navigateTo('subscriptions');
    });

    // Edit modal
    document.getElementById('modal-close').addEventListener('click', closeEditModal);
    document.getElementById('edit-modal').addEventListener('click', e => {
        if (e.target.id === 'edit-modal') closeEditModal();
    });

    document.getElementById('edit-form').addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        updateSubscription(id, {
            name: document.getElementById('edit-name').value,
            price: parseFloat(document.getElementById('edit-price').value),
            cycle: document.getElementById('edit-cycle').value,
            category: document.getElementById('edit-category').value,
            color: document.getElementById('edit-color').value,
            renewalDate: document.getElementById('edit-date').value
        });
        closeEditModal();
        showToast('Subscription updated!');
    });

    document.getElementById('btn-delete').addEventListener('click', () => {
        const id = document.getElementById('edit-id').value;
        if (confirm('Delete this subscription?')) {
            deleteSubscription(id);
            closeEditModal();
            showToast('Subscription deleted', 'error');
        }
    });

    // Keyboard
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeEditModal();
    });
}

// ============================================
// Initialization
// ============================================

function init() {
    loadState();
    setupEventListeners();
    navigateTo('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
