// IncubaSmart — recruiter/demo upgrade
// Transparent rule-based prototype. No trained ML model is claimed.

const form = document.getElementById('startupForm');
const emptyState = document.getElementById('emptyState');
const resultBody = document.getElementById('resultBody');
const HISTORY_KEY = 'incubasmart_history_v2';
const THEME_KEY = 'incubasmart_theme';

const $ = id => document.getElementById(id);
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

function initTheme() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $('themeToggle').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  localStorage.setItem(THEME_KEY, theme);
}
$('themeToggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

function analyze(data) {
  const breakdown = [];
  let score = 0;
  const growthPts = data.growth >= 20 ? 3 : data.growth >= 10 ? 2 : 1;
  const revenuePts = data.revenue >= 100000 ? 3 : data.revenue >= 50000 ? 2 : 1;
  const fundingPts = data.funding >= 500000 ? 2 : data.funding >= 200000 ? 1 : 0;
  const teamPts = data.teamSize >= 5 ? 2 : 1;
  const expenses = Math.max(0, Number(data.expenses || 0));
  const monthlyBurn = Math.max(0, expenses - Number(data.revenue || 0));
  const runwayMonths = monthlyBurn > 0 ? Number(data.funding || 0) / monthlyBurn : Infinity;
  const financialHealth = expenses === 0 ? 'Not provided' : (Number(data.revenue || 0) >= expenses ? 'Positive cash flow' : runwayMonths >= 12 ? 'Stable runway' : runwayMonths >= 6 ? 'Watch runway' : 'High burn');
  score = growthPts + revenuePts + fundingPts + teamPts;

  breakdown.push({label:'Growth', points:growthPts, max:3});
  breakdown.push({label:'Revenue', points:revenuePts, max:3});
  breakdown.push({label:'Funding', points:fundingPts, max:2});
  breakdown.push({label:'Team Size', points:teamPts, max:2});

  const growthPotential = score >= 8 ? 'High' : score >= 5 ? 'Medium' : 'Low';
  const riskLevel = score >= 8 ? 'Low' : score >= 5 ? 'Medium' : 'High';

  const gaps = [
    {name:'Funding Support', value: fundingPts, max:2, need:data.funding < 500000},
    {name:'Growth Mentorship', value: growthPts, max:3, need:data.growth < 20},
    {name:'Technical Mentorship', value: teamPts, max:2, need:data.teamSize < 5},
    {name:'Market Expansion', value: growthPts, max:3, need:data.growth >= 20}
  ];
  const recommendations = [];
  if (data.growth < 10) recommendations.push('Business Growth Mentorship');
  if (data.funding < 500000) recommendations.push('Funding Support');
  if (data.teamSize < 5) recommendations.push('Technical Mentorship');
  if (data.growth >= 20) recommendations.push('Marketing & Market Expansion');
  if (!recommendations.length) recommendations.push('Skill Training & Network Access');

  let priority = 'Growth Enablement';
  let nextAction = 'Scale market reach';
  let actionReason = 'Strong growth indicates that market expansion can be tested next.';
  if (data.funding < 200000) {
    priority = 'Funding Readiness';
    nextAction = 'Prepare a funding-readiness plan';
    actionReason = 'Low funding is the clearest resource gap in the current profile.';
  } else if (data.teamSize < 5) {
    priority = 'Team Capability';
    nextAction = 'Strengthen the technical team';
    actionReason = 'A larger or more capable team can reduce execution bottlenecks.';
  } else if (data.growth < 10) {
    priority = 'Growth Recovery';
    nextAction = 'Run a customer-growth intervention';
    actionReason = 'Growth is below the prototype threshold for a high-potential profile.';
  } else if (data.revenue < 50000) {
    priority = 'Revenue Validation';
    nextAction = 'Focus on revenue conversion';
    actionReason = 'Revenue is the main weak point in the current score.';
  }

  return {score, breakdown, growthPotential, riskLevel, recommendations, priority, nextAction, actionReason, gaps, financialHealth, runwayMonths, monthlyBurn};
}

function getFormData() {
  return {
    name: $('startupName').value.trim(),
    industry: $('industry').value,
    teamSize: Number($('teamSize').value),
    funding: Number($('funding').value),
    revenue: Number($('revenue').value),
    expenses: Number($('expenses').value),
    growth: Number($('growth').value)
  };
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = getFormData();
  if (!data.name || !data.industry || data.teamSize < 1 || data.funding < 0 || data.revenue < 0 || data.expenses < 0 || data.growth < 0) {
    alert('Please enter valid startup details.');
    return;
  }
  const analysis = analyze(data);
  renderResult(data, analysis);
  saveToHistory(data, analysis);
  renderHistory();
  renderChart();
  updateKPIs();
  renderAllocation(data, analysis);
  updatePortfolioPulse();
});

