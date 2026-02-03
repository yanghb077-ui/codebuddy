/**
 * 应用主入口文件
 * 负责启动Express服务器、配置中间件、连接数据库
 * @module server
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./config/database');
const workoutRoutes = require('./routes/workoutRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const logger = require('./utils/logger');

/**
 * 健身记录应用主类
 * 封装服务器初始化和启动逻辑
 */
class FitnessApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * 配置Express中间件
   * 包括CORS、请求解析、日志记录等
   */
  setupMiddleware() {
    // CORS配置，允许前端跨域请求（支持局域网访问）
    this.app.use(cors({
      origin: function(origin, callback) {
        // 允许无origin的请求（如Postman）
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173'
        ];
        // 允许局域网IP访问（192.168.x.x 和 10.x.x.x）
        const lanPattern192 = /^http:\/\/192\.168\.\d+\.\d+:5173$/;
        const lanPattern10 = /^http:\/\/10\.\d+\.\d+\.\d+:5173$/;
        
        if (allowedOrigins.includes(origin) || 
            lanPattern192.test(origin) || 
            lanPattern10.test(origin)) {
          callback(null, true);
        } else {
          console.log('[CORS] 拒绝跨域请求:', origin);
          callback(new Error('CORS policy violation'));
        }
      },
      credentials: true
    }));

    // 解析JSON请求体
    this.app.use(bodyParser.json());

    // 解析URL编码的请求体
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // 请求日志中间件
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  /**
   * 配置应用路由
   * 将URL路径映射到对应的控制器
   */
  setupRoutes() {
    // 健康检查路由
    this.app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: '服务器运行正常',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // API路由
    this.app.use('/api/workouts', workoutRoutes);
    this.app.use('/api/exercises', exerciseRoutes);

    // 根路由
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: '健身记录API',
        version: '1.0.0',
        endpoints: {
          workouts: '/api/workouts',
          exercises: '/api/exercises',
          health: '/api/health'
        }
      });
    });
  }

  /**
   * 配置错误处理中间件
   * 统一处理应用中的错误
   */
  setupErrorHandling() {
    // 404错误处理
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: '接口不存在'
      });
    });

    // 全局错误处理
    this.app.use((err, req, res, next) => {
      logger.error('服务器错误', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });

      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    });
  }

  /**
   * 连接数据库并启动服务器
   * @async
   * @returns {Promise<void>}
   */
  async start() {
    try {
      // 连接MongoDB数据库
      await db.connect();
      
      // 启动HTTP服务器（绑定到0.0.0.0以支持局域网访问）
      this.server = this.app.listen(this.port, '0.0.0.0', () => {
        logger.info(`服务器启动成功`, {
          port: this.port,
          host: '0.0.0.0',
          env: process.env.NODE_ENV || 'development'
        });
      });

      // 处理服务器错误
      this.server.on('error', (error) => {
        logger.error('服务器错误', { error: error.message });
        process.exit(1);
      });

    } catch (error) {
      logger.error('应用启动失败', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * 优雅关闭应用
   * @async
   * @returns {Promise<void>}
   */
  async stop() {
    logger.info('正在关闭应用...');
    
    if (this.server) {
      this.server.close(() => {
        logger.info('HTTP服务器已关闭');
      });
    }
    
    await db.disconnect();
    logger.info('应用已关闭');
  }
}

// 创建应用实例
const app = new FitnessApp();

// 启动应用
app.start();

// 处理进程信号，实现优雅关闭
process.on('SIGINT', async () => {
  logger.info('接收到SIGINT信号，正在关闭应用...');
  await app.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('接收到SIGTERM信号，正在关闭应用...');
  await app.stop();
  process.exit(0);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝', { reason, promise });
  process.exit(1);
});

module.exports = app;
