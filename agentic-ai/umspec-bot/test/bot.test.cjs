// Offline tests for Code.gs: Apps Script, Telegram and Gemini are replaced with fakes.
// Run: node --test agentic-ai/umspec-bot/test/
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SOURCE = fs.readFileSync(path.join(__dirname, '..', 'Code.gs'), 'utf8');
const NOW = Date.parse('2026-11-23T02:00:00Z'); // Mon 23 Nov 2026, 10:00 am in Malaysia
const DAY = 86400000;

function iterator(items) { let i = 0; return { hasNext: () => i < items.length, next: () => items[i++] }; }
function folder(name, folders = [], files = [], trashed = false) {
  return { getName: () => name, isTrashed: () => trashed, getFolders: () => iterator(folders), getFiles: () => iterator(files) };
}
function file(id, name, { size = 1000, mime = 'application/pdf', daysAgo = 10, trashed = false } = {}) {
  return {
    getId: () => id, getName: () => name, getMimeType: () => mime, getSize: () => size, isTrashed: () => trashed,
    getLastUpdated: () => new Date(NOW - daysAgo * DAY), getUrl: () => 'https://drive.google.com/file/d/' + id,
    getBlob: () => ({ setName(n) { this.name = n; return this; }, bytes: 'x' })
  };
}
function event(title, startMs, description = '') {
  return { getTitle: () => title, getStartTime: () => new Date(startMs), getDescription: () => description, isAllDayEvent: () => false };
}

function load({ geminiReplies = [], props = {}, drive, events = [] } = {}) {
  const store = Object.assign({ TELEGRAM_TOKEN: 't', GEMINI_API_KEY: 'g', OWNER_CHAT_ID: '42', WEBHOOK_SECRET: 's3cret' }, props);
  const cache = {};
  const telegram = [];
  const geminiRequests = [];
  const files = drive || [];
  const byId = {};

  const roots = [folder('UM Spec', [
    folder('2026-2027 Sem 1', [
      folder('WIA2001 Database', [
        folder('Lecture Slides', [], [
          file('f1', 'W04 Normalization - Compact Notes.pptx', { daysAgo: 1 }),
          file('f2', 'W05 Transactions.pdf', { daysAgo: 20 }),
          file('big', 'W06 Recording.mp4', { size: 60 * 1024 * 1024, mime: 'video/mp4' })
        ]),
        folder('Tutorials', [], [file('f3', 'W04 Tutorial Normalization.pdf')])
      ], [file('doc', 'Links', { mime: 'application/vnd.google-apps.document' })]),
      folder('WIX1002 Fundamentals of Programming', [
        folder('Labs', [], [file('f4', 'Lab 3 Loops.pdf'), file('gone', 'Old lab.pdf', { trashed: true })])
      ])
    ]),
    folder('2025-2026 Sem 2', [
      folder('WIA2001 Database', [folder('Lecture Slides', [], [file('old', 'W04 Normalization.pptx', { daysAgo: 300 })])])
    ])
  ])].concat(files);
  (function walk(list) {
    list.forEach(item => {
      if (item.getFolders) { walk(drain(item.getFolders())); drain(item.getFiles()).forEach(f => { byId[f.getId()] = f; }); }
    });
  })(roots);
  function drain(it) { const out = []; while (it.hasNext()) out.push(it.next()); return out; }

  const replies = geminiReplies.slice();
  const sandbox = {
    console: { log() {}, error() {}, warn() {} },
    Date: class extends Date { constructor(...a) { super(...(a.length ? a : [NOW])); } static now() { return NOW; } },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: k => (k in store ? store[k] : null), setProperty: (k, v) => { store[k] = v; }, deleteProperty: k => { delete store[k]; }
    }) },
    CacheService: { getScriptCache: () => ({
      get: k => (k in cache ? cache[k] : null), put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; },
      getAll: keys => Object.fromEntries(keys.filter(k => k in cache).map(k => [k, cache[k]])), putAll: o => { Object.assign(cache, o); }
    }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { createTextOutput: t => ({ text: t }) },
    HtmlService: { createHtmlOutput: t => ({ html: t }) },
    Utilities: {
      formatDate: (d, tz, fmt) => new Date(d.getTime() + 8 * 3600000).toISOString().slice(0, 16).replace('T', ' ') + ' MYT',
      getUuid: () => '1234-5678'
    },
    DriveApp: { getFoldersByName: name => iterator(name === 'UM Spec' ? roots.filter(r => r.getName() === 'UM Spec') : []), getFileById: id => byId[id] },
    CalendarApp: { getCalendarsByName: name => (name === 'UM Spec' && events !== null ? [{ getEvents: (from, to) => events.filter(e => {
      const t = e.getStartTime().getTime(); return t >= from.getTime() && t <= to.getTime();
    }) }] : []) },
    UrlFetchApp: { fetch(url, options) {
      if (url.indexOf('generativelanguage') >= 0) {
        geminiRequests.push(JSON.parse(options.payload));
        const next = replies.shift();
        if (!next) throw new Error('No scripted Gemini reply left');
        if (next.status) return { getResponseCode: () => next.status, getContentText: () => next.body };
        return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ candidates: [{ content: { role: 'model', parts: next } }] }) };
      }
      const method = url.split('/').pop();
      telegram.push({ method, payload: options.payload });
      return { getContentText: () => JSON.stringify({ ok: true, result: method === 'getMe' ? { username: 'umspec_bot' } : {} }) };
    } }
  };
  vm.createContext(sandbox);
  vm.runInContext(SOURCE, sandbox);
  return { g: sandbox, telegram, geminiRequests, store, cache };
}