function renderResult(data, analysis) {
  emptyState.classList.add('hidden');
  resultBody.classList.remove('hidden');
  $('resStartup').textContent = data.name;
  $('resIndustry').textContent = data.industry;
  $('resGrowth').textContent = analysis.growthPotential;
  $('resGrowth').className = 'value-tag ' + analysis.growthPotential;
  $('resRisk').textContent = analysis.riskLevel;
  $('resRisk').className = 'value-tag ' + analysis.riskLevel;
  $('resScore').textContent = analysis.score + ' / 10';
  $('resPriority').textContent = analysis.priority;
  $('resFinancial').textContent = analysis.financialHealth;
  $('resRunway').textContent = Number.isFinite(analysis.runwayMonths) ? analysis.runwayMonths.toFixed(1) + ' months' : '12+ months';

  const barsWrap = $('breakdownBars');
  barsWrap.innerHTML = '';
  analysis.breakdown.forEach(item => {
    const pct = Math.round(item.points / item.max * 100);
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<span>${item.label}</span><span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span><span>${item.points}/${item.max}</span>`;
    barsWrap.appendChild(row);
  });

  const list = $('resList');
  list.innerHTML = '';
  analysis.recommendations.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    list.appendChild(li);
  });
  $('nextAction').textContent = analysis.nextAction;
  $('actionReason').textContent = analysis.actionReason;

  $('copyBtn').onclick = () => {
    const summary = `IncubaSmart Decision Snapshot
Startup: ${data.name}
Industry: ${data.industry}
Score: ${analysis.score}/10
Growth Potential: ${analysis.growthPotential}
Risk: ${analysis.riskLevel}
Resource Priority: ${analysis.priority}
Recommended Resources: ${analysis.recommendations.join(', ')}
Next Action: ${analysis.nextAction}`;
    navigator.clipboard?.writeText(summary);
    $('copyBtn').textContent = 'Copied';
    setTimeout(() => $('copyBtn').textContent = 'Copy', 1200);
  };

  $('downloadBtn').onclick = () => downloadReport(data, analysis);
}

function downloadReport(data, analysis) {
  const lines = [
    'INCUBASMART — STARTUP DECISION REPORT',
    '====================================',
    `Startup: ${data.name}`,
    `Industry: ${data.industry}`,
    `Team Size: ${data.teamSize}`,
    `Funding Raised: ${money(data.funding)}`,
    `Monthly Revenue: ${money(data.revenue)}`,
    `Monthly Operating Expenses: ${money(data.expenses)}`,
    `Financial Health: ${analysis.financialHealth}`,
    `Estimated Runway: ${Number.isFinite(analysis.runwayMonths) ? analysis.runwayMonths.toFixed(1) + ' months' : '12+ months'}`,
    `Monthly Growth: ${data.growth}%`,
    '',
    `Composite Score: ${analysis.score}/10`,
    `Growth Potential: ${analysis.growthPotential}`,
    `Risk Level: ${analysis.riskLevel}`,
    `Resource Priority: ${analysis.priority}`,
    '',
    'Recommended Resources:',
    ...analysis.recommendations.map(x => `- ${x}`),
    '',
    `Next Strategic Action: ${analysis.nextAction}`,
    `Reason: ${analysis.actionReason}`,
    '',
    'Prototype note: transparent rule-based scoring; not a trained production ML model.'
  ];
  const blob = new Blob([lines.join('\n')], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = data.name.replace(/[^a-z0-9]+/gi,'_') + '_IncubaSmart_Report.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function renderAllocation(data, analysis) {
  $('allocationEmpty').classList.add('hidden');
  $('allocationBody').classList.remove('hidden');

  const budget = analysis.score >= 8 ? 1000000 : analysis.score >= 5 ? 700000 : 450000;
  const allocation = [
    {name:'Funding / Capital', pct:data.funding < 500000 ? 40 : 25},
    {name:'Mentorship', pct:data.growth < 20 ? 25 : 15},
    {name:'Technology', pct:data.teamSize < 5 ? 25 : 15},
    {name:'Market Access', pct:data.growth >= 20 ? 35 : 20}
  ];
  const total = allocation.reduce((s,x) => s+x.pct, 0);
  allocation.forEach(x => x.pct = Math.round(x.pct / total * 100));

  const primary = allocation.slice().sort((a,b)=>b.pct-a.pct)[0];
  $('allocBudget').textContent = money(budget);
  $('allocPrimary').textContent = primary.name;
  $('allocFocus').textContent = analysis.priority;

  const wrap = $('allocationBars');
  wrap.innerHTML = '';
  allocation.forEach(x => {
    const row = document.createElement('div');
    row.className = 'allocation-row';
    row.innerHTML = `<div><span>${x.name}</span><strong>${x.pct}%</strong></div><div class="bar-track"><span class="bar-fill" style="width:${x.pct}%"></span></div><small>${money(Math.round(budget*x.pct/100))}</small>`;
    wrap.appendChild(row);
  });
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveToHistory(data, analysis) {
  const history = loadHistory();
  history.unshift({data, analysis, time:Date.now()});
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0,20)));
}
function renderHistory() {
  const list = $('historyList');
  const history = loadHistory();
  list.innerHTML = '';
  if (!history.length) {
    list.innerHTML = '<li class="history-empty">No startups analyzed yet.</li>';
    return;
  }
  history.forEach(entry => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'history-item';
    btn.type = 'button';
    btn.innerHTML = `<p class="h-name">${escapeHtml(entry.data.name)}</p><p class="h-meta">${entry.data.industry} · ${entry.analysis.score}/10 · ${entry.analysis.priority}</p>`;
    btn.onclick = () => {
      $('startupName').value = entry.data.name;
      $('industry').value = entry.data.industry;
      $('teamSize').value = entry.data.teamSize;
      $('funding').value = entry.data.funding;
      $('revenue').value = entry.data.revenue;
      $('expenses').value = entry.data.expenses ?? 0;
      $('growth').value = entry.data.growth;
      renderResult(entry.data, entry.analysis);
      renderAllocation(entry.data, entry.analysis);
      window.scrollTo({top:0,behavior:'smooth'});
    };
    li.appendChild(btn); list.appendChild(li);
  });
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function renderChart() {
  const history = loadHistory();
  const card = $('chartCard');
  const wrap = $('chartBars');
  if (!history.length) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  wrap.innerHTML = '';
  history.slice(0,8).reverse().forEach(entry => {
    const col = document.createElement('div');
    col.className = 'chart-col';
    const h = Math.max(8, entry.analysis.score * 10);
    col.innerHTML = `<span class="chart-score">${entry.analysis.score}</span><span class="chart-bar" style="height:${h}%"></span><span class="chart-label">${escapeHtml(entry.data.name)}</span>`;
    wrap.appendChild(col);
  });
}

function updateKPIs() {
  const h = loadHistory();
  $('kpiStartups').textContent = h.length;
  if (!h.length) {
    $('kpiAvg').textContent = '—'; $('kpiHigh').textContent = '0'; $('kpiFocus').textContent = '—'; return;
  }
  const avg = h.reduce((s,x)=>s+x.analysis.score,0)/h.length;
  $('kpiAvg').textContent = avg.toFixed(1);
  $('kpiHigh').textContent = h.filter(x=>x.analysis.score>=8).length;
  const counts = {};
  h.forEach(x => counts[x.analysis.priority] = (counts[x.analysis.priority]||0)+1);
  $('kpiFocus').textContent = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
}

// Demo data
$('demoBtn').addEventListener('click', () => {
  $('startupName').value = 'NovaLearn';
  $('industry').value = 'EdTech';
  $('teamSize').value = 6;
  $('growth').value = 24;
  $('funding').value = 650000;
  $('revenue').value = 145000;
  $('expenses').value = 110000;
  form.requestSubmit();
});

// Scenario simulator
const simDefaults = {growth:20,revenue:100000,funding:500000,team:5};
function formatShortMoney(n) {
  if (n >= 1000000) return '₹' + (n/1000000).toFixed(1) + 'M';
  if (n >= 100000) return '₹' + (n/100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n/1000).toFixed(0) + 'K';
  return '₹' + n;
}
function updateSimulator() {
  const data = {
    name:'Scenario', industry:'Other',
    growth:Number($('simGrowth').value),
    revenue:Number($('simRevenue').value),
    funding:Number($('simFunding').value),
    expenses:Number($('simRevenue').value) * 0.8,
    teamSize:Number($('simTeam').value)
  };
  const a = analyze(data);
  $('simGrowthOut').textContent = data.growth + '%';
  $('simRevenueOut').textContent = formatShortMoney(data.revenue);
  $('simFundingOut').textContent = formatShortMoney(data.funding);
  $('simTeamOut').textContent = data.teamSize + (data.teamSize===1?' person':' people');
  $('simScore').textContent = a.score + ' / 10';
  $('simPotential').textContent = a.growthPotential;
  $('simRisk').textContent = a.riskLevel;
  $('simGap').textContent = a.score >= 8 ? '0 points' : (8-a.score) + ' point' + (8-a.score===1?'':'s') + ' to high potential';
}
['simGrowth','simRevenue','simFunding','simTeam'].forEach(id => $(id).addEventListener('input', updateSimulator));
$('resetSim').addEventListener('click', () => {
  $('simGrowth').value=simDefaults.growth; $('simRevenue').value=simDefaults.revenue; $('simFunding').value=simDefaults.funding; $('simTeam').value=simDefaults.team; updateSimulator();
});

// CSV ingestion
let batchRows = [];
$('csvFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => processCSV(reader.result);
  reader.readAsText(file);
});
function processCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) { $('csvStatus').textContent='CSV needs a header and at least one data row.'; return; }
  const headers = lines[0].split(',').map(x=>x.trim());
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(x=>x.trim());
    const obj = {};
    headers.forEach((h,i)=>obj[h]=vals[i] ?? '');
    return obj;
  }).filter(r => r.name);
  batchRows = rows.map(r => {
    const data = {
      name:r.name, industry:r.industry || 'Other',
      teamSize:Number(r.teamSize || r.team || 1),
      funding:Number(r.funding || 0),
      revenue:Number(r.revenue || 0),
      expenses:Number(r.expenses || r.monthlyExpenses || 0),
      growth:Number(r.growth || 0)
    };
    return {data, analysis:analyze(data)};
  });
  $('csvStatus').textContent = `${batchRows.length} records processed successfully.`;
  $('batchResult').classList.remove('hidden');
  $('batchCount').textContent = `${batchRows.length} records analysed`;
  const tbody = $('batchTable'); tbody.innerHTML='';
  batchRows.forEach(x => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(x.data.name)}</td><td>${escapeHtml(x.data.industry)}</td><td>${x.analysis.score}/10</td><td>${x.analysis.growthPotential}</td><td>${x.analysis.riskLevel}</td><td>${x.analysis.priority}</td>`;
    tbody.appendChild(tr);
  });
}
$('downloadCsvBtn').addEventListener('click', () => {
  if (!batchRows.length) return;
  const lines = ['name,industry,score,growthPotential,riskLevel,resourcePriority,financialHealth,runwayMonths'];
  batchRows.forEach(x => lines.push([x.data.name,x.data.industry,x.analysis.score,x.analysis.growthPotential,x.analysis.riskLevel,x.analysis.priority,x.analysis.financialHealth,(Number.isFinite(x.analysis.runwayMonths)?x.analysis.runwayMonths.toFixed(1):'12+')].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')));
  const blob = new Blob([lines.join('\n')], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='incubasmart_analysed_portfolio.csv'; a.click(); URL.revokeObjectURL(url);
});

$('clearHistoryBtn').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory(); renderChart(); updateKPIs(); updatePortfolioPulse();
  $('allocationEmpty').classList.remove('hidden'); $('allocationBody').classList.add('hidden');
});


// Incubation pipeline tracker
const stageNotes = {
  Idea: ['Idea stage', 'Validate the problem, customer segment and business model before allocating larger resources.'],
  Validation: ['Validation stage', 'Test customer demand, pricing assumptions and evidence of problem-solution fit.'],
  MVP: ['MVP stage', 'Improve the minimum viable product and track usage, feedback and technical stability.'],
  Traction: ['Traction stage', 'Focus on repeat customers, revenue growth, retention and efficient resource use.'],
  Scale: ['Scale stage', 'Prepare market expansion, stronger operations and measurable capital deployment.']
};
document.querySelectorAll('.stage').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.stage').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    const [title, note] = stageNotes[btn.dataset.stage];
    $('pipelineNote').innerHTML = `<strong>${title}</strong><span>${note}</span>`;
  });
});

