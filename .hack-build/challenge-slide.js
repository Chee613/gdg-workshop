// ponytail: reuse the workshop's judging API and podium; no second ranking system.
const challenge = document.querySelector('.slide[aria-label="Challenge"]');
const rankButton = challenge.querySelector('[data-rank]');
const rankStatus = challenge.querySelector('[data-rank-status]');
const theme = challenge.querySelector('[data-challenge-theme]');
const ranking = document.querySelector('.ranking-preview');
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function workshop(path, data) {
  const response = await fetch(path, {
    cache: 'no-store', signal: AbortSignal.timeout(15000),
    ...(data === undefined ? {} : {
      method: 'POST', headers: {'Content-Type': 'application/json', 'X-Workshop-Host': '1'},
      body: JSON.stringify(data)
    })
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || 'Please try again.');
  return result;
}

async function refreshTheme() {
  if (!challenge.classList.contains('active')) return;
  try {
    const state = await workshop('/api/state');
    theme.textContent = state.theme || 'Theme';
    theme.style.fontSize = state.theme ? (state.theme.length > 100 ? '24px' : '32px') : '42px';
  } catch {
    // Theme remains readable if the workshop server is temporarily unavailable.
  }
}

rankButton.addEventListener('click', async () => {
  rankButton.disabled = true;
  rankButton.setAttribute('aria-busy', 'true');
  rankStatus.textContent = '';
  try {
    let state = await workshop('/api/host');
    if (!['ready', 'revealed', 'judging'].includes(state.phase)) {
      if (!state.aiReady) throw Error('Connect Gemini in presenter controls first.');
      if (state.count < 3) throw Error('Collect at least three ideas first.');
      await workshop('/api/rank', {});
      state = await workshop('/api/host');
    }
    const deadline = Date.now() + 150000;
    while (state.phase === 'judging') {
      rankStatus.textContent = 'Analysing every idea…';
      if (Date.now() > deadline) throw Error('Judging is taking longer. Check the dashboard, then try again.');
      await wait(1000);
      state = await workshop('/api/host');
    }
    if (state.phase === 'ready') await workshop('/api/reveal', {});
    else if (state.phase !== 'revealed') throw Error(state.error || 'Judging could not finish. Please try again.');
    rankStatus.textContent = '';
    if (challenge.classList.contains('active')) {
      ranking.querySelector('iframe').src = '/board?embed=1';
      ranking.showModal();
    }
  } catch (error) {
    rankStatus.textContent = error.message;
  } finally {
    rankButton.disabled = false;
    rankButton.removeAttribute('aria-busy');
  }
});
ranking.querySelector('button').addEventListener('click', () => ranking.close());
ranking.addEventListener('close', () => ranking.querySelector('iframe').removeAttribute('src'));
new MutationObserver(refreshTheme).observe(challenge, {attributes: true, attributeFilter: ['class']});
refreshTheme();
setInterval(refreshTheme, 2000);