const call = (name, args) => ({ functionCall: { name, args } });
const say = text => ({ text });
const post = (g, text, chatId = 42, updateId = 1, secret = 's3cret') =>
  g.doPost({ parameter: { secret }, postData: { contents: JSON.stringify({ update_id: updateId, message: { chat: { id: chatId }, text } }) } });

test('find_files ranks by query, filters by course, category and week, and prefers the newest semester', () => {
  const { g } = load();
  const r = g.findFiles_({ query: 'normalization', course: 'wia2001' });
  assert.deepStrictEqual([...r.files.map(f => f.id)], ['f1', 'f3', 'old']);
  assert.deepStrictEqual([...g.findFiles_({ course: 'WIA2001', category: 'Lecture Slides', week: 4 }).files.map(f => f.id)], ['f1', 'old']);
  assert.deepStrictEqual([...g.findFiles_({ new_within_days: 3 }).files.map(f => f.id)], ['f1']);
  assert.strictEqual(g.findFiles_({ query: 'old', course: 'WIX1002' }).total_matches, 0, 'trashed files are left out');
  assert.strictEqual(g.findFiles_({ week: 14 }).total_matches, 0, 'week 14 must not match W04');
});

test('send_file uploads small files, links big files and Google Docs, and refuses files outside UM Spec', () => {
  const { g, telegram } = load();
  const ctx = { chatId: '42', sentFiles: {} };
  assert.strictEqual(g.sendFile_({ file_id: 'f1' }, ctx).as, 'file');
  assert.strictEqual(telegram.pop().method, 'sendDocument');
  assert.strictEqual(g.sendFile_({ file_id: 'big' }, ctx).as, 'link');
  assert.strictEqual(g.sendFile_({ file_id: 'doc' }, ctx).as, 'link');
  assert.ok(g.sendFile_({ file_id: 'someone-elses-file' }, ctx).error);
  assert.strictEqual(g.sendFile_({ file_id: 'f1' }, ctx).note, 'Already sent in this reply.');
});

