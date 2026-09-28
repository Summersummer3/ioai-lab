#!/bin/bash
cd "$(dirname "$0")" || exit 1
runtime_python=""
for candidate in ".venv/bin/python3" "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3" "$(command -v python3 || true)"; do
  if [ -n "$candidate" ] && [ -x "$candidate" ] && "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)' >/dev/null 2>&1; then
    runtime_python="$candidate"
    break
  fi
done
if [ -z "$runtime_python" ]; then
  echo "请先安装 Python 3.11 或更新版本：https://www.python.org/downloads/"
  read -r -p "按回车关闭…"
  exit 1
fi
"$runtime_python" bootstrap.py
status=$?
if [ "$status" -ne 0 ]; then
  read -r -p "启动失败，请查看上方提示。按回车关闭…"
fi
exit "$status"
