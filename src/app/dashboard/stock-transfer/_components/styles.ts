export const stockPageStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pg {
    min-height: 100vh;
    background: #f5f6fa;
    font-family: 'Geist', 'DM Sans', 'Segoe UI', sans-serif;
    padding: 36px 32px;
    color: #1a1d27;
  }

  /* ── Page Header ── */
  .pg-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
  .pg-title { font-size: 28px; font-weight: 750; letter-spacing: -0.5px; }
  .pg-sub { font-size: 14px; color: #8890a4; margin-top: 4px; font-weight: 400; }
  .hdr-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* ── Buttons ── */
  .btn-in {
    display: flex; align-items: center; gap: 7px;
    background: #16a34a; color: #fff;
    border: none; border-radius: 10px; padding: 10px 18px;
    font-size: 13.5px; font-weight: 650; cursor: pointer;
    box-shadow: 0 2px 12px rgba(22,163,74,0.28); transition: all .18s;
  }
  .btn-in:hover { background: #15803d; transform: translateY(-1px); }
  .btn-out {
    display: flex; align-items: center; gap: 7px;
    background: #ef4444; color: #fff;
    border: none; border-radius: 10px; padding: 10px 18px;
    font-size: 13.5px; font-weight: 650; cursor: pointer;
    box-shadow: 0 2px 12px rgba(239,68,68,0.24); transition: all .18s;
  }
  .btn-out:hover { background: #dc2626; transform: translateY(-1px); }
  .btn-outline {
    background: #fff; border: 1.5px solid #e2e5ef; color: #4b5270;
    border-radius: 10px; padding: 10px 18px;
    font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .15s;
  }
  .btn-outline:hover { border-color: #c0c6d9; background: #f8f9fc; }

  /* ── Stats ── */
  .stats-row { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-card {
    background: #fff; border: 1.5px solid #eaecf3; border-radius: 14px;
    padding: 16px 22px; flex: 1; min-width: 140px;
  }
  .stat-label { font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: #9099b3; margin-bottom: 6px; }
  .stat-value { font-size: 26px; font-weight: 750; letter-spacing: -0.5px; color: #1a1d27; }
  .stat-value.green { color: #16a34a; }
  .stat-value.red { color: #ef4444; }
  .stat-value.amber { color: #d97706; }

  /* ── Tabs ── */
  .tabs { display: flex; gap: 2px; background: #eef0f7; padding: 4px; border-radius: 12px; width: fit-content; margin-bottom: 22px; }
  .tab {
    padding: 8px 20px; border-radius: 9px; font-size: 13.5px; font-weight: 600;
    cursor: pointer; border: none; background: transparent; color: #7880a0; transition: all .15s;
  }
  .tab.active { background: #fff; color: #1a1d27; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }

  /* ── Toolbar ── */
  .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
  .search-wrap { position: relative; flex: 1; min-width: 220px; max-width: 400px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9099b3; }
  .search-input {
    width: 100%; background: #fff; border: 1.5px solid #eaecf3;
    border-radius: 10px; padding: 9px 12px 9px 38px;
    font-size: 13.5px; color: #1a1d27; outline: none; transition: border-color .18s;
  }
  .search-input::placeholder { color: #b0b8cc; }
  .search-input:focus { border-color: #6366f1; }
  .low-stock-btn {
    display: flex; align-items: center; gap: 7px;
    background: #fff; border: 1.5px solid #eaecf3;
    border-radius: 10px; padding: 9px 16px;
    font-size: 13px; font-weight: 600; color: #7880a0; cursor: pointer; transition: all .15s;
    white-space: nowrap;
  }
  .low-stock-btn.active { border-color: #f59e0b; background: #fffbeb; color: #d97706; }

  /* ── Table ── */
  .tbl-wrap { background: #fff; border: 1.5px solid #eaecf3; border-radius: 16px; overflow: hidden; }
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl thead tr { background: #f8f9fc; }
  .tbl th {
    padding: 13px 18px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: #9099b3; border-bottom: 1.5px solid #eaecf3;
    white-space: nowrap;
  }
  .tbl td { padding: 14px 18px; font-size: 13.5px; color: #2c3252; border-bottom: 1px solid #f1f3f9; vertical-align: middle; }
  .tbl tbody tr:last-child td { border-bottom: none; }
  .tbl tbody tr:hover td { background: #fafbff; }

  /* ── Product cell ── */
  .prod-cell { display: flex; align-items: center; gap: 12px; }
  .prod-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #eef0fb; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .prod-name { font-weight: 650; font-size: 14px; color: #1a1d27; }
  .prod-sku { font-size: 12px; color: #9099b3; margin-top: 1px; }

  /* ── Stock badge ── */
  .stock-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 42px; height: 28px; border-radius: 8px; padding: 0 8px;
    font-size: 13px; font-weight: 700;
  }
  .stock-ok { background: #dcfce7; color: #16a34a; }
  .stock-low { background: #fef9c3; color: #ca8a04; }
  .stock-zero { background: #fee2e2; color: #ef4444; }

  /* ── Category pill ── */
  .cat-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 50px;
    font-size: 12px; font-weight: 600;
  }
  .cat-dot { width: 6px; height: 6px; border-radius: 50%; }

  /* ── Amount ── */
  .amt { font-weight: 650; }
  .amt-green { color: #16a34a; }
  .amt-red { color: #ef4444; }

  /* ── Type badge ── */
  .type-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 6px;
    font-size: 11.5px; font-weight: 700; letter-spacing: 0.3px;
  }
  .type-in { background: #dcfce7; color: #16a34a; }
  .type-out { background: #fee2e2; color: #ef4444; }

  /* ── Empty ── */
  .empty { text-align: center; padding: 60px 20px; color: #9099b3; }
  .empty-icon { font-size: 42px; margin-bottom: 12px; opacity: .5; }
  .empty p { font-size: 15px; }

  /* ── Skeleton ── */
  @keyframes sh { 0%,100%{opacity:.45} 50%{opacity:.8} }
  .sk { background: #f0f2f8; border-radius: 6px; animation: sh 1.4s infinite; }
  .sk-row td { padding: 14px 18px; }

  /* ── Pagination ── */
  .pag { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-top: 1.5px solid #eaecf3; flex-wrap: wrap; gap: 10px; }
  .pag-info { font-size: 13px; color: #9099b3; }
  .pag-btns { display: flex; gap: 6px; }
  .pag-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #eaecf3;
    background: #fff; color: #4b5270; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s;
  }
  .pag-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
  .pag-btn:disabled { opacity: .4; cursor: not-allowed; }
  .pag-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }

  /* ── Modal ── */
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(20,22,36,0.45); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .modal {
    background: #fff; border-radius: 18px; width: 100%; max-width: 580px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    max-height: 90vh; overflow-y: auto;
    animation: slideUp .2s ease;
  }
  @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:none;opacity:1} }
  .modal-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 0; position: sticky; top: 0; background: #fff; z-index: 1;
    padding-bottom: 16px; border-bottom: 1.5px solid #f1f3f9;
  }
  .modal-head-left { display: flex; align-items: center; gap: 12px; }
  .modal-head h2 { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
  .modal-badge {
    padding: 3px 10px; border-radius: 6px; font-size: 11px;
    font-weight: 800; letter-spacing: 1.2px;
  }
  .modal-badge.in { background: #dcfce7; color: #16a34a; }
  .modal-badge.out { background: #fee2e2; color: #ef4444; }
  .close-btn {
    width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #eaecf3;
    background: transparent; color: #9099b3; cursor: pointer; font-size: 13px;
    display: flex; align-items: center; justify-content: center; transition: all .15s;
    flex-shrink: 0;
  }
  .close-btn:hover { background: #f5f6fa; }
  .modal-body { padding: 20px 24px 24px; }
  .form-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
  .form-grid2.full { grid-template-columns: 1fr; }
  .fg { display: flex; flex-direction: column; gap: 6px; }
  .fg.span2 { grid-column: span 2; }
  .fg label { font-size: 12px; font-weight: 650; color: #6b7494; letter-spacing: 0.2px; }
  .fg input, .fg textarea, .fg select {
    background: #f8f9fc; border: 1.5px solid #eaecf3;
    border-radius: 9px; padding: 9px 12px;
    font-size: 13.5px; color: #1a1d27; outline: none; transition: border-color .15s;
    font-family: inherit; appearance: none; -webkit-appearance: none;
  }
  .fg select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239099b3' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 36px; cursor: pointer;
  }
  .fg input:focus, .fg textarea:focus, .fg select:focus { border-color: #6366f1; background: #fff; }
  .fg select:disabled { opacity: 0.5; cursor: not-allowed; }
  .modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
  .btn-primary-green {
    background: #16a34a; color: #fff; border: none;
    border-radius: 10px; padding: 10px 22px;
    font-size: 14px; font-weight: 700; cursor: pointer; transition: all .18s;
    min-width: 160px; display: flex; align-items: center; justify-content: center;
  }
  .btn-primary-green:hover { background: #15803d; }
  .btn-primary-green:disabled { opacity: .6; cursor: not-allowed; }
  .btn-primary-red {
    background: #ef4444; color: #fff; border: none;
    border-radius: 10px; padding: 10px 22px;
    font-size: 14px; font-weight: 700; cursor: pointer; transition: all .18s;
    min-width: 160px; display: flex; align-items: center; justify-content: center;
  }
  .btn-primary-red:hover { background: #dc2626; }
  .btn-primary-red:disabled { opacity: .6; cursor: not-allowed; }
  .err-banner { background: #fee2e2; color: #b91c1c; border-radius: 9px; padding: 10px 14px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }

  /* ── Serial Numbers ── */
  .sn-section { margin-top: 4px; }
  .sn-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .sn-label-row span { font-size: 12px; font-weight: 650; color: #6b7494; }
  .sn-count { font-size: 11px; background: #eef0fb; color: #6366f1; padding: 2px 8px; border-radius: 20px; font-weight: 700; transition: all .2s; }
  .sn-count-ok { background: #dcfce7 !important; color: #16a34a !important; }
  .sn-input-row { display: flex; gap: 8px; margin-bottom: 10px; }
  .sn-input-row input { flex: 1; background: #f8f9fc; border: 1.5px solid #eaecf3; border-radius: 9px; padding: 8px 12px; font-size: 13px; color: #1a1d27; outline: none; transition: border-color .15s; font-family: inherit; }
  .sn-input-row input:focus { border-color: #6366f1; background: #fff; }
  .sn-add-btn { background: #6366f1; color: #fff; border: none; border-radius: 9px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .15s; }
  .sn-add-btn:hover { background: #4f46e5; }
  .sn-tags { display: flex; flex-wrap: wrap; gap: 7px; }
  .sn-tag { display: inline-flex; align-items: center; gap: 6px; background: #f0f1ff; border: 1.5px solid #dde0ff; color: #4338ca; border-radius: 7px; padding: 4px 10px; font-size: 12px; font-weight: 600; font-family: monospace; }
  .sn-tag button { background: none; border: none; cursor: pointer; color: #9095c0; font-size: 14px; line-height: 1; padding: 0 0 0 2px; }
  .sn-tag button:hover { color: #ef4444; }
  .sn-empty { font-size: 12px; color: #b0b8cc; font-style: italic; }

  /* ── Serial Checkbox list (Stock Out) ── */
  .sn-list { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; border: 1.5px solid #eaecf3; border-radius: 10px; padding: 8px; background: #fafbff; }
  .sn-list::-webkit-scrollbar { width: 5px; }
  .sn-list::-webkit-scrollbar-track { background: transparent; }
  .sn-list::-webkit-scrollbar-thumb { background: #d5d9e8; border-radius: 10px; }
  .sn-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: background .12s; }
  .sn-item:hover { background: #f0f1ff; }
  .sn-item.checked { background: #f0f1ff; }
  .sn-checkbox { width: 16px; height: 16px; border-radius: 4px; border: 2px solid #d0d4e8; appearance: none; -webkit-appearance: none; cursor: pointer; transition: all .15s; flex-shrink: 0; }
  .sn-checkbox:checked { background: #6366f1; border-color: #6366f1; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: center; background-size: 10px; }
  .sn-item-text { font-size: 13px; font-family: monospace; color: #2c3252; font-weight: 600; }
  .sn-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px; color: #9099b3; font-size: 13px; }
  .sn-select-all { font-size: 12px; color: #6366f1; font-weight: 600; cursor: pointer; background: none; border: none; padding: 0; }
  .sn-select-all:hover { text-decoration: underline; }
  .sn-info { font-size: 12px; color: #9099b3; margin-top: 6px; }
  .sn-warn { font-size: 12px; color: #d97706; background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 8px; padding: 8px 12px; margin-top: 8px; }

  /* ── Section divider ── */
  .section-divider { border: none; border-top: 1.5px solid #f1f3f9; margin: 16px 0; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #9099b3; margin-bottom: 12px; }

  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { width: 16px; height: 16px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }
  .mini-spin { width: 14px; height: 14px; border: 2px solid #d0d4e8; border-top-color: #6366f1; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
    background: #1a1d27; color: #fff; border-radius: 50px;
    padding: 11px 22px; font-size: 13.5px; font-weight: 500;
    box-shadow: 0 6px 30px rgba(0,0,0,.25); z-index: 200;
    display: flex; align-items: center; gap: 8px;
    animation: toastIn .22s ease; white-space: nowrap;
  }
  .toast-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  @media (max-width: 640px) {
    .pg { padding: 20px 16px; }
    .form-grid2 { grid-template-columns: 1fr; }
    .form-grid2 .fg.span2 { grid-column: span 1; }
    .pg-title { font-size: 22px; }
    .tbl-wrap { overflow-x: auto; }
    .modal { max-width: 100%; }
  }
`