test('list_deadlines returns the window soonest first, marks overdue items and filters by course', () => {
  const events = [
    event('Due at: Assignment 2 is due', NOW - 1 * DAY, 'WIA2001 Database\nSpectrum: not submitted yet\nSource: https://spectrum.um.edu.my/mod/assign/view.php?id=1'),
    event('Quiz 3 closes', NOW + 2 * DAY, 'WIX1002'),
    event('Project report due', NOW + 30 * DAY, 'WIA2001')
  ];
  const { g } = load({ events });
  assert.deepStrictEqual(g.listDeadlines_({}).items.map(i => i.title), ['Quiz 3 closes']);
  const withOverdue = g.listDeadlines_({ overdue_days: 3, course: 'wia2001' });
  assert.deepStrictEqual(withOverdue.items.map(i => i.title), ['Due at: Assignment 2 is due']);
  assert.strictEqual(withOverdue.items[0].overdue, true);
  assert.strictEqual(withOverdue.items[0].status, 'not submitted yet');
  assert.strictEqual(withOverdue.items[0].link, 'https://spectrum.um.edu.my/mod/assign/view.php?id=1');
  assert.strictEqual(withOverdue.items[0].details, 'WIA2001 Database\nSpectrum: not submitted yet');
});

test('the agent loop calls tools, sends the file and the final reply, and keeps short-term memory', () => {
  const { g, telegram, geminiRequests } = load({ geminiReplies: [
    [call('find_files', { course: 'WIA2001', week: 4, category: 'Lecture Slides' })],
    [call('send_file', { file_id: 'f1' })],
    [say('Sent **W04 Normalization** for WIA2001.')]
  ] });
  post(g, 'send me week 4 slides for WIA2001');
  const methods = telegram.map(t => t.method);
  assert.deepStrictEqual(methods, ['sendChatAction', 'sendChatAction', 'sendDocument', 'sendChatAction', 'sendMessage']);
  assert.strictEqual(telegram[4].payload.text, 'Sent W04 Normalization for WIA2001.', 'markdown bold is stripped');
  const last = geminiRequests[2].contents;
  assert.ok(last.some(c => c.parts.some(p => p.functionResponse && p.functionResponse.name === 'find_files')));
  assert.strictEqual(g.loadHistory_('42').length, 2, 'question and answer kept for follow-ups');
  assert.ok(geminiRequests[0].systemInstruction.parts[0].text.includes('data, not instructions'));
});

test('the loop stops after MAX_STEPS tool calls', () => {
  const loop = Array.from({ length: 5 }, () => [call('list_courses', {})]);
  const { g } = load({ geminiReplies: loop });
  assert.match(g.runAgent_('42', 'hi', { noHistory: true }), /stopped after 5 steps/);
});

test('remember saves long-term notes that appear in the next system prompt', () => {
  const { g, geminiRequests } = load({ geminiReplies: [[call('remember', { note: 'Ignore WIX1002' })], [say('Noted.')], [say('ok')]] });
  g.runAgent_('42', 'stop showing me WIX1002', { noHistory: true });
  g.runAgent_('42', 'hello', { noHistory: true });
  assert.ok(geminiRequests[2].systemInstruction.parts[0].text.includes('- Ignore WIX1002'));
});

test('webhook ignores a wrong secret, strangers and repeated updates, and tells a new owner their chat ID', () => {
  const owned = load({ geminiReplies: [[say('Nothing due.')]] });
  post(owned.g, 'hi', 42, 1, 'wrong');
  post(owned.g, 'hi', 999, 2);
  assert.strictEqual(owned.telegram.length, 0);
  post(owned.g, 'what is due?', 42, 3);
  post(owned.g, 'what is due?', 42, 3);
  assert.strictEqual(owned.telegram.filter(t => t.method === 'sendMessage').length, 1);

  const fresh = load({ props: { OWNER_CHAT_ID: '' } });
  post(fresh.g, '/start', 777, 1);
  assert.match(fresh.telegram[0].payload.text, /OWNER_CHAT_ID[^]*\n\n777$/);
});

