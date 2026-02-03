# 健身记录App

一个功能完整的健身记录全栈应用，支持训练记录管理、动作库、日历视图等功能。

## 项目特色

### 后端特点
- **MVC架构设计**：清晰的Models、Views、Controllers分层，实现关注点分离
- **服务层分离**：独立的业务逻辑层（Services），与数据库操作完全解耦
- **模块化设计**：高度模块化的代码结构，易于维护和扩展
- **详细注释**：每个模块、函数都有详细的JSDoc注释
- **RESTful API**：标准的RESTful接口设计

### 前端特点
- **React + Vite**：现代化的前端技术栈，快速开发
- **React Router**：单页应用路由管理
- **Styled Components**：组件化CSS，样式与组件绑定
- **响应式设计**：适配不同屏幕尺寸
- **实时计时器**：训练过程中的实时计时功能

### 功能特性
1. **首页日历**：显示最近7天的训练记录，包括训练部位和强度
2. **开启训练**：一键开始新的训练，或继续未完成的训练
3. **训练页面**：
   - 顶部总计时器
   - 选择动作（从动作库）
   - 设置每组重量和次数
   - 每组完成后标记完成状态
4. **动作库**：内置30+常见健身动作，分类清晰
5. **日历详情**：30天训练日历，点击日期查看详细训练记录
6. **数据持久化**：所有训练数据存储在MongoDB数据库中

## 技术栈

### 后端
- **Node.js**：JavaScript运行时环境
- **Express**：Web应用框架
- **MongoDB**：NoSQL数据库
- **Mongoose**：MongoDB对象建模工具
- **dotenv**：环境变量管理
- **CORS**：跨域资源共享

### 前端
- **React**：UI库
- **Vite**：构建工具
- **React Router**：路由管理
- **Styled Components**：CSS-in-JS解决方案
- **Axios**：HTTP客户端

## 项目结构

```
fitness-tracker/
├── backend/                    # 后端代码
│   ├── config/                 # 配置文件
│   │   └── database.js        # 数据库连接配置
│   ├── controllers/            # 控制器层
│   │   ├── workoutController.js
│   │   └── exerciseController.js
│   ├── models/                 # 数据模型层
│   │   ├── Workout.js         # 训练记录模型
│   │   └── Exercise.js        # 动作库模型
│   ├── routes/                 # 路由配置
│   │   ├── workoutRoutes.js
│   │   └── exerciseRoutes.js
│   ├── services/               # 业务逻辑层
│   │   ├── workoutService.js
│   │   └── exerciseService.js
│   ├── utils/                  # 工具函数
│   │   └── logger.js          # 日志工具
│   ├── .env                   # 环境变量配置
│   ├── package.json
│   └── server.js              # 应用入口
│
├── frontend/                   # 前端代码
│   ├── public/                # 静态资源
│   ├── src/
│   │   ├── components/        # React组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API服务
│   │   │   └── api.js         # API接口封装
│   │   ├── utils/             # 工具函数
│   │   ├── App.jsx            # 主应用组件
│   │   ├── index.css          # 全局样式
│   │   └── main.jsx           # 应用入口
│   ├── index.html
│   ├── package.json
│   └── vite.config.js         # Vite配置
│
└── README.md                  # 项目说明文档
```

## 安装步骤

### 环境要求
- Node.js 16.0或更高版本
- MongoDB 4.0或更高版本
- npm或yarn包管理器

### 后端安装

1. **进入后端目录**
   ```bash
   cd backend
   ```

2. **安装依赖包**
   ```bash
   npm install
   ```

3. **配置环境变量**
   编辑 `.env` 文件：
   ```env
   # MongoDB数据库连接URI
   # 格式: mongodb://用户名:密码@主机:端口/数据库名
   # 本地开发使用: mongodb://localhost:27017/fitness-tracker
   MONGODB_URI=mongodb://localhost:27017/fitness-tracker

   # 服务器端口
   PORT=5000

   # Node环境
   NODE_ENV=development
   ```

4. **启动MongoDB服务**
   确保MongoDB服务已经启动：
   ```bash
   mongod
   ```

5. **启动后端服务器**
   ```bash
   npm start
   # 或使用nodemon进行开发
   npm run dev
   ```

6. **初始化动作库（可选）**
   启动后可以通过以下API初始化默认动作：
   ```bash
   curl -X POST http://localhost:5000/api/exercises/initialize
   ```

### 前端安装

1. **进入前端目录**
   ```bash
   cd frontend
   ```

2. **安装依赖包**
   ```bash
   npm install
   ```

3. **启动前端开发服务器**
   ```bash
   npm run dev
   ```

4. **在浏览器中访问**
   打开浏览器访问：http://localhost:5173

## API接口文档

### 训练记录API

#### 创建训练记录
- **URL**: `POST /api/workouts`
- **功能**: 创建新的训练记录
- **返回值**: 创建的训练记录对象

#### 获取训练记录列表
- **URL**: `GET /api/workouts`
- **功能**: 获取所有训练记录
- **查询参数**: 
  - `limit`: 返回数量限制（默认50）
  - `offset`: 偏移量（用于分页）
- **返回值**: 训练记录列表

#### 获取最近训练记录
- **URL**: `GET /api/workouts/recent`
- **功能**: 获取最近N天的训练记录
- **查询参数**: `days`（默认30天）
- **返回值**: 训练记录列表

#### 获取最近7天训练简要信息
- **URL**: `GET /api/workouts/recent-7-days-brief`
- **功能**: 获取最近7天的训练简要信息（用于首页日历）
- **返回值**: 包含日期、训练部位和强度的简要信息列表

