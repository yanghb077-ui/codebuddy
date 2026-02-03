/**
 * 数据库配置模块
 * 负责MongoDB数据库的连接和管理
 * @module config/database
 */

const mongoose = require('mongoose');
require('dotenv').config();

/**
 * 数据库连接类
 * 实现数据库连接的单一实例模式，确保应用中只有一个数据库连接
 */
class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * 连接到MongoDB数据库
   * @async
   * @returns {Promise<Object>} 返回数据库连接实例
   * @throws {Error} 当连接失败时抛出错误
   */
  async connect() {
    if (this.isConnected && this.connection) {
      console.log('数据库已连接，使用现有连接');
      return this.connection;
    }

    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker';
      
      // 配置选项
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // 连接池最大连接数
        serverSelectionTimeoutMS: 5000, // 服务器选择超时时间
        socketTimeoutMS: 45000, // socket超时时间
      };

      this.connection = await mongoose.connect(mongoURI, options);
      this.isConnected = true;

      console.log('MongoDB数据库连接成功');
      return this.connection;
    } catch (error) {
      console.error('MongoDB数据库连接失败:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 断开数据库连接
   * @async
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this.isConnected) {
      console.log('数据库未连接');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.connection = null;
      console.log('MongoDB数据库已断开连接');
    } catch (error) {
      console.error('断开数据库连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取数据库连接状态
   * @returns {boolean} 返回是否已连接
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// 创建单一实例
const db = new Database();

module.exports = db;