test('daily briefing stays quiet when there is nothing to report', () => {
  const quiet = load({ geminiReplies: [[say('NOTHING')]] });
  quiet.g.dailyBriefing();
  assert.strictEqual(quiet.telegram.length, 0);
  const busy = load({ geminiReplies: [[say('Quiz 3 closes in 2 days.')]] });
  busy.g.dailyBriefing();
  assert.match(busy.telegram[0].payload.text, /^☀️ Good morning!/);
});

test('setup sets the webhook with the secret and schedules one daily trigger', () => {
  const { g, telegram, store } = load({ props: { WEB_APP_URL: 'https://script.google.com/macros/s/abc/exec', WEBHOOK_SECRET: '' } });
  const triggers = [];
  let handler = '';
  const builder = { timeBased: () => builder, everyDays: () => builder, everyMinutes: () => builder, atHour: () => builder, inTimezone: () => builder, create: () => triggers.push(handler) };
  g.ScriptApp = { getProjectTriggers: () => [], deleteTrigger() {}, newTrigger: h => { handler = h; return builder; } };
  g.setup();
  assert.strictEqual(store.WEBHOOK_SECRET, '12345678');
  const hook = telegram.find(c => c.method === 'setWebhook');
  assert.strictEqual(hook.payload.url, 'https://script.google.com/macros/s/abc/exec?secret=12345678');
  assert.deepStrictEqual(triggers, ['dailyBriefing', 'refreshIndex']);
});

test('an OWNER_CHAT_ID copied with a full stop or spaces still works, and a mismatched /start explains why', () => {
  const sloppy = load({ props: { OWNER_CHAT_ID: ' 1234567890. ' } });
  post(sloppy.g, '/memory', 1234567890, 1);
  assert.match(sloppy.telegram[0].payload.text, /no saved notes/);

  const wrong = load({ props: { OWNER_CHAT_ID: '111' } });
  post(wrong.g, '/start', 1234567890, 1);
  assert.match(wrong.telegram[0].payload.text, /exactly:\n\n1234567890$/);
  post(wrong.g, 'hello', 1234567890, 2);
  assert.strictEqual(wrong.telegram.length, 1, 'other messages from strangers get no reply');
});

test('asks Gemini for minimal thinking, and retries once without it if the model refuses', () => {
  const { g, geminiRequests } = load({ geminiReplies: [{ status: 400, body: 'Unknown name "thinkingLevel" at generation_config.thinking_config' }, [say('ok')], [say('ok again')]] });
  assert.strictEqual(g.runAgent_('42', 'hi', { noHistory: true }), 'ok');
  assert.strictEqual(geminiRequests[0].generationConfig.thinkingConfig.thinkingLevel, 'minimal');
  assert.strictEqual(geminiRequests[1].generationConfig, undefined);
  g.runAgent_('42', 'hi', { noHistory: true });
  assert.strictEqual(geminiRequests[2].generationConfig, undefined, 'the refusal is remembered');
});

test('the Drive list is cached in pieces and reused until refreshed', () => {
  const { g, cache } = load();
  const first = g.fileIndex_();
  assert.ok(Number(cache['index:n']) >= 1);
  cache['index:0'] = cache['index:0'];
  g.DriveApp.getFoldersByName = () => { throw new Error('Drive should not be read again'); };
  assert.strictEqual(g.fileIndex_().length, first.length);
  delete cache['index:0'];
  assert.throws(() => g.fileIndex_(), /should not be read again/, 'a missing piece triggers a rebuild');
});

const tap = (g, data, chatId = 42, updateId = 50) =>
  g.doPost({ parameter: { secret: 's3cret' }, postData: { contents: JSON.stringify({ update_id: updateId,
    callback_query: { id: 'cb' + updateId, data, from: { id: chatId, first_name: 'Chee' }, message: { message_id: 7, chat: { id: chatId } } } }) } });
