🧩 本 Fork 的安装与使用

> 个人定制版：无需注册 readfrog 账号或使用官方「内置 AI」，所有 AI 功能（网页翻译、划词翻译、输入翻译、YouTube / X / Netflix 字幕翻译、查词、句子分析、改写、笔记建议）默认直连**你自己的 DeepSeek API**（`deepseek-v4-flash`），请求全部由浏览器直接发出，无中间服务器。

### 1. 前置要求

- [Node.js](https://nodejs.org/) 24+
- [pnpm](https://pnpm.io/)（安装：`npm i -g pnpm`）

### 2. 配置 API key

在仓库根目录创建 `.env`（已被 `.gitignore` 忽略，不会进入 git）：

```env
WXT_DEEPSEEK_API_KEY=sk-你的DeepSeek密钥
WXT_SKIP_ENV_VALIDATION=true
```

之后想换 key，改这一行再重新 `pnpm build` 即可。

###### 相对的其他模型也是如法炮制

### 3. 安装依赖

```bash
pnpm install
```

### 4. 构建

```bash
pnpm build          # Chrome，产物在 .output/chrome-mv3
pnpm build:edge     # Edge
pnpm build:firefox  # Firefox，产物在 .output/firefox-mv3
```

### 5. 加载到浏览器

**Chrome / Edge**

1. 打开 `chrome://extensions`（Edge 为 `edge://extensions`）
2. 打开右上角「开发者模式」
3. 点「加载已解压的扩展程序」，选择 `.output/chrome-mv3` 目录

**Firefox**

1. 打开 `about:debugging#/runtime/this-firefox`
2. 点「临时载入附加组件…」，选择 `.output/firefox-mv3/manifest.json`

### 开发模式（改代码热更新）

```bash
pnpm dev   # 监听改动自动重建，加载 .output/chrome-mv3-dev 目录
```

开发模式下 `.env` 的 key 同样生效。

### 默认 provider

| 功能                                      | 默认 provider                |
| ----------------------------------------- | ---------------------------- |
| 网页翻译 / 划词翻译 / 输入翻译 / 字幕翻译 | DeepSeek `deepseek-v4-flash` |
| 查词 / 句子分析 / 改写 / 笔记建议         | DeepSeek `deepseek-v4-flash` |

全部默认值可在扩展「设置 → API Providers」中修改；也可切换到 Ollama、LM Studio、vLLM 等任意 OpenAI 兼容的**本地模型**（provider 类型选 `ollama` 或 `openai-compatible`，baseURL 填 `http://127.0.0.1:11434/`、`http://localhost:1234/v1` 等）。

### ⚠️ 注意

- 构建产物**内含你的 API key**（本 fork 刻意如此），请勿把 `.output` 目录或打好的 zip 分享、发布；
- `.env` 不会进入 git，但也请勿把 key 提交到任何公开仓库；
- `pnpm test` 有 26 个失败是上游仓库自带的问题（i18n 模板断言与 Google 网络测试），与本 fork 的改动无关。