#### 获取指定日期的训练记录
- **URL**: `GET /api/workouts/date/:date`
- **功能**: 获取某一天的训练记录
- **参数**: `date` - 日期（YYYY-MM-DD格式）
- **返回值**: 训练记录对象或null

#### 完成训练记录中的某组
- **URL**: `POST /api/workouts/:id/complete-set`
- **功能**: 标记某组训练为已完成
- **参数**: 
  - `id` - 训练记录ID
- **请求体**: 
  - `exerciseIndex` - 动作索引
  - `setIndex` - 组数索引
- **返回值**: 更新后的训练记录

#### 完成训练
- **URL**: `POST /api/workouts/:id/complete`
- **功能**: 完成整个训练
- **参数**: `id` - 训练记录ID
- **返回值**: 完成后的训练记录（包含计算出的强度和时长）

### 动作库API

#### 获取所有动作
- **URL**: `GET /api/exercises`
- **功能**: 获取动作库中的所有动作
- **查询参数**: 
  - `bodyPart`: 按部位筛选
  - `difficulty`: 按难度筛选
  - `limit`: 返回数量限制
- **返回值**: 动作列表

#### 按部位获取动作
- **URL**: `GET /api/exercises/bodypart/:bodyPart`
- **功能**: 获取指定部位的训练动作
- **参数**: `bodyPart` - 训练部位（胸、背、肩、腿、手臂、核心、全身）
- **返回值**: 动作列表

#### 搜索动作
- **URL**: `GET /api/exercises/search`
- **功能**: 按名称搜索动作
- **查询参数**: `keyword` - 搜索关键词
- **返回值**: 匹配的动作列表

#### 创建默认动作
- **URL**: `POST /api/exercises/initialize`
- **功能**: 批量创建默认动作（初始化使用）
- **返回值**: 创建的动作列表

## 数据库设计

### Workout（训练记录）Schema

```javascript
{
  date: Date,              // 训练日期
  startTime: Date,         // 训练开始时间
  endTime: Date,           // 训练结束时间（完成后记录）
  duration: Number,        // 训练时长（分钟）
  exercises: [{
    exercise: ObjectId,    // 动作ID（引用Exercise）
    sets: [{
      setNumber: Number,   // 第几组
      weight: Number,      // 重量（kg）
      reps: Number,        // 次数
      completed: Boolean,  // 是否完成
      completedAt: Date    // 完成时间
    }],
    notes: String          // 动作备注
  }],
  intensity: Number,       // 训练强度（0-10）
  notes: String,           // 训练备注
  status: String          // 训练状态：进行中/已完成
}
```

### Exercise（动作库）Schema

```javascript
{
  name: String,            // 动作名称
  bodyPart: String,        // 训练部位
  difficulty: String,      // 难度等级
  description: String,     // 动作描述
  recommendedSets: Number, // 推荐组数
  recommendedReps: Number, // 推荐次数
  isDefault: Boolean,      // 是否系统默认
  createdAt: Date         // 创建时间
}
```

## 使用说明

### 首次使用

1. **启动MongoDB服务**
   ```bash
   mongod
   ```

2. **启动后端服务器**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **初始化动作库**
   ```bash
   curl -X POST http://localhost:5000/api/exercises/initialize
   ```

4. **启动前端**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问：http://localhost:5173

### 功能使用

1. **开始训练**
   - 点击"开启训练"按钮创建新的训练记录
   - 如果有未完成的训练，可以选择继续或新建

2. **添加动作**
   - 从下拉菜单选择训练动作
   - 点击"添加动作"将其加入训练

3. **记录组数**
   - 为每个动作添加组数（重量和次数）
   - 点击"添加组数"保存该组信息

4. **完成组数**
   - 每组完成后点击"完成"按钮
   - 系统会记录完成时间

5. **完成训练**
   - 所有动作完成后点击"完成训练"
   - 系统自动计算训练强度和时长

6. **查看历史**
   - 首页显示最近7天训练概况
   - 点击日历页面查看30天训练历史
   - 点击具体日期查看训练详情

## 扩展功能建议

1. **用户认证系统**：添加用户注册、登录功能
2. **数据统计图表**：使用图表库展示训练数据趋势
3. **训练计划**：支持创建和保存训练计划
4. **图片上传**：为动作添加演示图片或视频
5. **社交功能**：分享训练成果到社交媒体
6. **移动端优化**：开发PWA应用，支持离线使用
7. **数据导出**：支持导出训练数据为Excel或PDF

## 开发说明

### 后端开发
- 所有业务逻辑都在 `services` 目录中
- 控制器只负责处理HTTP请求和响应
- 使用JSDoc规范注释所有函数和类
- 使用logger记录重要操作和错误

### 前端开发
- 组件化开发，每个功能独立成组件
- 使用styled-components管理样式
- API调用统一在 `services/api.js` 中管理
- 保持代码规范和一致性

## 常见问题

### MongoDB连接失败
确保MongoDB服务已启动，并检查 `.env` 文件中的连接字符串是否正确。

### 跨域问题
后端已配置CORS，允许前端访问。如果修改了前端端口，需要在 `.env` 中更新。

### 动作库为空
首次运行时需要初始化动作库：
```bash
curl -X POST http://localhost:5000/api/exercises/initialize
```

### 前端无法访问后端API
确保后端服务器已启动，并检查前端 `vite.config.js` 中的代理配置。

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交Issue。

---

**注意**：这是一个完整的全栈项目示例，代码注释详细，结构清晰，适合学习和二次开发。项目实现了健身记录的核心功能，包括训练记录管理、动作库、日历视图等，并遵循MVC架构设计原则。