// Incubator readiness matrix
function updateMatrix() {
  const vals = ['matrixMarket','matrixProduct','matrixFinance','matrixTeam'].map(id => Number($(id).value));
  const total = vals.reduce((a,b)=>a+b,0);
  const pct = Math.round(total / 12 * 100);
  $('matrixScore').textContent = pct + '%';

  const labels = ['Market validation','Product maturity','Financial readiness','Team capability'];
  const min = Math.min(...vals);
  const weakest = labels[vals.indexOf(min)];

  let action = 'Mentorship';
  let note = `Strengthen ${weakest.toLowerCase()} before scaling resources.`;
  if (pct >= 80) {
    action = 'Scale Support';
    note = 'The profile shows broad readiness; prioritize market access and measured expansion.';
  } else if (pct < 55) {
    action = 'Foundation Support';
    note = `Focus first on ${weakest.toLowerCase()} and validate the operating assumptions.`;
  }
  $('matrixAction').textContent = action;
  $('matrixNote').textContent = note;
}
['matrixMarket','matrixProduct','matrixFinance','matrixTeam'].forEach(id => $(id).addEventListener('change', updateMatrix));

initTheme();
renderHistory();
renderChart();
updateKPIs();
updateSimulator();

// Incubation operations: startup status, data quality, action tracker and shortlist.
const STATUS_KEY = 'incubasmart_status_v1';
const ACTION_KEY = 'incubasmart_actions_v1';
const SHORTLIST_KEY = 'incubasmart_shortlist_v1';
let currentProfile = null;

function loadJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function profileId(data) { return `${data.name}|${data.industry}`.toLowerCase().replace(/[^a-z0-9|]+/g,'_'); }

function calculateDataQuality(data) {
  const checks = [
    Boolean(data.name), Boolean(data.industry), Number(data.teamSize) > 0,
    Number(data.growth) >= 0, Number(data.funding) >= 0, Number(data.revenue) >= 0, Number(data.expenses) >= 0
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}
function renderOperations(data) {
  currentProfile = {data, id:profileId(data)};
  $('trackedStartup').textContent = data.name;
  const statuses = loadJson(STATUS_KEY, {});
  $('startupStatus').value = statuses[currentProfile.id] || 'Under Review';
  const q = calculateDataQuality(data);
  $('qualityPercent').textContent = q + '% complete';
  $('qualityFill').style.width = q + '%';
  $('dataQualityBadge').textContent = 'Data quality: ' + (q >= 90 ? 'High' : q >= 70 ? 'Moderate' : 'Needs review');
  $('qualityNote').textContent = q >= 90 ? 'Profile is complete enough for the current prototype decision.' : 'Complete missing profile fields before relying on the decision output.';
  renderActions();
  renderShortlist();
}
$('saveStatusBtn').addEventListener('click', () => {
  if (!currentProfile) { alert('Analyze a startup first.'); return; }
  const statuses = loadJson(STATUS_KEY, {});
  statuses[currentProfile.id] = $('startupStatus').value;
  saveJson(STATUS_KEY, statuses);
  renderShortlist();
});

function defaultActions(data, analysis) {
  return [
    {title: analysis.nextAction, priority:'High', status:'Pending', due:'', owner:'Incubation Team'},
    {title: analysis.recommendations[0] || 'Review startup requirements', priority:'Medium', status:'Pending', due:'', owner:'Mentor'},
    {title: 'Review startup metrics again', priority:'Low', status:'Pending', due:'', owner:'Analyst'}
  ];
}
function actionsForCurrent() {
  if (!currentProfile) return [];
  const all = loadJson(ACTION_KEY, {});
  if (!all[currentProfile.id]) all[currentProfile.id] = defaultActions(currentProfile.data, currentProfile.analysis || analyze(currentProfile.data));
  saveJson(ACTION_KEY, all);
  return all[currentProfile.id];
}
function renderActions() {
  const wrap = $('actionList'), empty = $('actionEmpty');
  if (!currentProfile) { empty.classList.remove('hidden'); wrap.classList.add('hidden'); return; }
  const actions = actionsForCurrent();
  empty.classList.add('hidden'); wrap.classList.remove('hidden'); wrap.innerHTML = '';
  actions.forEach((a, idx) => {
    const card = document.createElement('div'); card.className = 'action-item' + (a.status === 'Completed' ? ' done' : '');
    card.innerHTML = `<div class="action-top"><strong>${escapeHtml(a.title)}</strong><span class="priority-badge">${escapeHtml(a.priority)}</span></div><p>Owner: ${escapeHtml(a.owner || 'Incubation Team')}</p><div class="action-meta"><select data-i="${idx}" class="action-status"><option>Pending</option><option>In Progress</option><option>Completed</option></select><input data-i="${idx}" class="action-due" type="date" value="${escapeHtml(a.due || '')}" aria-label="Due date"></div>`;
    card.querySelector('.action-status').value = a.status || 'Pending';
    wrap.appendChild(card);
  });
  wrap.querySelectorAll('.action-status,.action-due').forEach(el => el.addEventListener('change', () => {
    const all = loadJson(ACTION_KEY, {}), arr = all[currentProfile.id] || [];
    const i = Number(el.dataset.i); if (el.classList.contains('action-status')) arr[i].status = el.value; else arr[i].due = el.value;
    all[currentProfile.id] = arr; saveJson(ACTION_KEY, all); renderActions();
  }));
}
$('addActionBtn').addEventListener('click', () => {
  if (!currentProfile) { alert('Analyze a startup first.'); return; }
  const title = prompt('Enter a follow-up action:');
  if (!title || !title.trim()) return;
  const all = loadJson(ACTION_KEY, {}); const arr = all[currentProfile.id] || [];
  arr.push({title:title.trim(), priority:'Medium', status:'Pending', due:'', owner:'Incubation Team'});
  all[currentProfile.id] = arr; saveJson(ACTION_KEY, all); renderActions();
});

function renderShortlist() {
  const list = loadJson(SHORTLIST_KEY, []), tbody = $('shortlistTable');
  $('shortlistEmpty').classList.toggle('hidden', list.length > 0); $('shortlistTableWrap').classList.toggle('hidden', !list.length);
  tbody.innerHTML = '';
  list.forEach(item => {
    const tr = document.createElement('tr');
    const statuses = loadJson(STATUS_KEY, {});
    tr.innerHTML = `<td>${escapeHtml(item.data.name)}</td><td>${item.analysis.score}/10</td><td>${item.analysis.growthPotential}</td><td>${item.analysis.riskLevel}</td><td>${escapeHtml(statuses[profileId(item.data)] || 'Under Review')}</td><td><button class="shortlist-btn shortlist-remove" data-id="${escapeHtml(profileId(item.data))}">Remove</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.shortlist-remove').forEach(btn => btn.addEventListener('click', () => {
    const updated = loadJson(SHORTLIST_KEY, []).filter(x => profileId(x.data) !== btn.dataset.id);
    saveJson(SHORTLIST_KEY, updated); renderShortlist();
  }));
}
function toggleShortlist(data, analysis) {
  const list = loadJson(SHORTLIST_KEY, []), id = profileId(data);
  if (list.some(x => profileId(x.data) === id)) {
    saveJson(SHORTLIST_KEY, list.filter(x => profileId(x.data) !== id));
  } else {
    list.push({data, analysis}); saveJson(SHORTLIST_KEY, list.slice(0,20));
  }
  renderShortlist();
  updateShortlistButton(data);
}
function updateShortlistButton(data) {
  const btn = $('shortlistBtn'); if (!btn || !data) return;
  const exists = loadJson(SHORTLIST_KEY, []).some(x => profileId(x.data) === profileId(data));
  btn.textContent = exists ? '★ Shortlisted' : '☆ Shortlist'; btn.classList.toggle('active', exists);
}

// Patch result renderer with operations + shortlist control without changing the core analysis logic.
const originalRenderResult = renderResult;
renderResult = function(data, analysis) {
  originalRenderResult(data, analysis);
  const actions = $('result-actions');
  if (actions && !$('shortlistBtn')) {
    const b = document.createElement('button'); b.id='shortlistBtn'; b.className='shortlist-btn'; b.type='button'; actions.insertBefore(b, actions.firstChild);
    b.addEventListener('click', () => toggleShortlist(data, analysis));
  }
  currentProfile = {data, analysis, id:profileId(data)};
  renderOperations(data); updateShortlistButton(data);
};

// Keep profile context when loading a history item.
const originalRenderHistory = renderHistory;
renderHistory = function() { originalRenderHistory(); };

renderShortlist();


// Mentor review / decision log
const REVIEW_KEY = 'incubasmart_reviews_v1';
function renderReview(data) {
  if (!data) return;
  const id = profileId(data);
  const reviews = loadJson(REVIEW_KEY, {});
  const review = reviews[id] || {outcome:'Continue Validation', note:''};
  $('reviewStartup').textContent = data.name;
  $('reviewOutcome').value = review.outcome;
  $('mentorNote').value = review.note || '';
  $('reviewSaved').textContent = review.note ? 'Saved review available for this startup.' : '';
}
$('saveReviewBtn').addEventListener('click', () => {
  if (!currentProfile) { alert('Analyze a startup first.'); return; }
  const id = currentProfile.id;
  const reviews = loadJson(REVIEW_KEY, {});
  reviews[id] = {outcome:$('reviewOutcome').value, note:$('mentorNote').value.trim(), time:Date.now()};
  saveJson(REVIEW_KEY, reviews);
  $('reviewSaved').textContent = 'Review saved locally.';
});
const previousRenderOperations = renderOperations;
renderOperations = function(data) {
  previousRenderOperations(data);
  renderReview(data);
};

// Portfolio control center: converts stored analyses into an operational review queue.
function updatePortfolioPulse() {
  const history = loadHistory();
  const latest = new Map();
  history.forEach(entry => latest.set(profileId(entry.data), entry));
  const items = Array.from(latest.values());

  const attention = items.filter(entry => {
    const a = entry.analysis;
    return a.riskLevel === 'High' || (Number.isFinite(a.runwayMonths) && a.runwayMonths < 3) || entry.data.growth < 10 || entry.data.revenue < 50000;
  }).length;
  const shortRunway = items.filter(entry => Number.isFinite(entry.analysis.runwayMonths) && entry.analysis.runwayMonths < 3).length;
  const highPotential = items.filter(entry => entry.analysis.score >= 8).length;
  const average = items.length ? items.reduce((sum, entry) => sum + entry.analysis.score, 0) / items.length : null;

  $('pulseAttention').textContent = attention;
  $('pulseRunway').textContent = shortRunway;
  $('pulsePotential').textContent = highPotential;
  $('pulseAverage').textContent = average === null ? '—' : average.toFixed(1);

  const queue = [];
  items.forEach(entry => {
    const a = entry.analysis, d = entry.data;
    if (Number.isFinite(a.runwayMonths) && a.runwayMonths < 3) {
      queue.push({name:d.name, tag:'Cash runway', text:`Estimated runway is ${a.runwayMonths.toFixed(1)} months. Review burn, funding need and near-term expenses.`});
    } else if (a.riskLevel === 'High') {
      queue.push({name:d.name, tag:'Risk review', text:`High-risk profile detected. Recheck the weakest scoring metric before additional support.`});
    } else if (d.growth < 10) {
      queue.push({name:d.name, tag:'Growth', text:`Monthly growth is ${d.growth}%. Run a customer-growth or validation intervention.`});
    } else if (d.revenue < 50000) {
      queue.push({name:d.name, tag:'Revenue', text:`Monthly revenue is ${money(d.revenue)}. Focus on conversion and revenue validation.`});
    }
  });

  const wrap = $('pulseList');
  if (!queue.length) {
    wrap.innerHTML = `<div class="pulse-empty">No immediate flags in the current browser portfolio. Continue monitoring the analysed startups.</div>`;
    return;
  }
  wrap.innerHTML = '';
  queue.slice(0, 6).forEach(item => {
    const card = document.createElement('div');
    card.className = 'pulse-item';
    card.innerHTML = `<div class="pulse-top"><strong>${escapeHtml(item.name)}</strong><span class="pulse-tag">${escapeHtml(item.tag)}</span></div><p>${escapeHtml(item.text)}</p>`;
    wrap.appendChild(card);
  });
}

$('exportPortfolioBtn').addEventListener('click', () => {
  const history = loadHistory();
  if (!history.length) { alert('Analyze at least one startup before exporting the portfolio.'); return; }
  const rows = [['startup','industry','teamSize','funding','revenue','expenses','growth','score','growthPotential','riskLevel','resourcePriority','financialHealth','runwayMonths']];
  history.forEach(entry => {
    const d = entry.data, a = entry.analysis;
    rows.push([d.name,d.industry,d.teamSize,d.funding,d.revenue,d.expenses,d.growth,a.score,a.growthPotential,a.riskLevel,a.priority,a.financialHealth,Number.isFinite(a.runwayMonths) ? a.runwayMonths.toFixed(1) : '12+']);
  });
  const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='incubasmart_portfolio_snapshot.csv'; a.click(); URL.revokeObjectURL(url);
});

updatePortfolioPulse();
