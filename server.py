"""Loopback-only IOAI practice server. Run only code you trust on this computer."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import json
import os
import secrets
import signal
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser

ROOT=Path(__file__).resolve().parent
PORT=int(os.environ.get('IOAI_PORT','8765'))
TOKEN=secrets.token_urlsafe(32)
STATE=ROOT/'.data'/'progress.json'
STATE.parent.mkdir(exist_ok=True)
def load_tasks():
    tasks={}
    for filename in ('curriculum_private.json','week2_private.json'):
        path=ROOT/filename
        if path.exists():
            curriculum=json.loads(path.read_text(encoding='utf-8'))
            tasks.update({t['id']:t for d in curriculum['days'] for t in d['tasks']})
    return tasks
TASKS=load_tasks()
STATE_LOCK=threading.Lock()
RUN_LOCK=threading.Lock()
CURRENT=None

def kill_process(proc):
    if proc and proc.poll() is None:
        if os.name == 'nt':
            try:
                subprocess.run(['taskkill','/PID',str(proc.pid),'/T','/F'],capture_output=True,timeout=5)
            except (OSError,subprocess.TimeoutExpired):
                pass
            if proc.poll() is None:
                proc.kill()
        else:
            try:os.killpg(proc.pid,signal.SIGKILL)
            except ProcessLookupError:pass

def run_code(code,task_id):
    global CURRENT
    if not RUN_LOCK.acquire(blocking=False):
        return {'error':'已有练习正在运行，请稍后再试。','checks':[]}
    try:
        with tempfile.TemporaryDirectory(prefix='ioai-practice-') as folder:
            env={k:v for k,v in os.environ.items() if k.upper() in {'PATH','HOME','LANG','LC_ALL','SYSTEMROOT','WINDIR','TMPDIR','TEMP','TMP','USERPROFILE','APPDATA','LOCALAPPDATA','VIRTUAL_ENV'}}
            env.update(OPENBLAS_NUM_THREADS='1',OMP_NUM_THREADS='1',MPLBACKEND='Agg',PYTHONIOENCODING='utf-8',MPLCONFIGDIR=str(ROOT/'.data'/'matplotlib'))
            proc=subprocess.Popen([sys.executable,str(ROOT/'runner.py')],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf-8',errors='replace',cwd=folder,env=env,**({'creationflags':subprocess.CREATE_NEW_PROCESS_GROUP} if os.name=='nt' else {'start_new_session':True}))
            CURRENT=proc
            try:
                stdout,stderr=proc.communicate(json.dumps({'code':code,'checks':TASKS[task_id]['checks'] if task_id else []}),timeout=30)
            except subprocess.TimeoutExpired:
                kill_process(proc)
                proc.communicate()
                return {'error':'运行超过 30 秒，已停止。请检查无限循环，或减少本次计算的数据量。','checks':[]}
            if proc.returncode!=0:
                return {'error':'运行已停止。'+(stderr[-4000:] if stderr else '请检查循环、内存或代码中的退出操作。'),'checks':[]}
            try:return json.loads(stdout)
            except json.JSONDecodeError:return {'error':'未能读取运行结果。请避免直接修改进程的标准输出。','checks':[]}
    finally:
        CURRENT=None
        RUN_LOCK.release()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT/'dist'),**kwargs)
    def log_message(self,format,*args):
        if args and str(args[1] if len(args)>1 else '').startswith('5'):super().log_message(format,*args)
    def allowed(self):
        if self.headers.get('Host') not in {f'127.0.0.1:{PORT}',f'localhost:{PORT}'}:return False
        origin=self.headers.get('Origin')
        if origin and origin not in {f'http://127.0.0.1:{PORT}',f'http://localhost:{PORT}'}:return False
        if self.headers.get('Sec-Fetch-Site')=='cross-site':return False
        return True
    def json_response(self,payload,status=200):
        data=json.dumps(payload,ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length',str(len(data)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.end_headers()
        try:self.wfile.write(data)
        except (BrokenPipeError,ConnectionResetError):pass
    def end_headers(self):
        self.send_header('X-Frame-Options','DENY')
        self.send_header('Referrer-Policy','same-origin')
        super().end_headers()
    def do_GET(self):
        if not self.allowed():return self.json_response({'error':'仅允许从本地练习页访问。'},403)
        path=urlparse(self.path).path
        if path=='/api/config':return self.json_response({'token':TOKEN,'name':'ioai-week1','version':2})
        if path=='/api/state':
            with STATE_LOCK:
                try:data=json.loads(STATE.read_text(encoding='utf-8'))
                except (FileNotFoundError,json.JSONDecodeError):data={}
            return self.json_response(data)
        if path not in {'/','/index.html','/practice.html','/home.css','/home.js','/style.css','/app.js','/curriculum.json','/week2.json','/courses.json'}:return self.json_response({'error':'找不到页面'},404)
        return super().do_GET()
    def do_POST(self):
        global TASKS
        TASKS=load_tasks()
        if not self.allowed() or self.headers.get('X-Lab-Token')!=TOKEN:return self.json_response({'error':'无效的本地请求。请刷新网页。'},403)
        path=urlparse(self.path).path
        if path=='/api/stop':
            kill_process(CURRENT)
            return self.json_response({'stopped':True})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length<=0 or length>2_000_000:raise ValueError('请求长度无效')
            body=json.loads(self.rfile.read(length))
            if not isinstance(body,dict):raise ValueError('请求格式无效')
        except (ValueError,json.JSONDecodeError):return self.json_response({'error':'请求格式不正确'},400)
        if path=='/api/state':
            # Keep only the explicitly local learning data, with bounded field sizes.
            if body.get('schemaVersion') != 2:
                return self.json_response({'error':'课程已更新，请刷新旧练习标签页后继续。旧标签页不会覆盖新进度。'},409)
            clean={'schemaVersion':2,'week':1,'day':0,'task':0,'positions':{},'codes':{},'passed':{},'hints':{},'seen':{}}
            if body.get('week') in (1,2):clean['week']=body['week']
            positions=body.get('positions',{})
            if isinstance(positions,dict):
                for week in ('1','2'):
                    pos=positions.get(week)
                    if isinstance(pos,dict) and type(pos.get('day'))==int and type(pos.get('task'))==int and 0<=pos['day']<=6 and 0<=pos['task']<=2:
                        clean['positions'][week]={'day':pos['day'],'task':pos['task']}
            for field,maxval in [('day',6),('task',2)]:
                val=body.get(field,0)
                if type(val)==int and 0<=val<=maxval:clean[field]=val
            for field in ['codes','passed','hints','seen']:
                data=body.get(field,{})
                if not isinstance(data,dict):continue
                for key,value in data.items():
                    if key not in TASKS and key!='free':continue
                    if field=='codes' and isinstance(value,str) and len(value)<=40000:clean[field][key]=value
                    elif field=='passed' and isinstance(value,dict):clean[field][key]={'at':str(value.get('at',''))[:50],'withSolution':bool(value.get('withSolution'))}
                    elif field=='hints' and type(value)==int:clean[field][key]=max(0,min(2,value))
                    elif field=='seen':clean[field][key]=bool(value)
            with STATE_LOCK:
                temp=STATE.with_suffix('.tmp')
                temp.write_text(json.dumps(clean,ensure_ascii=False),encoding='utf-8')
                temp.replace(STATE)
            return self.json_response({'saved':True})
        if path=='/api/run':
            code=body.get('code')
            task=body.get('task')
            if not isinstance(code,str) or len(code)>40000:return self.json_response({'error':'代码应为不超过 40000 字符的文本'},400)
            if task is not None and (not isinstance(task,str) or task not in TASKS):return self.json_response({'error':'未知题目'},400)
            return self.json_response(run_code(code,task))
        self.json_response({'error':'未知操作'},404)

if __name__=='__main__':
    try:
        server=ThreadingHTTPServer(('127.0.0.1',PORT),Handler)
    except OSError:
        import urllib.request
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{PORT}/api/config',timeout=2) as response:
                data=json.load(response)
            if data.get('name')=='ioai-week1' and data.get('version')==2:
                print(f'练习网页已在运行：http://127.0.0.1:{PORT}',flush=True)
                if '--open' in sys.argv:webbrowser.open(f'http://127.0.0.1:{PORT}')
                sys.exit(0)
            if data.get('name')=='ioai-week1':
                print('旧版练习服务仍在运行。请在原启动窗口按 Ctrl+C 停止，再双击新版启动脚本。',flush=True)
                sys.exit(1)
        except Exception:pass
        print(f'端口 {PORT} 已被占用，请设置 IOAI_PORT 为其他端口后重试。',flush=True)
        sys.exit(1)
    print(f'IOAI Lab ready: http://127.0.0.1:{PORT}',flush=True)
    if '--open' in sys.argv:threading.Timer(.4,lambda:webbrowser.open(f'http://127.0.0.1:{PORT}')).start()
    try:server.serve_forever()
    except KeyboardInterrupt:kill_process(CURRENT);server.server_close()
