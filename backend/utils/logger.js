/**
 * 日志记录工具
 * 提供统一的日志记录接口，便于调试和监控
 * @module utils/logger
 */

/**
 * 日志记录器类
 * 支持不同级别的日志记录：info、warn、error、debug
 */
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * 格式化时间戳
   * @private
   * @returns {string} 格式化的时间字符串
   */
  _getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * 格式化日志消息
   * @private
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   * @returns {string} 格式化后的日志字符串
   */
  _formatMessage(level, message, meta = {}) {
    const timestamp = this._getTimestamp();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`;
  }

  /**
   * 记录信息日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  info(message, meta = {}) {
    const logMessage = this._formatMessage('info', message, meta);
    console.log(logMessage);
  }

  /**
   * 记录警告日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  warn(message, meta = {}) {
    const logMessage = this._formatMessage('warn', message, meta);
    console.warn(logMessage);
  }

  /**
   * 记录错误日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  error(message, meta = {}) {
    const logMessage = this._formatMessage('error', message, meta);
    console.error(logMessage);
  }

  /**
   * 记录调试日志（仅在开发环境显示）
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  debug(message, meta = {}) {
    if (!this.isProduction) {
      const logMessage = this._formatMessage('debug', message, meta);
      console.debug(logMessage);
    }
  }
}

module.exports = new Logger();
