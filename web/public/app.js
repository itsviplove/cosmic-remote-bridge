async function load() {
  const res = await fetch('/api/capabilities', { cache: 'no-store' });
  const data = await res.json();

  const facts = document.getElementById('facts');
  const recommendation = document.getElementById('recommendation');
  const notes = document.getElementById('notes');

  const entries = [
    ['Updated', data.updatedAt || 'unknown'],
    ['Machine', data.machine || 'unknown'],
    ['Viewer mode', data.viewerMode || 'unknown'],
    ['Control mode', data.controlMode || 'unknown']
  ];

  facts.innerHTML = entries.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  recommendation.textContent = data.recommendation || 'No recommendation yet.';
  notes.innerHTML = (data.notes || []).map((item) => `<li>${item}</li>`).join('');
}

load().catch((err) => {
  document.getElementById('recommendation').textContent = 'Failed to load capability data: ' + err.message;
});
