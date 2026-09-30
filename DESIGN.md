---
name: IOAI Lab
description: 离线备赛的每日竞赛讲义：冷白点阵纸上的白色讲义卡片，深海军蓝页头与代码面板，电光蓝只标记下一步和当前位置。
colors:
  accent: "#2f5bff"
  accent-strong: "#2448d8"
  cyan: "#0891b2"
  green: "#16a34a"
  run: "#15803d"
  done: "#166534"
  done-soft: "#e7f6ec"
  warn: "#9a5b13"
  warn-soft: "#fff5e6"
  danger: "#b42318"
  danger-soft: "#fef0ee"
  paper: "#f3f6fa"
  dot: "#d9e1ec"
  surface: "#ffffff"
  tint: "#eef3ff"
  line: "#dde4ee"
  line-strong: "#c7d2e1"
  ring: "#a3afc2"
  ink: "#0f172a"
  muted: "#526077"
  fill: "rgb(15 23 42 / 6%)"
  fill-hover: "rgb(15 23 42 / 10%)"
  selection: "#cfdcff"
  scrollbar: "#c3ccd9"
  nav: "#0b1a33"
  nav-row: "#08152b"
  nav-sub: "#15243d"
  nav-ink: "#ffffff"
  nav-muted: "#a9b8d0"
  code-bg: "#0b1a33"
  code-ink: "#e2e8f0"
  code-muted: "#7d8ca6"
  syn-keyword: "#7aa2ff"
  syn-function: "#c3a6ff"
  syn-number: "#f5b86b"
  syn-string: "#7ee2b8"
  syn-comment: "#8a98ae"
  syn-builtin: "#5fd4e6"
typography:
  display:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.3
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
  subhead:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.5
  card-title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.6
  reading:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.8
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  control:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "13px"
    fontWeight: 500
  caption:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "21.5px"
    fontFeature: '"liga" 0, "calt" 0'
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "40px"
  edge: "24px"
  gap: "24px"
  lift: "34px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  button-primary-large:
    height: "36px"
    padding: "0 16px"
  button-run:
    backgroundColor: "{colors.run}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 14px"
  button-run-hover:
    backgroundColor: "{colors.done}"
  button-secondary:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 14px"
  button-secondary-hover:
    backgroundColor: "{colors.fill-hover}"
  button-icon:
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    size: "32px"
  button-icon-hover:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
  button-text:
    textColor: "{colors.accent-strong}"
    typography: "{typography.caption}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "20px 24px 24px"
  card-compact:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  card-title:
    textColor: "{colors.ink}"
    typography: "{typography.card-title}"
  question-callout:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    typography: "{typography.card-title}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  list-item:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "6px 8px"
  list-item-hover:
    backgroundColor: "{colors.paper}"
  list-item-current:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.accent-strong}"
  mode-tab:
    textColor: "{colors.muted}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: "30px"
    padding: "0 12px"
  mode-tab-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  task-tab:
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    padding: "2px 1px 10px"
  task-tab-selected:
    textColor: "{colors.accent-strong}"
  status-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 10px"
  status-chip-busy:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.accent-strong}"
  status-chip-done:
    backgroundColor: "{colors.done-soft}"
    textColor: "{colors.done}"
  status-chip-warn:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
  status-chip-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
  inline-code:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.accent-strong}"
    rounded: "{rounded.xs}"
    padding: "1px 4px"
  code-panel:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "12px"
  masthead:
    backgroundColor: "{colors.nav}"
    textColor: "{colors.nav-ink}"
  toast:
    backgroundColor: "{colors.nav}"
    textColor: "{colors.nav-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "9px 18px"
---

# Design System: IOAI Lab

## Overview

**Creative North Star: "竞赛讲义（The Competition Handout）"**

每一天都是一讲竞赛讲义。页面底是一张冷白点阵纸，白色讲义卡片用 1px 细线压在纸上；深海军蓝既是页头（讲义的书眉），也是代码面板的材质，代码在里面带着编辑器式的语法高亮。整体安静、清楚、偏技术，读起来像一份排得很干净的讲义，而不是判题平台：先读，再亲手运行，再练习。

