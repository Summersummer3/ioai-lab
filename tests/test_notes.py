"""Run every note example in a fresh runner, just like the UI's Run button."""
from html.parser import HTMLParser
from pathlib import Path
import json
import os
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class Examples(HTMLParser):
    def __init__(self):
        super().__init__()
        self.examples = []
        self.active = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'pre' and 'note-code' in attrs.get('class', '').split():
            self.active = True
            self.examples.append([attrs.get('data-setup', ''), ''])

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.active = False

    def handle_data(self, text):
        if self.active:
            self.examples[-1][1] += text


def run(code, checks=None):
    with tempfile.TemporaryDirectory() as folder:
        env = dict(os.environ, MPLCONFIGDIR=str(ROOT / '.data' / 'matplotlib'),
                   OPENBLAS_NUM_THREADS='1', OMP_NUM_THREADS='1')
        result = subprocess.run(
            [sys.executable, str(ROOT / 'runner.py')], cwd=folder, env=env,
            input=json.dumps({'code': code, 'checks': checks or []}),
            capture_output=True, text=True, encoding='utf-8', timeout=35,
        )
        if result.returncode:
            raise AssertionError(result.stderr)
        return json.loads(result.stdout)


class LessonRegressionTests(unittest.TestCase):
    def test_each_note_runs_without_an_earlier_session(self):
        count = 0
        for filename in ('curriculum.json', 'week2.json', 'week3.json'):
            curriculum = json.loads((ROOT / 'dist' / filename).read_text(encoding='utf-8'))
            for day, lesson in enumerate(curriculum['days'], 1):
                parser = Examples()
                parser.feed(lesson['notes'])
                for index, (setup, code) in enumerate(parser.examples, 1):
                    with self.subTest(week=filename, day=day, example=index):
                        result = run(setup + '\n\n' + code if setup else code)
                        self.assertIsNone(result['error'], result['error'])
                    count += 1
        print(f'Checked {count} independently runnable note examples.')

    def test_error_location_and_source_are_preserved(self):
        for code, kind, line in (
            ('x = 1\nprint(missing)', 'NameError', 2),
            ('if True\n    pass', 'SyntaxError', 1),
            ('def fail():\n    return 1 / 0\nfail()', 'ZeroDivisionError', 2),
        ):
            with self.subTest(kind=kind):
                result = run(code)
                self.assertEqual(result['error_info']['type'], kind)
                self.assertEqual(result['error_info']['line'], line)
                self.assertIn(code.splitlines()[line - 1].strip(), result['error_info']['trace'])
                self.assertEqual(result['checks'], [])


if __name__ == '__main__':
    unittest.main()
