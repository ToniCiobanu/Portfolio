// Small shared helpers for the project pages. No dependencies.

const fmt = {
    usd: (n, digits = 2) => n == null ? '—' :
        '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    pct: (n, digits = 1) => n == null ? '—' : Number(n).toFixed(digits) + '%',
    int: (n) => n == null ? '—' : Number(n).toLocaleString('en-US'),
};

// Fill every element that has data-value="path.to.value" from a results object,
// formatted by data-format (usd, usd0, pct, pct2, int, x). Keeps prose and numbers in sync.
function bindValues(root, data) {
    root.querySelectorAll('[data-value]').forEach(el => {
        const v = el.dataset.value.split('.').reduce((o, k) => o?.[k], data);
        if (v === undefined) { el.textContent = '??'; console.error('missing value', el.dataset.value); return; }
        const f = el.dataset.format;
        el.textContent =
            f === 'usd' ? fmt.usd(v) :
            f === 'usd0' ? fmt.usd(v, 0) :
            f === 'pct' ? fmt.pct(v, 1) :
            f === 'pct2' ? fmt.pct(v, 2) :
            f === 'pct0' ? fmt.pct(v, 0) :
            f === 'int' ? fmt.int(v) :
            f === 'x' ? v + '×' :
            f === 'signed-pct' ? (v > 0 ? '+' : '') + fmt.pct(v, 1) :
            String(v);
    });
}

// columns: [{ key, label, num?: bool, format?: fn(value,row), cls?: fn(value,row) }]
function renderTable(el, columns, rows, { total, sortable = false } = {}) {
    let sortKey = null, asc = true;
    const draw = () => {
        let data = rows.slice();
        if (sortKey) {
            data.sort((a, b) => {
                const av = a[sortKey], bv = b[sortKey];
                if (av == null) return 1;
                if (bv == null) return -1;
                return (av < bv ? -1 : av > bv ? 1 : 0) * (asc ? 1 : -1);
            });
        }
        const head = columns.map(c =>
            `<th class="${c.num ? 'num' : ''} ${sortable ? 'sortable' : ''}" data-key="${c.key}">${c.label}${sortable && sortKey === c.key ? (asc ? ' ↑' : ' ↓') : ''}</th>`).join('');
        const cell = (c, r) => {
            const v = r[c.key];
            const text = c.format ? c.format(v, r) : (v ?? '—');
            const cls = [c.num ? 'num' : '', c.wrap ? 'wrap-text' : '', c.cls ? c.cls(v, r) : ''].join(' ');
            return `<td class="${cls}">${text}</td>`;
        };
        const body = data.map(r => `<tr>${columns.map(c => cell(c, r)).join('')}</tr>`).join('');
        const foot = total ? `<tr class="total">${columns.map(c => cell(c, total)).join('')}</tr>` : '';
        el.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}${foot}</tbody></table>`;
        if (sortable) {
            el.querySelectorAll('th').forEach(th => th.addEventListener('click', () => {
                if (sortKey === th.dataset.key) asc = !asc; else { sortKey = th.dataset.key; asc = true; }
                draw();
            }));
        }
    };
    draw();
}

// Code is inserted as text, never HTML, so "<" in a for-loop can't eat the rest of the page.
function showCode(el, text) { el.textContent = text.trim(); }

function setupTabs(tabBar, onSelect) {
    const buttons = tabBar.querySelectorAll('button');
    buttons.forEach(b => b.addEventListener('click', () => {
        buttons.forEach(x => x.classList.toggle('active', x === b));
        onSelect(b.dataset.tab);
    }));
    buttons[0].click();
}

function chartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.color = '#a3a3a8';
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.maintainAspectRatio = false;
}