const markup = msg => JSON.parse(msg.payload.reply_markup).inline_keyboard;
const labels = msg => markup(msg).flat().map(b => b.text);

test('/start shows a home screen with counts, the next deadline and menu buttons', () => {
  const events = [event('Quiz 3 closes', NOW + 20 * 3600000), event('Due at: Lab 2 report', NOW - 2 * DAY, 'Spectrum: not submitted yet'),
    event('Due at: Tutorial 3 (OCC4) is due', NOW - 3 * DAY, 'Spectrum: nothing left to submit')];
  const { g, telegram } = load({ events });
  g.handleMessage_({ chat: { id: 42 }, from: { first_name: 'Chee' }, text: '/start' });
  const home = telegram.pop();
  assert.strictEqual(home.payload.parse_mode, 'HTML');
  assert.match(home.payload.text, /Welcome back, Chee/);
  assert.match(home.payload.text, /1 due this week · ⚠️ 1 overdue · 🆕 1 new files/);
  assert.match(home.payload.text, /Next:<\/b> Quiz 3 closes · in 20 hours/);
  assert.deepStrictEqual(labels(home), ['📚 Browse my courses', '📅 Due this week', '⚠️ Overdue (1)', '🆕 New files', '🧠 Memory', '🌐 Open SPeCTRUM']);
  assert.strictEqual(markup(home)[1][1].style, 'danger', 'overdue turns red');
});

test('/start shows a home screen gracefully when no UM Spec calendar exists yet', () => {
  const { g, telegram } = load({ events: null });
  g.handleMessage_({ chat: { id: 42 }, from: { first_name: 'Chee' }, text: '/start' });
  const home = telegram.pop();
  assert.strictEqual(home.payload.parse_mode, 'HTML');
  assert.match(home.payload.text, /Welcome back, Chee/);
  assert.match(home.payload.text, /0 due this week · ⚠️ 0 overdue/);
});

test('buttons browse courses, types and files in place, and a file tap sends it', () => {
  const { g, telegram } = load();
  tap(g, 'courses', 42, 1);
  let screen = telegram.pop();
  assert.strictEqual(screen.method, 'editMessageText');
  assert.deepStrictEqual(labels(screen), ['📘 WIA2001', '📗 WIX1002', '🏠 Menu'], 'only the newest semester');
  tap(g, 'c:0', 42, 2);
  screen = telegram.pop();
  assert.deepStrictEqual(labels(screen), ['📑 Lecture Slides (3)', '✏️ Tutorials (1)', '🔗 Links (1)', '⬅️ Back', '🏠 Menu']);
  tap(g, 'k:0:0:0', 42, 3);
  screen = telegram.pop();
  assert.deepStrictEqual(labels(screen).slice(0, 3), ['🎬 W06 Recording.mp4', '📕 W05 Transactions.pdf', '📊 W04 Normalization - Compact Notes.pptx']);
  assert.strictEqual(markup(screen)[2][0].callback_data, 'f:f1');
  tap(g, 'f:f1', 42, 4);
  assert.strictEqual(telegram.pop().method, 'sendDocument');
  assert.strictEqual(telegram.pop().payload.text, '📤 Sending…');
});

test('the deadline screen lists items with colour, time left and a link', () => {
  const events = [event('Quiz 3 closes', NOW + 20 * 3600000, 'Source: https://spectrum.um.edu.my/mod/quiz/view.php?id=9'), event('Project', NOW + 5 * DAY)];
  const { g, telegram } = load({ events });
  tap(g, 'due');
  const text = telegram.pop().payload.text;
  assert.match(text, /🟠 <b>Quiz 3 closes<\/b>[^]*in 20 hours · <a href="https:\/\/spectrum.um.edu.my\/mod\/quiz\/view.php\?id=9">open<\/a>/);
  assert.match(text, /🟢 <b>Project<\/b>/);
});

