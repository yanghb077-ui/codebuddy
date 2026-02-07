/**
 * API服务模块
 * 封装所有与后端API的交互逻辑，包括训练记录和动作库相关接口
 * @module services/api
 */

import axios from 'axios';

// 创建axios实例，配置基础URL和超时时间
const api = axios.create({
  baseURL: '/api', // 使用Vite代理转发到后端
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
});

// 获取当前用户名
const getUsername = () => localStorage.getItem('fitness_username');

// 请求拦截器，自动添加username参数
api.interceptors.request.use(
  (config) => {
    const username = getUsername();
    
    // 自动在请求中添加username参数
    if (username) {
      const method = config.method?.toLowerCase();
      if (method === 'get' || method === 'delete') {
        config.params = { ...(config.params || {}), username };
      } else if (method === 'post' || method === 'put' || method === 'patch') {
        config.data = { ...(config.data || {}), username };
      }
    }
    
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.params || config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器，统一处理错误
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message);
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('请求参数错误:', data.message);
          break;
        case 404:
          console.error('资源未找到:', data.message);
          break;
        case 500:
          console.error('服务器错误:', data.message);
          break;
        default:
          console.error('请求失败:', data.message);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误：无法连接到服务器');
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * 训练记录相关API
 */
export const workoutAPI = {
  /**
   * 创建新的训练记录
   * @param {Object} workoutData - 训练数据
   * @returns {Promise<Object>} 创建的训练记录
   */
  createWorkout: (workoutData) => {
    return api.post('/workouts', workoutData).then(res => res.data);
  },

  /**
   * 获取所有训练记录
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 训练记录列表
   */
  getAllWorkouts: (options = {}) => {
    return api.get('/workouts', { params: options }).then(res => res.data);
  },

  /**
   * 获取单个训练记录
   * @param {string} id - 训练记录ID
   * @returns {Promise<Object>} 训练记录
   */
  getWorkoutById: (id) => {
    return api.get(`/workouts/${id}`).then(res => res.data);
  },

  /**
   * 获取最近N天的训练记录
   * @param {number} days - 天数
   * @returns {Promise<Object>} 训练记录列表
   */
  getRecentWorkouts: (days = 30) => {
    return api.get('/workouts/recent', { params: { days } }).then(res => res.data);
  },

  /**
   * 获取最近7天的训练简要信息
   * @returns {Promise<Object>} 简要信息列表
   */
  getRecent7DaysBrief: () => {
    return api.get('/workouts/recent-7-days-brief').then(res => res.data);
  },

  /**
   * 获取某一天的训练记录
   * @param {Date|string} date - 日期
   * @returns {Promise<Object>} 训练记录
   */
  getWorkoutByDate: (date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return api.get(`/workouts/date/${dateStr}`).then(res => res.data);
  },

  /**
   * 更新训练记录
   * @param {string} id - 训练记录ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的训练记录
   */
  updateWorkout: (id, updateData) => {
    return api.put(`/workouts/${id}`, updateData).then(res => res.data);
  },

  /**
   * 删除训练记录
   * @param {string} id - 训练记录ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteWorkout: (id) => {
    return api.delete(`/workouts/${id}`).then(res => res.data);
  },

  /**
   * 向训练记录中添加动作
   * @param {string} id - 训练记录ID
   * @param {string} exerciseId - 动作ID
   * @returns {Promise<Object>} 更新后的训练记录
   */
  addExerciseToWorkout: (id, exerciseId) => {
    return api.post(`/workouts/${id}/exercises`, { exerciseId }).then(res => res.data);
  },

  /**
   * 向训练记录中的动作添加组数
   * @param {string} id - 训练记录ID
   * @param {number} exerciseIndex - 动作索引
   * @param {number} weight - 重量
   * @param {number} reps - 次数
   * @returns {Promise<Object>} 更新后的训练记录
   */
  addSetToWorkout: (id, exerciseIndex, weight, reps) => {
    return api.post(`/workouts/${id}/sets`, { exerciseIndex, weight, reps }).then(res => res.data);
  },

  /**
   * 完成训练记录中的某组
   * @param {string} id - 训练记录ID
   * @param {number} exerciseIndex - 动作索引
   * @param {number} setIndex - 组数索引
   * @returns {Promise<Object>} 更新后的训练记录
   */
  completeSetInWorkout: (id, exerciseIndex, setIndex) => {
    return api.post(`/workouts/${id}/complete-set`, { exerciseIndex, setIndex }).then(res => res.data);
  },

  /**
   * 删除训练记录中的某组
   * @param {string} id - 训练记录ID
   * @param {number} exerciseIndex - 动作索引
   * @param {number} setIndex - 组数索引
   * @returns {Promise<Object>} 更新后的训练记录
   */
  deleteSetFromWorkout: (id, exerciseIndex, setIndex) => {
    return api.delete(`/workouts/${id}/sets`, { params: { exerciseIndex, setIndex } }).then(res => res.data);
  },

  /**
   * 完成训练
   * @param {string} id - 训练记录ID
   * @returns {Promise<Object>} 完成后的训练记录
   */
  completeWorkout: (id) => {
    return api.post(`/workouts/${id}/complete`).then(res => res.data);
  },

  /**
   * 获取训练统计数据
   * @param {number} days - 统计天数
   * @returns {Promise<Object>} 统计数据
   */
  getWorkoutStats: (days = 30) => {
    return api.get('/workouts/stats', { params: { days } }).then(res => res.data);
  },
  /**
   * 获取动作历史详情与数据分析
   * @param {string} exerciseId - 动作ID
   * @param {number} days - 查询天数范围
   * @returns {Promise<Object>} 历史详情与分析
   */
  getExerciseHistory: (exerciseId, days = 180) => {
    return api.get(`/workouts/exercise-history/${exerciseId}`, { params: { days } }).then(res => res.data);
  }
};

/**
 * 动作库相关API
 */
export const exerciseAPI = {
  /**
   * 创建新动作
   * @param {Object} exerciseData - 动作数据
   * @returns {Promise<Object>} 创建的动作
   */
  createExercise: (exerciseData) => {
    return api.post('/exercises', exerciseData).then(res => res.data);
  },

  /**
   * 获取所有动作
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 动作列表
   */
  getAllExercises: (options = {}) => {
    return api.get('/exercises', { params: options }).then(res => res.data);
  },

  /**
   * 获取单个动作
   * @param {string} id - 动作ID
   * @returns {Promise<Object>} 动作信息
   */
  getExerciseById: (id) => {
    return api.get(`/exercises/${id}`).then(res => res.data);
  },

  /**
   * 更新动作
   * @param {string} id - 动作ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的动作
   */
  updateExercise: (id, updateData) => {
    return api.put(`/exercises/${id}`, updateData).then(res => res.data);
  },

  /**
   * 删除动作
   * @param {string} id - 动作ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteExercise: (id) => {
    return api.delete(`/exercises/${id}`).then(res => res.data);
  },

  /**
   * 按部位获取动作
   * @param {string} bodyPart - 训练部位
   * @returns {Promise<Object>} 动作列表
   */
  getExercisesByBodyPart: (bodyPart) => {
    return api.get(`/exercises/bodypart/${bodyPart}`).then(res => res.data);
  },

  /**
   * 按难度获取动作
   * @param {string} difficulty - 难度等级
   * @returns {Promise<Object>} 动作列表
   */
  getExercisesByDifficulty: (difficulty) => {
    return api.get(`/exercises/difficulty/${difficulty}`).then(res => res.data);
  },

  /**
   * 搜索动作
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<Object>} 匹配的动作列表
   */
  searchExercises: (keyword) => {
    return api.get('/exercises/search', { params: { keyword } }).then(res => res.data);
  },

  /**
   * 获取动作统计信息
   * @returns {Promise<Object>} 统计数据
   */
  getExerciseStats: () => {
    return api.get('/exercises/stats').then(res => res.data);
  },

  /**
   * 创建默认动作（初始化使用）
   * @returns {Promise<Object>} 创建的动作列表
   */
  createDefaultExercises: () => {
    return api.post('/exercises/initialize').then(res => res.data);
  }
};

export default {
  workoutAPI,
  exerciseAPI,
  api
};
