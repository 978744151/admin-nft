# MSInterface Admin Dashboard

这是一个基于React和Ant Design的管理后台，用于管理MSInterface API的NFT和评论等数据。

## 功能特性

- 用户认证与登录
- NFT管理（列表、创建、编辑、删除）
- NFT版本管理（寄售、取消寄售）
- 评论管理（查看、搜索、删除）
- 响应式设计，适配不同设备

## 技术栈

- React 18
- React Router v6
- Ant Design 5
- Axios
- Vite（构建工具）

## 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

## 安装与运行

1. 安装依赖

```bash
cd admin-dashboard
npm install
```

2. 配置环境变量

项目使用 `.env` 文件设置API地址:

```
VITE_API_URL=http://localhost:5000
```

3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动并自动打开浏览器

## 构建生产版本

```bash
npm run build
```

构建完成后，可以使用以下命令预览生产版本：

```bash
npm run preview
```

或将 `dist` 目录的内容部署到静态文件服务器。

## 项目结构

```
admin-dashboard/
├── public/            # 静态公共资源
├── src/               # 源代码
│   ├── components/    # 共用组件
│   ├── layouts/       # 布局组件
│   ├── pages/         # 页面组件
│   │   ├── NFT/       # NFT相关页面
│   │   ├── Comments/  # 评论相关页面
│   ├── services/      # API服务
│   ├── utils/         # 工具函数
│   ├── App.js         # 应用入口
│   └── index.js       # 项目入口
├── index.html         # HTML入口文件
├── vite.config.js     # Vite配置文件
├── package.json       # 项目配置
└── README.md          # 项目说明
```

## 使用说明

### 登录

使用管理员账号登录系统。

### NFT管理

- NFT列表：查看所有NFT，可按分类筛选
- 创建NFT：填写表单创建新的NFT
- 编辑NFT：修改NFT信息及管理NFT版本
- 删除NFT：删除不需要的NFT

### 评论管理

- 评论列表：选择博客后查看其所有评论
- 回复管理：展开评论可查看并管理回复
- 删除评论：删除不当的评论

## 接口说明

本管理后台通过API与后端通信，主要使用以下接口：

- 用户认证：POST /auth/login
- NFT相关：GET/POST/PUT/DELETE /nfts
- 评论相关：GET/POST/DELETE /comments

详细API文档请参考Swagger接口文档。 