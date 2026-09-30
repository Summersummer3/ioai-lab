# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- 主要用户：备赛 IOAI（国际人工智能奥林匹克）的一组学生。已经学过 Python，刚开始学习数据处理和机器学习。每人在自己的 Windows 或 macOS 电脑上离线使用，按周、按天推进，每天建议 60–90 分钟，可以分两次完成。
- 分发者：老师或教练把整个项目打包发给学生。产品没有老师端，不汇总学生进度；学生自己启动、自己学习。
- 未确认：学生的具体年龄段（IOAI 面向中学生，这里只是推断）。

## Product Purpose

让学生在本机完成每天的"先学、再练、再检查"：先读逐句讲解的笔记并运行其中的示例，再独立完成 3 道练习，由本地自动检查验证结果。成功意味着学生能独立写出并解释代码，而不只是通过检查。

## Positioning

完全离线、在本机运行真实 Python（NumPy、Pandas、Matplotlib、scikit-learn）的备赛训练：每一天都是一节带可运行示例的课，配两级提示、参考解法和自动检查。它不是在线判题平台，也不是 IOAI 官方平台。

## Operating Context

- 学生双击启动脚本，本地服务只监听本机（默认 127.0.0.1:8765），浏览器打开训练首页。
- 课程结构：2 周 × 7 天 × 3 题，共 42 题。Week 1 是数据基础（NumPy、Pandas、Matplotlib），Week 2 是从数据到预测（划分、KNN、评价指标、Pipeline、交叉验证、独立分类项目）。
- 每一天：一份逐句笔记（示例、逐行讲解、实际输出、自测），然后 3 道练习；每题有两级提示、参考解法和自动检查。
- 进度自动保存在本机 `.data/progress.json`；换电脑时用"导出学习备份 / 恢复备份"。
- 每次运行是独立的 Python 进程，上限 30 秒；每次都有内置的 scores.csv、review.csv，Iris、Wine 数据随 scikit-learn 提供。

## Capabilities and Constraints

- 纯 HTML/CSS/JS（无框架、无构建步骤），由 Python 标准库服务提供。`server.py` 只放行固定的静态文件清单；新增静态文件需要改清单，并让学生重启服务。
- 服务端保存的进度字段是固定的（positions、codes、passed、hints、seen）；新增字段同样需要改 `server.py` 并重启。
- 必须离线可用：不能依赖在线字体、CDN 或任何远程资源。
- 界面语言为简体中文；中文依赖系统字体，Windows 和 macOS 下都要清晰可读。
- Windows 启动路径尚未在真实 Windows 环境中验证。
- 练习代码在本机执行，临时运行目录不是安全沙箱。

## Brand Commitments

- 名称：IOAI Lab。
- 必须保持"个人备赛练习工具，并非 IOAI 官方平台"的定位，不得暗示官方身份。

## Evidence on Hand

- 真实课程内容：`dist/curriculum.json`（Week 1）、`dist/week2.json`（Week 2）、`dist/courses.json`（课程索引）；检查定义在 `curriculum_private.json`、`week2_private.json`。
- 没有学生评价、使用数据、获奖记录或老师背书，不得编造。

## Product Principles

1. 先理解，再动手：每天的顺序是学习、练习、检查，而不是一进来就做题。
2. 检查服务于理解：结果要帮学生找到问题所在，而不只是给出对错。
3. 学生能独立推进：不依赖老师在场，下一步始终清楚。
4. 离线、本机、可靠：不丢进度，不依赖网络。

## Accessibility & Inclusion

- 键盘可以完成主要流程，文字对比度达到 WCAG AA。
- 中文排版在 Windows 和 macOS 的系统字体下都要清晰。
