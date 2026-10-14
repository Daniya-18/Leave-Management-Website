
const $ = s => document.querySelector(s);

async function api(url, options = {}) {
    const r = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    const d = await r.json().catch(() => ({}));

    if (!r.ok) {
        throw Error(d.message || 'Request failed');
    }

    return d;
}

function message(t, type = 'success') {
    const el = $('#message');

    if (!el) {
        alert(t);
        return;
    }

    el.textContent = t;
    el.className = `message show ${type}`;
}

async function initForm() {
    const form = $('#leaveForm');
    if (!form) return;

    try {
        const emps = await api('/api/employees');

        const idSelect = $('#employee_id');
        const nameSelect = $('#employee_name');

        // Clear existing options, keeping the first placeholder
        idSelect.length = 1;
        nameSelect.length = 1;

        emps.forEach(e => {
            // Employee ID dropdown: numbers/IDs only
            idSelect.add(
                new Option(e.employee_id, e.employee_id)
            );

            // Employee Name dropdown: names only
            nameSelect.add(
                new Option(e.employee_name, e.employee_id)
            );
        });

        // Selecting an ID automatically selects its employee name
        idSelect.onchange = () => {
            nameSelect.value = idSelect.value;
        };

        // Selecting a name automatically selects its employee ID
        nameSelect.onchange = () => {
            idSelect.value = nameSelect.value;
        };

    } catch (e) {
        message(e.message, 'error');
    }

    form.onsubmit = async ev => {
        ev.preventDefault();

        const p = Object.fromEntries(
            new FormData(form).entries()
        );

        p.employee_name =
            $('#employee_name').selectedOptions[0]?.textContent || '';

        try {
            const d = await api('/api/leaves', {
                method: 'POST',
                body: JSON.stringify(p)
            });

            message(d.message);
            form.reset();
        } catch (e) {
            message(e.message, 'error');
        }
    };
}

function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

async function loadRows() {
    const body = $('#leaveRows');
    if (!body) return;

    try {
        const rows = await api('/api/leaves');

        body.innerHTML = rows.length
            ? rows.map((x, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${esc(x.employee_id)}</td>
                    <td>${esc(x.employee_name)}</td>
                    <td>${esc(x.leave_type)}</td>
                    <td>${esc(x.no_of_days)}</td>
                    <td>${esc(x.description)}</td>
                    <td>
                        <span class="pill ${esc(x.status)}">
                            ${esc(x.status)}
                        </span>
                    </td>
                    ${body.dataset.manage === 'true' ? `
                        <td>
                            <div class="actions">
                                <button class="btn green"
                                    data-status="Approved"
                                    data-id="${x.id}">Approve</button>
                                <button class="btn red"
                                    data-status="Rejected"
                                    data-id="${x.id}">Reject</button>
                                <button class="btn light"
                                    data-delete="${x.id}">Delete</button>
                            </div>
                        </td>
                    ` : ''}
                </tr>
            `).join('')
            : `<tr>
                <td colspan="8" class="empty">
                    No leave requests yet. Apply for leave to see records here.
                </td>
              </tr>`;

        const set = (id, n) => {
            if ($(id)) $(id).textContent = n;
        };

        set('#totalCount', rows.length);
        set('#pendingCount', rows.filter(x => x.status === 'Pending').length);
        set('#approvedCount', rows.filter(x => x.status === 'Approved').length);
        set('#rejectedCount', rows.filter(x => x.status === 'Rejected').length);

    } catch (e) {
        body.innerHTML = `<tr>
            <td colspan="8" class="empty">${esc(e.message)}</td>
        </tr>`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initForm();
    await loadRows();

    const b = $('#leaveRows');

    if (b) {
        b.onclick = async e => {
            const s = e.target.closest('[data-status]');
            const d = e.target.closest('[data-delete]');

            try {
                if (s) {
                    await api(`/api/leaves/${s.dataset.id}/status`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            status: s.dataset.status
                        })
                    });

                    await loadRows();

                } else if (d && confirm('Delete this leave request?')) {
                    await api(`/api/leaves/${d.dataset.delete}`, {
                        method: 'DELETE'
                    });

                    await loadRows();
                }
            } catch (err) {
                alert(err.message);
            }
        };
    }
});
