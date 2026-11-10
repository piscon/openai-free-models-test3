# OpenAI 免费模型速查

OpenAI **数据共享计划**的每日免费 token 名单速查 + 使用指南。点下面的按钮，别人就能在**自己的 Cloudflare 账号**里一键生成同款页面，不需要本地环境、不需要任何 API Key。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/piscon/openai-free-models)

> 本项目是第三方整理工具，与 OpenAI 无隶属关系。数据来自 OpenAI 官方页面（见文末来源），最终以官方为准。

## 页面长什么样

- **速查表**：两个共享额度池的大数字（旗舰池 100 万/天、小型池 1,000 万/天，含 Build 层级数字）、距 UTC 00:00 重置的实时倒计时
- **5 个任务分组**：通用主力 / 深度推理 / 编程专用 / 视觉与长文 / 轻量高速，共 34 个模型，每个模型一键复制、每组整组复制、支持搜索
- **状态标记**：最新代模型挂「新锐」；已宣布关停的挂「落幕」并显示关停日期、剩余天数和官方接班人；已关停的单独标记
- **使用指南**：资格自查、开启步骤、额度规则与坑（同池共享、超额整单计费、不计入的部分）、按任务选模型、落幕迁移表、FAQ
- 双主题：浅色为 OpenAI 式黑白中性色，深色参考 Tokyo Night 配色（高对比蓝紫系），手机端适配

## 快速开始

你需要：一个 **Cloudflare 账号**（免费）和一个 **GitHub / GitLab 账号**。不需要本地环境，不需要任何 API Key，全程在浏览器里完成。

### 路线 A：一键部署（推荐，约 2 分钟）

1. 点上方 **Deploy to Cloudflare** 按钮
2. 登录 Cloudflare，并按提示授权它访问你的 GitHub / GitLab（用于在你账号下建仓库副本）
3. 确认项目名后点部署，Cloudflare 会自动完成：把本仓库**复制一份到你的账号下** → 按 `wrangler.jsonc` 开通一个 KV 命名空间并把 id 回填进你副本的配置 → 用 Workers Builds 构建并部署 Worker
4. 完成后你会得到一个 `https://openai-free-models.<你的子域>.workers.dev` 地址，打开即用

注意第 3 步生成的是**独立副本，不是 GitHub 的 fork** —— 这决定了更新方式不同，见下方「如何更新到新版」，先有个印象即可。

### 路线 B：先 Fork，再手动连接（适合想用 GitHub 同步按钮的人）

1. 点本仓库右上角 **Fork**，把仓库 fork 到你的账号
2. 在 fork 里打开 `wrangler.jsonc`：先去 Cloudflare 控制台 *Storage & Databases → KV* 建一个命名空间，把它的 id 填进 `kv_namespaces` 的对象里（连同 `"id": "…"` 一起补上）
3. Cloudflare 控制台 → *Compute (Workers) → Create → Import a repository*，授权 GitHub 并选中你的 fork，完成导入即自动部署
4. 这条路线以后更新：在 fork 的仓库页点 **Sync fork → Update branch**，Workers Builds 会自动重新部署

### 部署完成后

- **你的副本仓库**在你的 GitHub / GitLab 账号下，名字默认同为 `openai-free-models`；你的 Worker 连着这个副本，副本有新提交就会自动重新部署
- 想确认定时任务已生效：Cloudflare 控制台 → 你的 Worker → *Settings → Triggers*，能看到一条 `17 3 * * *`（每天 UTC 03:17）的 Cron
- 关停数据每天自动同步，你什么都不用做；要改抓取时间、名单数据等，见「自定义」

整个运行在 Cloudflare 免费额度内：页面是静态资源（免费不限量），每天只有 1 次定时抓取。

## 部署排错

**构建在最后一步失败，报 `code: 10072` / "reached the Workers Free limit of 5 cron triggers"**
这是 Cloudflare 免费版的**账号级**上限：整个账号所有 Worker 加起来最多 5 个 Cron 触发器，本项目占 1 个。报错只卡在挂定时任务这一步，**页面本身通常已经部署成功**，先打开你的 workers.dev 地址确认，能打开就只是缺每日自动同步。解决任选其一：

1. **腾一个名额（推荐）**：控制台 → *Workers & Pages*，逐个打开不用的 Worker → *Settings → Triggers*，删掉它的 Cron 触发器；整个不用的测试 Worker 直接删掉更彻底（连触发器一起释放）。然后回到出问题的 Worker → *Settings → Triggers → Add Cron Trigger*，填 `17 3 * * *` 手动挂上，不用重新部署
2. **不要自动同步**：在你副本的 `wrangler.jsonc` 里删掉 `triggers` 整段再部署，页面退化为纯静态种子数据（关停信息不再每日更新）
3. 升级 Workers Paid（$5/月）可把上限提到 1,000，为这个项目没必要

注意：每多部署一个测试实例就多占 1 个名额，测完的实例记得删。

