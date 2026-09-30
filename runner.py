"""Execute one local practice in its own working directory; not a security sandbox."""
import base64
import contextlib
import io
import json
import linecache
import os
from pathlib import Path
import sys
import traceback
if os.name != 'nt':
    import resource
    resource.setrlimit(resource.RLIMIT_CPU, (25, 26))
    resource.setrlimit(resource.RLIMIT_FSIZE, (10_000_000, 10_000_000))
os.environ['MPLBACKEND'] = 'Agg'
os.environ.setdefault('MPLCONFIGDIR', str(Path.cwd() / '.mpl'))
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.rcParams.update({'figure.figsize': (6.4, 3.8), 'figure.dpi': 110, 'axes.spines.top': False, 'axes.spines.right': False, 'axes.titleweight': 'bold', 'axes.labelcolor': '#46536a', 'axes.edgecolor': '#c2cbd9', 'figure.autolayout': True})

SCORES='name,group,math,english,science\nAn,A,80,90,85\nBo,A,60,,75\nChen,B,95,88,92\nDing,B,70,76,68\nEna,A,85,92,90\nChen,B,95,88,92\n'
REVIEW='name,group,math,english,science\nLin,red,72,81,78\nMo,blue,88,90,85\nNan,red,65,,70\nOu,blue,91,94,96\nPei,red,78,83,80\nMo,blue,88,90,85\n'
Path('scores.csv').write_text(SCORES,encoding='utf-8')
Path('review.csv').write_text(REVIEW,encoding='utf-8')
request=json.loads(sys.stdin.read())
raw_scores=pd.read_csv(io.StringIO(SCORES))
clean_scores=raw_scores.drop_duplicates().copy()
clean_scores['english']=clean_scores['english'].fillna(clean_scores['english'].mean())
clean_review=pd.read_csv(io.StringIO(REVIEW)).drop_duplicates().copy()
clean_review['english']=clean_review['english'].fillna(clean_review['english'].mean())
expected_scores=np.array([[80,90,85],[60,70,75],[95,88,92],[70,76,68],[85,92,90]])

class BoundedOutput(io.StringIO):
    def write(self, value):
        remaining=60_000-self.tell()
        if remaining>0:
            super().write(value[:remaining])
        return len(value)

def describe(exc):
    frames=[f for f in traceback.extract_tb(exc.__traceback__) if f.filename=='practice.py']
    line=frames[-1].lineno if frames else None
    message=str(exc)
    if isinstance(exc,SyntaxError) and exc.filename=='practice.py':
        line,message=exc.lineno,exc.msg or message
    head=['Traceback (most recent call last):\n',*traceback.format_list(frames[-8:])] if frames else []
    trace=''.join(head+traceback.format_exception_only(type(exc),exc))
    return {'type':type(exc).__name__,'message':message[:2000],'line':line,'trace':trace[-8000:]}

out=BoundedOutput()
result={'stdout':'','error':None,'error_info':None,'checks':[],'images':[],'files':[]}
namespace={'__name__':'__main__'}
# pyplot.show is intentionally non-blocking; all open figures are collected below.
plt.show=lambda *a,**k: None
code=request['code']
# The code never exists on disk; caching it lets tracebacks show the learner's source lines.
linecache.cache['practice.py']=(len(code),None,code.splitlines(True),'practice.py')
try:
    with contextlib.redirect_stdout(out),contextlib.redirect_stderr(out):
        exec(compile(code,'practice.py','exec'),namespace)
except BaseException as exc:
    result['error']=traceback.format_exc(limit=5)
    try:result['error_info']=describe(exc)
    except Exception:pass
result['stdout']=out.getvalue()
if not result['error']:
    for check in request.get('checks',[]):
        context=dict(namespace)
        context.update(np=np,pd=pd,expected_scores=expected_scores,raw_scores=raw_scores,clean_scores=clean_scores,clean_review=clean_review)
        try:
            with contextlib.redirect_stdout(out),contextlib.redirect_stderr(out):
                exec(check['code'],context)
            result['checks'].append({'name':check['name'],'passed':True})
        except BaseException as exc:
            message=check['message']
            if isinstance(exc,NameError): message+=' '+str(exc)
            result['checks'].append({'name':check['name'],'passed':False,'message':message})
for number in plt.get_fignums()[:6]:
    try:
        figure=plt.figure(number)
        # Prevent accidental huge raster allocations from editable plot sizes.
        width,height=figure.get_size_inches()
        factor=min(1,12/max(width,height))
        figure.set_size_inches(width*factor,height*factor)
        image=io.BytesIO()
        figure.savefig(image,format='png',dpi=110)
        result['images'].append(base64.b64encode(image.getvalue()).decode())
    except Exception as exc:
        result['error']=(result['error'] or '')+'\n图表导出失败：'+str(exc)
plt.close('all')
for path in sorted(Path('.').iterdir()):
    if path.is_file() and not path.is_symlink() and path.name not in {'scores.csv','review.csv'} and path.suffix.lower() in {'.csv','.txt','.json'} and path.stat().st_size<=1_000_000:
        result['files'].append({'name':path.name,'data':base64.b64encode(path.read_bytes()).decode()})
        if len(result['files'])>=8:break
sys.stdout.write(json.dumps(result,ensure_ascii=False))
