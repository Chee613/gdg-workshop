"""Run python test_judging.py. Temporary HTTP/SQLite data; Gemini transport is stubbed."""
import base64
import csv
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import threading
import time
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('judging_app', Path(__file__).with_name('server.py'))
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)
password = 'temporary-judging-test-password'
auth = 'Basic ' + base64.b64encode(('presenter:' + password).encode()).decode()

with tempfile.TemporaryDirectory(prefix='gdg-judging-') as folder:
    app.DB = Path(folder) / 'session.sqlite3'
    app.HOST_PASSWORD = password
    app.KEY = ''
    app.setup()
    server = ThreadingHTTPServer(('127.0.0.1', 0), app.Handler)
    server.daemon_threads = True
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    base = f'http://127.0.0.1:{server.server_port}'

    def request(path, data=None, host=True):
        headers = {'Content-Type': 'application/json'}
        if host:
            headers.update(Authorization=auth, **{'X-Workshop-Host': '1'})
        req = Request(base + path, headers=headers, data=None if data is None else json.dumps(data).encode())
        try:
            response = urlopen(req, timeout=5)
        except HTTPError as error:
            response = error
        with response:
            body = response.read().decode()
            return response.code, json.loads(body) if 'application/json' in response.headers.get('Content-Type', '') else body

    def host_state():
        return request('/api/host')[1]

    def csv_text(header, rows):
        stream = io.StringIO(newline='')
        writer = csv.writer(stream)
        writer.writerow(header)
        writer.writerows(rows)
        return stream.getvalue()

    try:
        bundle = dict(format='gdg-idea-backup-v1', theme='Everyday test', criteria=app.initial_state()['criteria'],
            ideas=[dict(id=i + 1, title=f'Idea {i + 1}, "useful"', idea=' '.join(['useful'] * 200)) for i in range(50)])
        # Missing imports/manual mode/CSV validation would break recovery after a provider outage.
        assert request('/api/import', bundle)[0] == 200, 'Both apps must accept recovery exports'
        assert host_state()['phase'] == 'closed'
        for path in ('/api/judging.md', '/api/judging.csv'):
            assert request(path, host=False)[0] == 401
        status, markdown = request('/api/judging.md')
        assert status == 200, 'Host must be able to export a complete ChatGPT judging prompt'
        assert 'useful ' * 199 in markdown and bundle['criteria'][0]['guidance'] in markdown
        exported = list(csv.DictReader(io.StringIO(request('/api/judging.csv')[1])))
        assert len(exported) == 50 and exported[0]['title'] == bundle['ideas'][0]['title']
        assert exported[0]['description'] == bundle['ideas'][0]['idea']
        assert json.loads(exported[0]['rubric']) == bundle['criteria']
        header = ['round', 'snapshot', 'idea_id', 'score_1', 'score_2', 'score_3', 'score_4', 'score_5', 'strength', 'improve']
        assert ','.join(header) in markdown, 'Prompt must specify an exact import header'
        rows = [[r['round'], r['snapshot'], r['idea_id'], 8, 7, 9, 8, 6, 'Useful, "specific" benefit.', 'Validate with residents.'] for r in reversed(exported)]
        original = host_state()
        changed = app.get_state()
        changed['theme'] = 'Changed after export'
        app.save_state(changed)
        assert request('/api/import-scores', dict(csv=csv_text(header, rows)))[0] == 400, 'Rubric/theme changes invalidate a previous export'
        changed['theme'] = original['theme']
        app.save_state(changed)
        invalid_files = [csv_text(header, rows[:-1]), csv_text(header, rows + [rows[0]]),
            csv_text(header + ['total'], [rows[0] + [100]]), '```csv\n' + csv_text(header, rows) + '```',
            csv_text(header, [rows[0][:3] + ['NaN'] + rows[0][4:]] + rows[1:]),
            csv_text(header, [rows[0][:3] + [11] + rows[0][4:]] + rows[1:]),
            csv_text(header, [[rows[0][0], 'old-snapshot'] + rows[0][2:]] + rows[1:]),
            csv_text(header, [[rows[0][0], rows[0][1], 9999] + rows[0][3:]] + rows[1:]),
            csv_text(header[:-1] + ['strength'], rows)]
        for text in invalid_files:
            assert request('/api/import-scores', dict(csv=text))[0] == 400
            assert host_state() == original, 'Invalid CSV must never partially replace scores or state'
        assert request('/api/import-scores', dict(csv=csv_text(header, rows)), host=False)[0] == 401
        assert request('/api/import-scores', dict(csv='\ufeff' + csv_text(header, rows)))[0] == 200
        ranked = host_state()
        assert ranked['judgingSource'] == 'imported' and ranked['phase'] == 'ready'
        assert len(ranked['results']) == 50 and all(r['total'] == 76 for r in ranked['results'])
        assert [r['id'] for r in ranked['results']] == sorted(r['id'] for r in ranked['results'])
        assert request('/api/state', host=False)[1]['results'] == []
        assert request('/api/import-scores', dict(csv=csv_text(header, rows)))[0] == 400, 'Completed results cannot be overwritten'
        assert request('/api/reveal', {})[0] == 200
        public = request('/api/state', host=False)[1]
        assert len(public['results']) == 3 and public['judgingSource'] == 'imported'
        assert all('idea' not in r for r in public['results'])
        assert request('/api/new-round', {})[0] == 200
        assert request('/api/import', bundle)[0] == 200
        assert request('/api/import-scores', dict(csv=csv_text(header, rows)))[0] == 400, 'Old-round exports must be rejected'
        ratings = [dict(id=i['id'], scores=[8,7,9,8,6], strength='Host review.', improve='Test it.') for i in host_state()['ideas']]
        assert request('/api/rank', dict(mode='manual', ratings=ratings[:-1]))[0] == 400
        assert request('/api/rank', dict(mode='manual', ratings=ratings))[0] == 200
        assert host_state()['judgingSource'] == 'manual' and host_state()['results'][0]['total'] == 76
        assert request('/api/new-round', {})[0] == 200
        assert request('/api/import', bundle)[0] == 200
        app.KEY = 'fake-key-never-sent'
        with patch.object(app, 'urlopen', side_effect=TimeoutError):
            assert request('/api/rank', dict(mode='gemini'))[0] == 202
            for _ in range(100):
                if host_state()['phase'] != 'judging': break
                time.sleep(.01)
        assert host_state()['phase'] == 'closed' and host_state()['error'], 'Gemini failure must preserve ideas for fallback'
        current = list(csv.DictReader(io.StringIO(request('/api/judging.csv')[1])))
        filled = [dict(r, **{f'score_{i}': '9' for i in range(1,6)}, strength='Useful.', improve='Pilot it.') for r in current]
        assert request('/api/import-scores', dict(csv=csv_text(list(filled[0]), [list(r.values()) for r in filled])))[0] == 200
        assert host_state()['results'][0]['total'] == 90, 'Enriched export CSV must also be fillable and importable'
        assert request('/api/new-round', {})[0] == 200
        assert request('/api/import', bundle)[0] == 200
        calls = []
        def gemini_response(req, timeout):
            calls.append(req)
            payload = json.loads(req.data)
            batch = json.loads(payload['contents'][0]['parts'][0]['text'].split('\n', 1)[1])
            assert len(batch['ideas']) == 50 and batch['criteria'][0]['guidance'] == bundle['criteria'][0]['guidance']
            answer = dict(ratings=[dict(id=i['id'], scores=[10]*5, strength='Useful.', improve='Test.') for i in batch['ideas']])
            return io.BytesIO(json.dumps(dict(candidates=[dict(content=dict(parts=[dict(text=json.dumps(answer))]))])).encode())
        with patch.object(app, 'urlopen', gemini_response):
            assert request('/api/rank', dict(mode='gemini'))[0] == 202
            for _ in range(100):
                if host_state()['phase'] != 'judging': break
                time.sleep(.01)
        assert len(calls) == 1 and host_state()['judgingSource'] == 'gemini'
        assert host_state()['results'][0]['total'] == 100 and host_state()['phase'] == 'ready'
        app.setup()
        assert len(host_state()['results']) == 50, 'Calculated rankings must survive a restart'
        assert request('/api/new-round', {})[0] == 200
        custom = dict(bundle, criteria=[dict(name='Usefulness',weight=40,guidance='Assess everyday benefits.'),dict(name='Practicality',weight=60,guidance='Assess a realistic pilot.')])
        assert request('/api/import', custom)[0] == 200
        custom_rows = list(csv.DictReader(io.StringIO(request('/api/judging.csv')[1])))
        custom_header = ['round','snapshot','idea_id','score_1','score_2','strength','improve']
        custom_scores = [[r['round'],r['snapshot'],r['idea_id'],8,5,'Useful.','Pilot.'] for r in custom_rows]
        assert request('/api/import-scores', dict(csv=csv_text(custom_header, custom_scores)))[0] == 200
        assert host_state()['results'][0]['total'] == 62, 'Custom criterion counts and weights use the saved rubric'
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=5)

print('Passed: both judging modes, provider failure fallback, private full exports, strict CSV coverage/snapshots, weighted ranking, reveal and persistence.')