字体是仿 LeetCode 的平台系统字体栈，中文走 PingFang SC / Microsoft YaHei，代码走 Menlo / Consolas。正文用常规字重，卡片标题和控件用 500，只有标题用 600。按钮扁平无边框：蓝色实心主按钮、绿色“运行并检查”，其余一律是浅灰薄涂底。间距偏松：组内紧、组间开，卡片之间留 16–24px。

颜色是信号，不是装饰。电光蓝只标记下一步、选中项和当前位置；青色细线标记当前天和进度；绿色表示完成；检查没通过用琥珀色，只有让程序停下的报错才用红色。已确认拒绝的方向：处处加粗的字重、描边按钮、过紧的排版，以及效果图里 Geist 风格的展示字体；这些都由用户在效果图之后明确否决。

**Key Characteristics:**
- 冷白点阵纸上的白色讲义卡片，靠 1px 细线分层，几乎没有阴影。
- 深海军蓝是页头和代码面板共用的一种材质。
- 电光蓝＝下一步与当前位置，青色＝进度线，绿色＝完成，琥珀＝未通过，红色＝报错。
- 一套系统字体栈，400 / 500 / 600 三档字重，没有 700。
- 无边框按钮，每个模式只有一个实心按钮。
- 深色代码面板带行号和固定的语法色板。

## Colors

冷调的蓝灰中性色打底，三种职责分明的信号色（电光蓝、进度青、完成绿），外加一对反馈色和一套只在深色代码面板里出现的语法色。

