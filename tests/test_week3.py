"""Exercise contracts: accepted solutions, rejected unfinished templates and new inputs."""
from concurrent.futures import ThreadPoolExecutor
import json
import unittest
from test_notes import ROOT, Examples, run

class WeekThreeTests(unittest.TestCase):
    def test_all_reference_solutions_and_unfinished_templates(self):
        data=json.loads((ROOT/'week3_private.json').read_text())
        tasks=[t for d in data['days'] for t in d['tasks']]
        def evaluate(t):
            return t,run(t['solution'],t['checks']),run(t['starter'],t['checks'])
        with ThreadPoolExecutor(max_workers=4) as pool:
            for t,good,empty in pool.map(evaluate,tasks):
                with self.subTest(task=t['id']):
                    self.assertIsNone(good['error'],good['error'])
                    self.assertTrue(all(c['passed'] for c in good['checks']),good['checks'])
                    self.assertFalse(not empty['error'] and all(c['passed'] for c in empty['checks']))
        print('21 Week 3 reference solutions and unfinished templates checked.')

    def test_course_index_and_note_links(self):
        catalog=json.loads((ROOT/'dist/courses.json').read_text())
        seen=set()
        for week in catalog['weeks']:
            name='curriculum.json' if week['id']==1 else f"week{week['id']}.json"
            data=json.loads((ROOT/'dist'/name).read_text())
            self.assertEqual(len(data['days']),7)
            for index,day in enumerate(data['days']):
                self.assertEqual([t['id'] for t in day['tasks']],week['days'][index]['tasks'])
                for task in day['tasks']:
                    self.assertNotIn(task['id'],seen);seen.add(task['id'])
                    self.assertNotIn('checks',task)
                    if 'noteSection' in task:
                        self.assertIn('<h3>'+task['noteSection']+'</h3>',day['notes'])
                if week['id']==3:
                    parser=Examples();parser.feed(day['notes'])
                    for _,example in parser.examples:
                        self.assertNotIn(example.strip(),[t['solution'].strip() for t in day['tasks']])
        self.assertEqual(len(seen),63)

if __name__=='__main__': unittest.main()
