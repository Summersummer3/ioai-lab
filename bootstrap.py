"""Prepare a local environment and launch IOAI Lab on Windows/macOS/Linux."""
from pathlib import Path
import os
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parent

def main():
    if sys.version_info < (3, 11):
        print('需要 Python 3.11 或更新版本。请安装后重新启动。', flush=True)
        return 1
    os.chdir(ROOT)
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    os.environ['MPLCONFIGDIR'] = str(ROOT / '.data' / 'matplotlib')
    Path(os.environ['MPLCONFIGDIR']).mkdir(parents=True, exist_ok=True)
    environment = ROOT / ('.venv-windows' if os.name == 'nt' else '.venv')
    python = environment / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python3')
    def probe(code):
        try:
            return subprocess.run([str(python), '-c', code], cwd=ROOT, capture_output=True, timeout=60).returncode == 0
        except (OSError, subprocess.TimeoutExpired):
            return False
    if not probe('import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)'):
        if environment.exists():
            backup = environment.with_name(environment.name + '-old-' + str(time.time_ns()))
            environment.rename(backup)
            print('旧环境无法使用，已保留到：' + backup.name, flush=True)
        print('正在创建独立 Python 环境……', flush=True)
        subprocess.run([sys.executable, '-m', 'venv', str(environment)], check=True)
    if not probe('import numpy, pandas, matplotlib, sklearn'):
        print('首次安装学习所需的库，需要联网。请保留此窗口……', flush=True)
        subprocess.run([str(python), '-m', 'pip', 'install', '-r', str(ROOT / 'requirements.txt')], check=True)
    print('正在打开 IOAI Lab。请保留此窗口，按 Ctrl+C 停止服务。', flush=True)
    return subprocess.call([str(python), str(ROOT / 'server.py'), '--open'], cwd=ROOT)

if __name__ == '__main__':
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8', errors='replace')
    try:
        status = main()
    except KeyboardInterrupt:
        status = 0
    except (OSError, subprocess.SubprocessError) as exc:
        print('\n启动失败：' + str(exc), flush=True)
        print('请确认文件夹可写、Python 安装完整；首次安装库时检查网络，然后重试。', flush=True)
        status = 1
    sys.exit(status)