## 如何更新到新版

上游（本仓库）更新了界面、数据或代码后，你的实例**不会自动跟随**，按下面任一方式更新一次即可。先记住两条：

- **不要再点一次部署按钮** —— 那会新建一整套 Worker 和 KV，而不是更新现有的
- 更新只换代码，**不会动你 KV 里已同步的数据**，也不会改你的域名

**方式一：同步 Action（推荐，不用命令行）**
仓库里备好了一个 `Sync from upstream` 工作流模板。GitHub 有个平台限制：工作流文件（`.github/workflows/` 下）只能由仓库主人亲自放进去，任何一键工具都代劳不了，所以需要你**手动放一次，约 1 分钟，只此一次**：

1. 打开**你副本仓库**，点 **Add file → Create new file**
2. 文件名填 `.github/workflows/sync-upstream.yml`（照这个路径打，目录会自动生成）
3. 把副本里 [`docs/sync-upstream.yml`](./docs/sync-upstream.yml) 的内容整段复制粘贴进去，点 **Commit changes**

放好之后，之后每次更新只要：
1. 打开副本的 **Actions** 页 → 选 **Sync from upstream** → **Run workflow**；它也会**每周一自动跑一次**，多数时候你什么都不用点
2. 它会把你的副本快进到上游最新版并推送，Workers Builds 随即自动重新部署，1–2 分钟后线上生效
3. 它有个保护：同步时保留你副本的 `wrangler.jsonc`（里面是部署时回填的、属于你的 KV id，被上游覆盖会导致部署坏掉）；如果上游发版说明里明确提到改了 `wrangler.jsonc`，请把新字段手动合并进来、保留你自己的 id
4. 如果你改过副本里的文件、和上游改动撞车，快进会失败并停下（不会乱推），改用方式二手动合并

**方式二：命令行手动同步**
```bash
git clone <你副本的地址> && cd openai-free-models
git remote add upstream https://github.com/piscon/openai-free-models.git
git pull upstream main   # 有冲突就按提示解决，注意保留 wrangler.jsonc 里的 KV id
git push                 # 推送后 Workers Builds 自动重新部署
```

**方式三：Fork 路线用户**
在 fork 仓库页点 **Sync fork → Update branch** 即可，Builds 自动重新部署。

## 数据怎么保持新鲜（设计要点）

- **关停信息自动同步**：Worker 带一个 Cron 定时任务（默认每天 UTC 03:17），抓取 [OpenAI 官方下架页](https://developers.openai.com/api/docs/deprecations) 并解析关停日期与接班人，写入 KV。下架通知通常提前 3–6 个月发布，每日一次绰绰有余。
- **前台没有任何触发抓取的入口** —— 没有刷新按钮、没有刷新接口、没有参数。这是有意为之：站点是公开的，访客可触发的抓取会把免费额度（KV 免费版仅 1,000 次写/天）打光。抓取代码只存在于定时任务入口，并带三道闸：距上次尝试不足 20 小时直接跳过；条件请求（ETag）+ 内容哈希，没变化不写库；解析结果异常（匹配数过低）时放弃本次更新、保留旧数据。
- **模型名单与额度用种子数据**：名单出自官方帮助文章，但该页对普通程序抓取返回 403，无法可靠机读，所以名单放在 `data/models.json` 里人工核实后更新（页面会显示「核实于」日期）。名单历史上变化很慢；真有变化时改种子文件并重新部署即可，改完记得跑 `npm run seed:sync` 同步前端副本。

## 自定义

- **改抓取频率/时间**：改 `wrangler.jsonc` 里的 `triggers.crons`（cron 表达式，UTC）
- **改 Worker 名字**：改 `wrangler.jsonc` 的 `name`（部署前改；已部署的改名等于新建）
- **改名单数据**：编辑 `data/models.json`（`taskGroups` 五组、`pools` 两池、`verifiedAt` 核实日期），然后 `npm run seed:sync`
- **关掉自动同步**：删掉 `wrangler.jsonc` 的 `triggers` 段即可，页面退化为纯静态种子数据

## 本地开发

```bash
npm install
npm test          # 解析器自带夹具测试
node test/parse.test.mjs /path/to/deprecations.html   # 用真实下架页全文回归
npm run dev       # wrangler dev 本地预览
npm run deploy    # 手动部署（需要你自己的 Cloudflare 账号与 KV id）
```

手动部署时先建 KV：`npx wrangler kv namespace create MODELS_KV`，把得到的 id 填回 `wrangler.jsonc`。

## 数据来源

- 免费名单与额度：[OpenAI 帮助文章 · Sharing feedback, evaluation and fine-tuning data…](https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai)（种子核实于 2026-11-10）
- 关停日期与接班人：[OpenAI 官方 Deprecations 页](https://developers.openai.com/api/docs/deprecations)

## License

代码 MIT（见 [LICENSE](./LICENSE)）。页面中的模型数据为对 OpenAI 官方公开信息的整理。
