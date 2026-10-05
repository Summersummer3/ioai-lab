"""Validate progress writes against a disposable file, without starting a server."""
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import server

class StateTests(unittest.TestCase):
    def test_third_week_and_stale_page_protection(self):
        with tempfile.TemporaryDirectory(prefix='ioai-state-test-') as folder:
            temporary_state=Path(folder)/'progress.json'
            handler=object.__new__(server.Handler)
            handler.path='/api/state'
            handler.allowed=lambda: True
            responses=[]
            handler.json_response=lambda payload,status=200: responses.append((status,payload))
            data={'schemaVersion':3,'week':3,'day':4,'task':2,'positions':{'1':{'day':6,'task':2},'2':{'day':6,'task':2},'3':{'day':4,'task':2}},'codes':{'d1_1':'old week1','w2d7_3':'old week2','w3d5_3':'third week'},'passed':{'w2d7_3':{'at':'before'},'w3d5_3':{'at':'now'}},'hints':{},'seen':{}}
            def post(body):
                raw=json.dumps(body).encode()
                handler.headers={'Content-Length':str(len(raw)),'X-Lab-Token':server.TOKEN}
                handler.rfile=io.BytesIO(raw)
                handler.do_POST()
            with patch.object(server,'STATE',temporary_state):
                post(data)
                self.assertEqual(responses[-1],(200,{'saved':True}))
                saved=json.loads(temporary_state.read_text())
                self.assertEqual(saved['codes'],data['codes'])
                self.assertEqual(saved['positions'],data['positions'])
                self.assertEqual(saved['week'],3)
                post(dict(data,schemaVersion=2))
                self.assertEqual(responses[-1][0],409)
                self.assertEqual(json.loads(temporary_state.read_text()),saved)
            self.assertEqual(len(server.TASKS),63)

if __name__=='__main__':unittest.main()
