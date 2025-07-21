# Workers AI
这是一个基于 Cloudflare Worker 平台的脚本，使用该脚本，你可以方便的在Web端使用AI

## 开源项目免责声明

项目名称：WorkersAI
版本： 1.0.0

### 重要提示：请在使用此软件之前仔细阅读本免责声明。

本软件按“原样”提供，不附带任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和不侵权的保证。在任何情况下，作者或版权持有人均不对因本软件或使用本软件而产生的任何索赔、损害或其他责任负责，无论是在合同诉讼、侵权诉讼或其他方面，也无论是否与本软件或本软件的使用或其他交易有关。

### 具体免责条款：

1、无保证： 本软件在发布时可能包含缺陷、错误或不准确之处。我们不保证本软件的功能将满足您的要求，不保证其运行不会中断或没有错误，也不保证所有缺陷都将被纠正。
2、安全性： 虽然我们已尽力确保本软件的安全性，但我们不保证本软件完全没有安全漏洞。您有责任在使用本软件时采取适当的安全措施，并确保您的环境安全。
3、数据隐私： 本软件可能涉及用户数据（例如聊天历史）的存储。您有责任确保遵守所有适用的数据保护和隐私法律法规（例如 GDPR、CCPA 等）。我们不对因您未能遵守此类法律而造成的任何数据泄露或隐私侵犯负责。
4、第三方服务： 本软件依赖于 Cloudflare Workers AI 和 Cloudflare KV 等第三方服务。这些服务的可用性、性能和定价受其各自服务条款的约束。我们不对这些第三方服务的任何中断、变更或问题负责。
5、密码管理： 本软件包含一个简单的密码认证机制。您有责任设置和维护一个强密码，并确保其安全。我们不对因密码泄露或管理不当而造成的任何未经授权的访问负责。
6、使用风险： 使用本软件的全部风险由您自行承担。您应对因使用本软件而导致的任何数据丢失、系统损坏或其他损失承担全部责任。
7、未来更新： 我们可能会不时发布本软件的更新，但没有义务这样做。我们不保证未来的更新会包含任何特定的功能或修复任何特定的错误。

通过下载、使用或分发本软件，即表示您已阅读、理解并同意本免责声明的所有条款。如果您不同意本免免责声明的任何部分，请勿使用本软件。