### Primary
- **电光蓝** (#2f5bff)：主按钮的填充、当前天的实心标记、选中模式的编号圆、选中题目标签的 2px 下划线、编号讲解的圆圈描边，以及浅色区的焦点环、输入光标和表单 accent-color。白字对比 5.2:1。
- **深电光蓝** (#2448d8)：所有蓝色文字，包括讲次“第 N 讲”、当前目录项和题目行、正文链接、“查看参考解法”、文字按钮；也是主按钮的悬停色。白底 7.0:1，冰蓝底 6.3:1。

### Secondary
- **进度青** (#0891b2)：只画线和环：当前天下方的 2px 细线、首页进度条、已完成天之间的连线、“已开始”的 2px 空心环、当前页链接的 2px 下划线。白底只有 3.7:1，所以从不用于文字。

### Tertiary
- **勾选绿** (#16a34a)：已完成的实心圆标记，配白色勾。
- **运行绿** (#15803d)：“运行并检查”按钮的填充，白字 5.0:1。
- **完成墨绿** (#166534)：完成状态的文字（“全部通过”、通过的检查行、“3 / 3”），也是运行按钮的悬停色。
- **薄荷底** (#e7f6ec)：通过的检查行、“已完成”标签、已通过题号的底色。

### Neutral
- **点阵纸** (#f3f6fa)：页面底色；也是卡片里列表行的悬停色，以及次级面板（阅读顺序、自测、示例输出）和中性状态标签的底色。
- **点阵** (#d9e1ec)：16px 网格上 1px 的圆点，只铺在页面底。
- **讲义白** (#ffffff)：所有卡片、切换条的滑块、讲义页脚。
- **冰蓝底** (#eef3ff)：当前项和选中项的底色、核心问题框、行内代码、提示、笔记表头、“正在运行”标签。
- **细线** (#dde4ee)：卡片的 1px 边框、卡片内的分隔线、表格线、进度条的轨道。
- **刻度灰** (#c7d2e1)：步骤之间的连线。
- **待办环** (#a3afc2)：未开始、未通过的空心圆标记；只作占位，不承载信息。
- **午夜墨** (#0f172a)：正文与标题。白底 17.9:1。
- **石板灰** (#526077)：次要文字、元信息、灰底按钮里的图标。白底 6.4:1，点阵纸 5.9:1。
- **墨色薄涂** (rgb(15 23 42 / 6%)) 与 **加深薄涂** (rgb(15 23 42 / 10%))：次按钮和提示按钮的底色及其悬停色，也是图标按钮的悬停底。
- **选区蓝** (#cfdcff) 与 **滚动条灰** (#c3ccd9)：浅色区的文字选区和滚动条滑块。
- **深海军蓝** (#0b1a33)：首页页头、底部提示气泡。
- **深渊蓝** (#08152b) 与 **港湾蓝** (#15243d)：讲义页页头的上层（品牌行）和下层（返回与面包屑）。
- **页头白** (#ffffff) 与 **雾蓝** (#a9b8d0)：页头的主文字和次文字（面包屑、字标里的“LAB”、首页页头链接）。

### Feedback
- **琥珀墨** (#9a5b13) 配 **琥珀底** (#fff5e6)：检查没通过、“未通过 · 1/3”。对比 5.0:1。
- **报错红** (#b42318) 配 **淡红底** (#fef0ee)：代码报错、连接失败、启动失败。对比 5.9:1。

### Code
- **代码海军蓝** (#0b1a33)：编辑器、笔记代码块、参考解法的底色，和深海军蓝是同一种材质。
- **代码霜白** (#e2e8f0)：代码正文，14.1:1。
- **行号灰** (#7d8ca6)：行号、编辑器快捷键提示、复制按钮，5.1:1。
- **语法色**：关键字蓝 (#7aa2ff)、函数淡紫 (#c3a6ff)、数字琥珀 (#f5b86b)、字符串薄荷 (#7ee2b8)、注释石板 (#8a98ae，斜体)、内置名青 (#5fd4e6)，在代码海军蓝上都在 5.9:1 以上。关键字蓝同时是所有深色区域的焦点环颜色。

### Named Rules
**The One Blue Rule.** 电光蓝只做三件事：主操作、选中、当前位置。标题、插图、分隔线和装饰图标都不用蓝；蓝色文字一律用深电光蓝。

**The Cyan Thread Rule.** 进度青只画 1–2px 的线和空心环，标记当前天与进度；永远不做文字、按钮或大面积填充。

**The Amber Not Red Rule.** 检查没通过是琥珀色（还在学习中），只有让程序停下来的报错才是红色。

## Typography

**Display Font:** 系统无衬线字体栈（-apple-system、BlinkMacSystemFont、Segoe UI、PingFang SC、Hiragino Sans GB、Microsoft YaHei，回退 Helvetica / Arial / sans-serif）
**Body Font:** 同一套系统字体栈
**Label/Mono Font:** Menlo、Monaco、Consolas（回退 Courier New / monospace）

**Character:** 仿 LeetCode 的阅读感：平台原生的中文字形，常规字重，干净耐读、不表演。这是为离线使用和 Windows / macOS 中文清晰度做的明确选择，不是找不到字体时的回退；层级靠字号和 400 / 500 / 600 三档字重建立。

### Hierarchy
- **Display** (600, 30px, 1.3)：首页的当天标题；讲义卡片开头的讲次“第 N 讲”（深电光蓝，行高 38px，数字放大到 34px）。手机上 23–26px。
- **Headline** (600, 22px, 1.4)：讲义标题，与讲次基线对齐排在同一行。手机上 20px。
- **Title** (600, 18px, 1.4)：区块标题（“每周训练”）和题目标题。
- **Subhead** (600, 17px, 1.5)：笔记里的小节标题；上方 28px、下方 10px。
- **Card Title** (500, 15px, 1.6)：卡片标题（“本讲目录”“运行区”“输出”）、讲义页的核心问题、代码块标签。
- **Reading** (400, 15px, 1.8)：笔记正文、题目描述和要求列表。
- **Body** (400, 14px, 1.6)：界面默认文字、目录项、题目行、提示。
- **Control** (500, 14px, 1)：按钮、学习 / 练习切换、页头链接。
- **Label** (500, 13px)：状态标签。
- **Caption** (400, 13px, 1.4)：计数、元信息、图注、页脚。
- **Code** (400, 13px, 21.5px)：编辑器和代码块，关闭连字，tab 宽 4；运行输出和参考解法同字号、1.65 行高。

### Named Rules
**The Six Hundred Ceiling Rule.** 最重只到 600，只给标题和品牌字标；卡片标题、控件、标签和正文里的强调都是 500；阅读文字 400。全站没有 700。

**The Mono Means Code Rule.** 等宽字体只出现在代码、文件名、运行输出和报错信息里，不做标签、标题或“技术感”装饰。

**The Tabular Count Rule.** “9 / 21”“0 / 2”“练习 1 / 3”这类计数一律用等宽数字（tabular-nums）。

## Layout

两种页面模型共用同一个页头和同一张纸：

- **工作台页**（如讲义页）：一张整宽 sheet，页边距 edge 24px；高度吃满视口（最低 560px），72px 高的周进度卡在上，下面三栏按 240 : 540 : 480 的比例伸缩（左栏最窄 220px，右栏最窄 380px；自由练习时收成 780 : 480 两栏），栏间距 gap 24px，每栏内部独立滚动。
- **目录页**（如首页）：居中的 1080px 单列，左右 32px，卡片纵向堆叠，区块之间 40px。

间距以 4px 为基准，常用 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40。组内紧（列表行之间 2px，图标与文字 6–8px），组间开（卡片之间 16–24px，区块之间 32–40px），标题上方的空间大于下方。阅读卡片左右 24px（讲义头部 22px 24px 0，正文 20px 24px 24px，页脚 12px 24px；≤1279px 时 20px，手机 16px），工具卡片 16px（运行区顶部 18px）。

响应式：讲义页在 ≤1279px 时页边距与栏间距收到 16px、左栏变窄；≤1099px 变成两栏（讲义 | 运行区），目录折叠成可展开的卡片，步骤条横向滚动；≤820px 单列；≤640px 页边距 12px，讲义改为页面流、取消内部滚动，所有控件 44px 高。首页在 ≤959px 时把一周七天改为竖排列表，≤759px 左右 16px、控件 44px。

**The Lifted Sheet Rule.** 第一张卡片向上压进深蓝页头（讲义页 34px，首页 32px，首页手机 28px；讲义页 ≤640px 时取消），让卡片读作放在书眉上的讲义纸。

## Elevation & Depth

扁平，用色调分层：点阵纸 → 白色卡片（1px 细线）→ 卡片内的冰蓝或点阵纸面板；深海军蓝是唯一的暗层。阴影只有三种，都很轻，而且都不负责定义卡片。

### Shadow Vocabulary
- **Whisper** (`box-shadow: 0 1px 2px rgb(15 23 42 / 5%)`)：首页卡片与跳转链接的一丝托起；讲义页的卡片只用细线。
- **Thumb** (`box-shadow: 0 1px 2px rgb(15 23 42 / 8%)`)：学习 / 练习切换条里的白色滑块。
- **Toast** (`box-shadow: 0 6px 16px -6px rgb(15 23 42 / 40%)`)：底部提示气泡，唯一真正浮起来的元素。

### Named Rules
**The Hairline First Rule.** 卡片由 1px 细线定义，不靠阴影；静止元素最多用 Whisper。没有彩色光晕，没有硬偏移阴影，点阵只铺在页面底、不进卡片。

## Shapes

轻微圆角的方正轮廓。8px 给卡片、按钮、代码面板、核心问题框和讲义里的提示面板；6px 给行级元素（列表行、步骤框、状态标签、切换滑块、底部提示气泡）和输出区里的结果条目；4px 给行内代码。状态标记和编号徽章是 16–22px 的正圆，进度条是 4px 高的圆头细条。边框只有 1px 细线，没有彩色侧边条。

**The Two Radii Rule.** 只用 8px 和 6px 两个圆角，行内代码用 4px；正圆和圆头细条之外，不引入别的值。

## Components

### Buttons
- **Shape:** 8px 圆角，32px 高，左右 14px，无边框；描线图标 16px、实心播放图标 14px，与文字间距 6px。页面级动作（讲义页脚、首页当天卡片）用 36px 高、左右 16px；手机上 44px 高。
- **Primary:** 电光蓝底白字，Control 字型。用于“读完了，开始练习”“继续：…”和自由练习场的“运行代码”。
- **Hover / Focus:** 背景 150ms 过渡到深一级（主按钮到深电光蓝，运行按钮到完成墨绿，次按钮从 6% 到 10%）；焦点是 2px 电光蓝外环、偏移 2px；禁用时 50% 不透明度。首页主按钮悬停时箭头右移 3px。
- **Secondary / Ghost / Tertiary:** 次按钮是墨色薄涂底、午夜墨字，里面的图标用石板灰（“运行”“复制到运行区”“下一题”“复习本周”）。运行按钮是运行绿底白字，只在练习模式出现（“运行并检查”）。图标按钮 32px 见方、透明底、石板灰图标，悬停出现薄涂底并变成墨色（恢复初始代码、下载）。文字按钮是 13px 深电光蓝，悬停出下划线（导出学习备份、恢复备份）。

**The One Solid Button Rule.** 每个模式只有一个实心按钮，它就是下一步：学习模式是“读完了，开始练习”（蓝），练习模式是“运行并检查”（绿），自由练习场是“运行代码”（蓝）。其余按钮一律是灰底或纯图标。

### Chips
- **Style:** 6px 圆角，Label 字型，上下 2px、左右 10px，无边框，用色对填充（浅底配同色系深字）。
- **State:** 准备就绪、已停止用点阵纸配石板灰；正在运行用冰蓝底配深电光蓝；运行成功、全部通过用薄荷底配完成墨绿；“未通过 · n/m”用琥珀色对；运行出错、连接失败用红色对。首页的周状态沿用同一套色对：已完成（薄荷）、进行中（冰蓝）、未开始（点阵纸加 1px 细线内描边）。

### Cards / Containers
- **Corner Style:** 8px。
- **Background:** 讲义白，放在点阵纸上。
- **Shadow Strategy:** 细线优先，最多 Whisper（见 Elevation & Depth）。
- **Border:** 1px 细线；卡片内部的分区（切换条下方、讲义页脚上方、首页周与周之间）也用 1px 细线。
- **Internal Padding:** 阅读卡片左右 24px，工具卡片 16px，侧栏列表卡片 18px 12px 10px（列表行自带 6px 8px），首页当天卡片 28px 32px。卡片标题用 Card Title 字型。
- **Inner Panels:** 卡片里的次级面板不加边框：冰蓝底（核心问题、提示）或点阵纸底（阅读顺序、自测、示例输出），8px 圆角，12px 16px 内边距。首页当天卡片里的核心问题放大一级（16px，14px 18px）。

### Inputs / Fields
- **Style:** 产品里唯一的输入是代码编辑器：代码海军蓝面板、8px 圆角，左侧行号列右对齐，Code 字型、关闭连字；输入层透明、只显示霜白光标，高亮层在下面着色。
- **Focus:** 编辑器获得焦点时出现 2px 关键字蓝的内描边，右下角浮出 12px 的快捷键提示（Tab 缩进 · Esc 后按 Tab 离开 · ⌘/Ctrl + Enter 运行）。
- **Error / Disabled:** 出错的行铺一条半透明珊瑚色横带，行号变成淡珊瑚色；运行中运行按钮降到 50% 不透明度，旁边出现“停止”次按钮。

### Navigation
- **Style:** 深海军蓝页头。讲义页分两层：52px 的深渊蓝品牌行（品牌 + “自由练习场”）和港湾蓝的返回行（“← 训练中心” + 面包屑，两者之间一条 14% 白的 1px 竖线）。首页是 56px 的单层深海军蓝。品牌字标是 28px 品牌标记（深蓝方块配青柠竖条）+ “IOAI”（600）+ “LAB”（400，雾蓝），略加字距。
- **Typography:** 页头链接 14–15px、500、白字；面包屑 14px 雾蓝，当前项白色，用 14px 右箭头图标分隔。
- **States:** 悬停出下划线（偏移 .2em）；当前页链接用 2px 进度青下划线；深色区的焦点环换成关键字蓝。本地服务断开时，页头出现一枚数字琥珀色的警示药丸（12% 填充、55% 描边、13px / 500），点击导出备份。
- **In-card navigation:** 目录和题目行是 6px 圆角的行（6px 8px 内边距），悬停点阵纸底，当前项冰蓝底配深电光蓝字，不加侧边条。题目标签是下划线式：14px 文字配 22px 编号圆，选中时深电光蓝、500、2px 电光蓝下划线；已通过的题号换成薄荷底勾。
- **Mobile:** 所有触控目标 44px；目录折叠为可展开的卡片；步骤条横向滚动；学习 / 练习切换铺满整行。

### Week Stepper
七天步骤条是这套系统的进度签名，放在整宽周进度卡里：左侧 18px / 500 的周标题，右侧“本周 9 / 21”。每一天是 16px 圆形标记 + “第 N 天” + 当天名称：已完成是勾选绿实心圆配白勾；当前是冰蓝底 6px 圆角框、电光蓝实心圆配白点、深电光蓝文字，框下一条 2px 进度青细线贴着卡片底边；已开始是 2px 进度青空心环；未开始是待办环空心圆，只显示石板灰的“第 N 天”。天与天之间用 1px 刻度灰连线。首页展开的周计划用同一套标记（18px），已完成段的连线变成 2px 进度青，≤959px 时改为竖排。

### Mode Switch
“① 学习 / ② 练习”分段切换：5% 墨色的轨道（3px 内边距、8px 圆角），白色滑块（6px 圆角 + Thumb 阴影）在两项之间滑动 340ms（ease-out，尊重减少动态偏好）。每项 30px 高：16px 编号圆（选中时电光蓝实心白字）+ 500 的标签 + 石板灰的“· 笔记 8 节 / · 3 题”。切换条下方留 16px 并有一条 1px 细线，然后才是讲义内容。

### Lecture Header
讲义卡片的开头：讲次“第 N 讲”（Display，深电光蓝）与讲义标题（Headline）基线对齐排成一行，放不下时换行；下方 14px 是核心问题框：冰蓝底，前缀“本讲核心问题：”用石板灰常规字重，问题本身 15px / 500。

### Code Panel
笔记代码块：上方一行是 15px / 500 的代码标签和两个次按钮（“运行”“复制到运行区”），下方是代码海军蓝面板，行号由计数器生成（行号灰、不可选中），右上角是 30px 的透明复制按钮，悬停出 8% 白底。代码之后是编号讲解：18px 圆圈（1px 电光蓝描边、11px 深电光蓝数字）配 24px 行高的说明。行内代码是冰蓝底、深电光蓝字、0.9em、4px 圆角。深色区的选区是 34% 的关键字蓝，滚动条滑块是暗石板色。

### Results
输出卡最上方是状态标签，下面按运行顺序排结果：程序输出用 13px / 1.65 的等宽字；检查行是 6px 9px 内边距配 16px 图标（通过：薄荷底加勾；未通过：琥珀底加空心圆和 13px 原因；跳过：点阵纸底、石板灰）；报错卡是淡红底加 1px 淡红描边，标题带 18px 警示图标、600，报错信息用等宽字，完整报错默认折叠。空状态是一句 14px 的引导加一行 13px 石板灰说明。

## Do's and Don'ts

### Do:
- **Do** 把电光蓝 (#2f5bff) 只留给主操作、选中项和当前位置；蓝色文字用深电光蓝 (#2448d8)。
- **Do** 用冰蓝底 (#eef3ff) 配深电光蓝文字标记当前项：目录项、题目行、当前天、“正在运行”。
- **Do** 每个模式只放一个实心按钮，其余用墨色薄涂（6%，悬停 10%）或纯图标按钮。
- **Do** 阅读文字用 15px / 1.8，界面文字用 14px / 1.6；标题 600，卡片标题与控件 500，正文 400。
- **Do** 检查没通过用琥珀色对，报错才用红色对，完成用薄荷底配完成墨绿。
- **Do** 给浏览器表层上色：选区 #cfdcff，滚动条 #c3ccd9，光标与 accent-color 用电光蓝，焦点环 2px 电光蓝、偏移 2px，深色区换成关键字蓝 (#7aa2ff)。
- **Do** 在讲义页 ≤640px、首页 ≤759px 时把每个可点控件做到至少 44px。
- **Do** 计数用等宽数字，代码关闭连字。

### Don't:
- **Don't** 给操作按钮加描边，也不要做描边按钮；效果图里的描边按钮已被用户否决。
- **Don't** 用 700 或更重的字重，也不要整段加粗。
- **Don't** 加载网络字体、CDN 或任何远程资源；页面必须离线可用。
- **Don't** 在标题上方放眉题或小标签（包括英文或等宽的装饰标签）；标题自己说话。
- **Don't** 用进度青 (#0891b2) 写文字（白底 3.7:1），也不要在勾选绿 (#16a34a) 上放白色文字（3.3:1）；实心绿按钮用运行绿 (#15803d)。
- **Don't** 用彩色侧边条标记当前项、提示或警示；当前项用冰蓝底。
- **Don't** 给静止的卡片加比 Whisper 更重的阴影，不要彩色光晕，也不要硬偏移阴影。
- **Don't** 把点阵铺进卡片，也不要把品牌标记里的青柠绿 (#9df17c) 用到界面上。