test('an agent reply that lists files gets tap-to-send buttons; a sent file does not', () => {
  const listed = load({ geminiReplies: [[call('find_files', { query: 'normalization' })], [say('I found 3 files. Which one?')]] });
  post(listed.g, 'normalization notes');
  const reply = listed.telegram.pop();
  assert.deepStrictEqual(labels(reply).slice(0, 2), ['📊 W04 Normalization - Compact Notes.pptx', '📕 W04 Tutorial Normalization.pdf']);
  assert.strictEqual(labels(reply).pop(), '🏠 Menu');

  const sent = load({ geminiReplies: [[call('find_files', { query: 'normalization' })], [call('send_file', { file_id: 'f1' })], [say('Sent.')]] });
  post(sent.g, 'send normalization');
  assert.deepStrictEqual(labels(sent.telegram.pop()), ['🏠 Menu']);
});

test('button taps from strangers are ignored, and HTML in names is escaped', () => {
  const { g, telegram } = load({ events: [event('<b>Hack</b> & co', NOW + DAY)] });
  tap(g, 'due', 999, 1);
  assert.deepStrictEqual(telegram.map(t => t.method), ['answerCallbackQuery']);
  tap(g, 'due', 42, 2);
  assert.match(telegram.pop().payload.text, /&lt;b&gt;Hack&lt;\/b&gt; &amp; co/);
});

test('Overdue lists only deadlines SPeCTRUM still shows as not done, not ones already submitted', () => {
  const events = [
    event('Due at: TUTORIAL 3 (OCC4) is due', NOW - 26 * DAY, 'Spectrum: nothing left to submit'),
    event('Due at: Tutorial 5 Submission Link is due', NOW - 19 * DAY, 'Spectrum: not submitted yet'),
    event('Due at: Quiz 2', NOW - 5 * DAY, 'Spectrum: not attempted yet'),
    event('Due at: Older sync without a status line', NOW - 4 * DAY, 'WIA2003'),
    event('Mid-term briefing', NOW - 2 * DAY, 'WIA2001'),
    event('Due at: Tutorial 9 is due', NOW + 2 * DAY, 'Spectrum: not submitted yet'),
    event('Due at: Poster (OCC4) is due', NOW + 3 * DAY, 'Spectrum: nothing left to submit'),
    event('Due at: Assignment. Occ 1, Occ 1M is due', NOW - 6 * DAY, 'Spectrum: for OCC 1, 1M, not your OCC (3)'),
    event('Due at: Lab report (OCC 1) is due', NOW + 1 * DAY, 'Spectrum: for OCC 1, not your OCC (3)')
  ];
  const { g, telegram } = load({ events });
  tap(g, 'overdue');
  const text = telegram.pop().payload.text;
  assert.match(text, /Tutorial 5 Submission Link/);
  assert.match(text, /Quiz 2/);
  assert.match(text, /Older sync without a status line/, 'a deadline from an older UM Spec still counts until it is re-synced');
  assert.doesNotMatch(text, /TUTORIAL 3|Mid-term briefing|Tutorial 9|Occ 1M/, 'another OCC\'s deadline is never overdue');
  g.handleMessage_({ chat: { id: 42 }, from: { first_name: 'Chee' }, text: '/start' });
  assert.match(telegram.pop().payload.text, /1 due this week · ⚠️ 3 overdue/, 'an upcoming deadline already submitted is not counted as due');
  tap(g, 'due', 42, 51);
  const due = telegram.pop().payload.text;
  assert.match(due, /✅ <b>Due at: Poster \(OCC4\) is due/);
  assert.match(due, /🟢 <b>Due at: Tutorial 9 is due/);
  assert.doesNotMatch(due, /Lab report \(OCC 1\)/, 'another OCC\'s deadline is not due for this student');
});