# 使用方法
1. 部署到 Cloudflare Workers：
   - 在 Cloudflare Workers 控制台中创建一个新的[Hello World!] Worker。
   - 部署完成后点击右上角编辑代码。
   - 将 [index.js](https://github.com/cqzqybwj/WorkersAI/blob/main/index.js) 的内容粘贴到 Workers 编辑器中。

2. 更改环境变量：
   - 打开你刚创建的项目并找到设置部分。
   - 在`变量和机密`一栏添加新的变量。
   - 类型选择`文本`，变量名称输入`PASSWORD`，值就填入你想设置的密码(一会要靠这个登录)。
   - 回到Cloudflare主页，找到并点击存储和数据库/KV并创建一个KV，名称随意。
   - 回到项目，找到绑定，点击添加绑定，找到并点击`Workers AI`选项，点击右下角添加绑定。
   - 重新在绑定页面选择添加绑定，找到`KV命名空间`，点击右下角添加绑定，在变量名称中输入`CHAT_HISTORY_KV`，KV命名空间就选你刚才创建的那个，添加绑定。

3. 给 Workers绑定自定义域： (可选)
   - 在Workers项目的设置部分，找到 `域和路由`。
   - 点击添加，选择自定义域，输入你想设置的域(必须已经托管到Cloudflare)。
   - 看到`Cloudflare会向[你的域]添加以下DNS记录，并预配新证书来启用 HTTPS。`这串字后，即可点击添加域，等待证书生效，即可使用自定义域名访问Woekers AI。
### Pages不做推荐，所以在此不进行演示。
# 注意事项
 - 上方使用方法中提到的`PASSWORD`,`CHAT_HISTORY_KV`,`AI`均必须填写，缺一不可，若不填则会导致无法使用。
 - 如果你是中国人那么尽量添加自定义域，因为Cloudflare的域名在中国无法使用。
# 原理讲解
1. 整体架构与文件结构
该应用采用单文件部署的 Cloudflare Worker 架构。这意味着整个应用程序（包括前端 HTML、CSS、JavaScript 和后端 API 逻辑）都包含在一个 JavaScript 文件中。

export default (() => { ... })();: 这是 Cloudflare Worker 的标准入口点。它导出一个默认的事件处理器，其中包含 fetch 方法，用于处理所有传入的 HTTP 请求。

HTML 模板: 代码顶部定义了多个字符串常量 (frontendHtmlTemplate_en, passwordPromptHtmlTemplate_en, frontendHtmlTemplate_cn, passwordPromptHtmlTemplate_cn)，这些是应用的前端 HTML 页面。Worker 会根据请求路径和语言设置，动态地返回这些 HTML 内容。

2. 请求处理 (fetch 方法)
fetch(request, env) 方法是 Worker 的核心，它拦截所有对 Worker URL 的请求。

request 对象: 包含传入请求的所有信息，如 URL、请求方法 (GET/POST)、请求头 (headers) 和请求体 (body)。

env 对象: 这是 Cloudflare Workers 运行时提供的一个特殊对象，用于访问绑定的资源（如 KV 命名空间和 AI 绑定）以及环境变量。

URL 解析: const url = new URL(request.url); 用于解析请求的 URL，以便根据路径和查询参数进行路由。

3. 环境变量与绑定
Worker 通过 env 对象访问在 wrangler.toml 中配置的环境变量和绑定：

env.AI_MODEL: 字符串，用于指定默认的 AI 模型 ID。

env.CHAT_HISTORY_KV: KV 命名空间绑定，用于持久化存储聊天数据和会话元数据。

env.AI: AI 绑定，允许 Worker 调用 Cloudflare Workers AI 服务来运行 AI 模型。

env.PASSWORD: 字符串，用于管理员密码认证。

4. 用户认证与会话管理
应用实现了简单的密码认证机制：

SESSION_COOKIE_NAME = 'app_session_valid': 定义了一个用于标记用户会话是否有效的 Cookie 名称。

/authenticate 路由: 当用户在登录页面提交密码时，前端会向此路由发送 POST 请求。

Worker 会检查提交的密码是否与 env.PASSWORD 匹配。

如果匹配，Worker 会设置一个名为 app_session_valid=true 的 HttpOnly Cookie，并重定向用户到聊天页面。这个 Cookie 的 Max-Age=3600 表示它将在一小时后过期。

如果不匹配，返回 401 Unauthorized 错误。

/logout 路由: 用户点击退出按钮时，向此路由发送 POST 请求。

Worker 会设置一个过期时间为 0 的同名 Cookie，从而删除用户的会话 Cookie，强制用户重新登录。

会话检查: 对于所有非登录相关的请求，Worker 会检查 request.headers.get('Cookie')?.includes(${SESSION_COOKIE_NAME}=true) 来验证用户是否已认证。如果未认证，则重定向到登录页面。

5. 多语言支持与路由
应用支持英语和中文两种语言，并通过 URL 路径进行路由：

currentLang 变量: Worker 通过解析 URL 路径的第一个段来确定当前语言（例如 /en/chat 或 /cn/chat）。如果路径中没有指定语言，默认为英语 (en)。

HTML 模板选择: 根据 currentLang 的值，Worker 会选择并返回相应的英文 (_en) 或中文 (_cn) HTML 模板。

前端语言切换: 前端 JavaScript (在 HTML 模板内) 监听语言选择器的变化，并根据选择的语言更新 URL 路径，触发页面重新加载以切换语言。

6. 聊天逻辑 (/api/chat)
这是应用的核心功能，处理用户与 AI 模型的交互：

接收用户输入: 前端通过 POST 请求将用户的问题 (question)、当前会话 ID (sessionId)、选定的 AI 模型 ID (model)、模型类型 (type) 和用户 ID (userId) 发送到 /api/chat。

加载历史: Worker 从 Cloudflare KV 中获取当前会话的聊天历史。

更新历史: 将用户的最新问题添加到聊天历史中。

AI 模型调用 (env.AI.run):

根据前端选择的模型 (modelToUse) 和类型 (modelConfig.type)，调用 env.AI.run() 方法。

文本模型: 对于文本模型，它将最近的聊天历史（最后 5 条消息）作为 messages 参数传递给 AI 模型。

图像模型: 对于图像模型，它将用户的问题作为 prompt 参数传递给 AI 模型。

模型列表: availableModels 数组定义了前端可供选择的 AI 模型及其类型（text 或 image）。

存储 AI 响应: 将 AI 的回答（文本或图片 URL）添加到聊天历史中，并将其更新回 Cloudflare KV。

会话摘要与元数据更新:

Worker 生成一个简短的会话摘要（使用 SUMMARY_MODEL，默认为 @cf/meta/llama-2-7b-chat-int8）。

这个摘要和当前时间戳被存储在 KV 的会话元数据列表中，用于在侧边栏显示历史会话。

会话元数据以 users:${userId}:all_session_metadata 为键存储。

7. 持久化存储 (Cloudflare KV)
Cloudflare KV (Key-Value) 存储用于实现聊天历史的持久化：

CHAT_HISTORY_KV 绑定: Worker 通过 env.CHAT_HISTORY_KV 访问 KV 命名空间。

键结构:

聊天历史: users:${userId}:chat_history:${sessionId}。这种结构确保每个用户的每个聊天会话都有独立的存储空间。

会话元数据: users:${userId}:all_session_metadata。这是一个 JSON 数组，存储了用户所有会话的 ID、摘要和时间戳。

操作:

CHAT_HISTORY_KV.get(key): 从 KV 中读取数据。

CHAT_HISTORY_KV.put(key, value): 将数据写入 KV。

CHAT_HISTORY_KV.delete(key): 从 KV 中删除数据。

用户 ID (userId): 客户端通过 localStorage 存储一个 anonymousUserId，并在每次 API 请求中发送给 Worker。Worker 使用这个 ID 来隔离不同用户的聊天数据。

8. 客户端 JavaScript 逻辑
前端 HTML 模板中嵌入的 JavaScript 处理用户界面和与 Worker 后端的交互：

初始化: 页面加载时，初始化用户 ID、加载模型选择器、加载当前聊天会话历史，并获取所有会话的元数据以填充侧边栏。

displayMessage 函数: 负责在聊天界面显示用户和 AI 的消息，包括处理文本和图片消息。

loadChatSession: 根据会话 ID 从后端加载并显示特定会话的聊天历史。

fetchAllSessionMetadata 和 renderHistoryList: 负责从后端获取所有会话的元数据并在侧边栏渲染聊天历史列表。

sendMessage: 处理用户发送消息的逻辑，包括禁用发送按钮、显示加载指示器、调用后端 API，并处理响应。

startNewChat: 生成新的会话 ID，清空聊天显示，并刷新历史列表。

toggleDarkMode: 切换应用的亮/暗模式，并将偏好存储在 localStorage 中。

deleteChatSession: 触发删除当前聊天会话的后端 API 调用，并在成功后启动新聊天。

模态框 (showModal): 用于显示确认删除等提示信息，替代了浏览器原生的 alert() 和 confirm()。

事件监听: 按钮点击、输入框按键、模型选择器和语言选择器变化等事件都由前端 JavaScript 处理。

9. 关键概念总结
无服务器 (Serverless): Cloudflare Worker 作为无服务器函数运行，无需管理服务器。

边缘计算 (Edge Computing): Worker 运行在全球各地的 Cloudflare 边缘网络上，靠近用户，提供低延迟响应。

无状态 Worker 与外部状态 (KV): Worker 本身是无状态的，它不保留请求之间的内存。所有需要持久化的数据都存储在 Cloudflare KV 中。

API 绑定: Cloudflare Workers 允许将外部服务（如 AI 模型和 KV 存储）作为绑定注入到 Worker 的 env 对象中，简化了集成。

单文件应用: 将所有代码打包到一个文件中有助于简化部署和管理，尤其适用于小型到中型应用。

通过这些机制，该代码构建了一个功能强大且易于部署的 Cloudflare Workers AI 聊天应用。
# 最后
由于本人缺乏经验，前后端做的都不是很好，大家将就这用用，当个乐子玩玩就好。