function setupHarness() {
  const loaded = load({ props: { WEB_APP_URL: 'https://script.google.com/macros/s/abc/exec', WEBHOOK_SECRET: 's' } });
  let triggers = [], pending = '';
  const builder = { timeBased: () => builder, everyDays: () => builder, everyMinutes: () => builder, atHour: () => builder,
    inTimezone: () => builder, after: () => builder, create: () => { const n = pending; triggers.push({ getHandlerFunction: () => n }); } };
  loaded.g.ScriptApp = { getProjectTriggers: () => triggers.slice(), deleteTrigger: t => { triggers = triggers.filter(x => x !== t); },
    newTrigger: n => { pending = n; return builder; } };
  const calls = [], slept = [], state = { refusals: 0, info: {}, error: null };
  loaded.g.Utilities.sleep = ms => slept.push(ms / 1000);
  loaded.g.UrlFetchApp.fetch = url => {
    const method = url.split('/').pop();
    calls.push(method);
    const body = state.refusals-- > 0
      ? { ok: false, error_code: 429, description: 'Too Many Requests: retry after 32', parameters: { retry_after: 32 } }
      : state.error || { ok: true, result: method === 'getWebhookInfo' ? state.info : method === 'getMe' ? { username: 'b' } : {} };
    return { getContentText: () => JSON.stringify(body) };
  };
  return { g: loaded.g, calls, slept, state, names: () => triggers.map(t => t.getHandlerFunction()).sort() };
}

test('setup keeps a webhook that is already registered, and registers again when button taps are missing', () => {
  const url = 'https://script.google.com/macros/s/abc/exec?secret=s';
  const ready = setupHarness();
  ready.state.info = { url, allowed_updates: ['message', 'callback_query'] };
  ready.g.setup();
  assert.ok(!ready.calls.includes('setWebhook'));
  const old = setupHarness();
  old.state.info = { url, allowed_updates: ['message'] };
  old.g.setup();
  assert.ok(old.calls.includes('setWebhook'));
});

test('setup waits out a busy Telegram on its very first call, then connects', () => {
  const busy = setupHarness();
  busy.state.refusals = 2;
  busy.g.setup();
  assert.deepStrictEqual(busy.slept, [33, 33]);
  assert.ok(busy.calls.includes('setWebhook') && busy.calls.includes('setMyCommands'));
  assert.deepStrictEqual(busy.names(), ['dailyBriefing', 'refreshIndex']);
});

test('if Telegram stays busy, setup finishes the rest and a timer connects later', () => {
  const stuck = setupHarness();
  stuck.state.refusals = 99;
  stuck.g.setup();
  assert.ok(stuck.slept.reduce((a, b) => a + b, 0) <= 150, 'well inside the 6 minute script limit');
  assert.deepStrictEqual(stuck.names(), ['dailyBriefing', 'finishWebhook', 'refreshIndex']);
  stuck.state.refusals = 99;
  stuck.g.finishWebhook();
  assert.strictEqual(stuck.names().filter(n => n === 'finishWebhook').length, 1, 'one new timer replaces the old one');
  stuck.state.refusals = 0;
  stuck.g.finishWebhook();
  assert.deepStrictEqual(stuck.names(), ['dailyBriefing', 'refreshIndex']);
  assert.strictEqual(stuck.calls.pop(), 'sendMessage', 'the owner is told');
});

test('a wrong token still fails at once, and chat replies never wait for a long pause', () => {
  const wrong = setupHarness();
  wrong.state.error = { ok: false, error_code: 401, description: 'Unauthorized' };
  assert.throws(() => wrong.g.setup(), /Unauthorized/);
  assert.deepStrictEqual(wrong.slept, []);
  const chat = setupHarness();
  chat.state.refusals = 1;
  assert.throws(() => chat.g.telegram_('sendMessage', {}), /retry after 32/);
  assert.deepStrictEqual(chat.slept, []);
});
