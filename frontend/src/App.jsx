import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { workoutAPI, exerciseAPI } from './services/api';
import UserLogin from './components/UserLogin';

// 样式组件
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Header = styled.header`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  color: #667eea;
  margin: 0;
  font-size: 28px;
`;

const Nav = styled.nav`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: center;
`;

const NavLink = styled(Link)`
  padding: 10px 20px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #764ba2;
    transform: translateY(-2px);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: #f0f2f5;
  border-radius: 20px;
  font-size: 14px;
`;

const LogoutButton = styled.button`
  padding: 4px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ff7875;
  }
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

// 首页组件
function Home({ username }) {
  const [workoutBriefs, setWorkoutBriefs] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentWorkouts();
    checkCurrentWorkout();
  }, [username]);

  const loadRecentWorkouts = async () => {
    try {
      const response = await workoutAPI.getRecent7DaysBrief();
      if (response.success) {
        setWorkoutBriefs(response.data);
      }
    } catch (error) {
      console.error('加载训练记录失败:', error);
    }
  };

  const checkCurrentWorkout = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await workoutAPI.getWorkoutByDate(today);
      if (response.success && response.data) {
        setCurrentWorkout(response.data);
      }
    } catch (error) {
      // 没有今天的训练记录是正常的
    }
  };

  const startNewWorkout = async () => {
    try {
      const response = await workoutAPI.createWorkout();
      if (response.success) {
        navigate(`/workout/${response.data._id}`);
      } else {
        alert('创建训练失败: ' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('创建训练失败:', error);
      alert('创建训练失败: ' + (error.response?.data?.message || error.message || '请检查网络连接'));
    }
  };

  const getIntensityText = (intensity) => {
    if (intensity >= 7) return '高强度';
    if (intensity >= 4) return '中强度';
    return '低强度';
  };

  const getIntensityColor = (intensity) => {
    if (intensity >= 7) return '#f5222d';
    if (intensity >= 4) return '#faad14';
    return '#52c41a';
  };

  return (
    <div>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '20px' }}>最近7天训练记录</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          {workoutBriefs.length === 0 ? (
            <p style={{ color: '#666' }}>暂无训练记录</p>
          ) : (
            workoutBriefs.map((brief, index) => {
              const date = new Date(brief.date);
              const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
              
              return (
                <div 
                  key={index}
                  style={{ 
                    background: '#f5f5f5', 
                    padding: '15px', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate(`/calendar/${date.toISOString().split('T')[0]}`)}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <strong>{dateStr}</strong>
                    {brief.intensity && (
                      <span style={{ 
                        color: getIntensityColor(brief.intensity),
                        fontSize: '12px'
                      }}>
                        {getIntensityText(brief.intensity)}
                      </span>
                    )}
                  </div>
                  {brief.bodyParts.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '4px' 
                    }}>
                      {brief.bodyParts.map((part, i) => (
                        <span 
                          key={i}
                          style={{ 
                            background: '#1890ff', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontSize: '10px'
                          }}
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '30px', 
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '20px' }}>开始训练</h2>
        {currentWorkout && currentWorkout.status === '进行中' ? (
          <div>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              您有一个未完成的训练，创建于 {new Date(currentWorkout.startTime).toLocaleTimeString()}
            </p>
            <button 
              onClick={() => navigate(`/workout/${currentWorkout._id}`)}
              style={{ 
                padding: '12px 30px', 
                background: '#1890ff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              继续训练
            </button>
            <button 
              onClick={startNewWorkout}
              style={{ 
                padding: '12px 30px', 
                background: '#52c41a', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              新建训练
            </button>
          </div>
        ) : (
          <button 
            onClick={startNewWorkout}
            style={{ 
              padding: '15px 40px', 
              background: '#52c41a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            开启训练
          </button>
        )}
      </div>
    </div>
  );
}

// 训练页面组件
function Workout({ username }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    loadWorkout();
    loadExercises();
    
    // 启动计时器
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [id, username]);

  const loadWorkout = async () => {
    try {
      const response = await workoutAPI.getWorkoutById(id);
      if (response.success) {
        setWorkout(response.data);
      }
    } catch (error) {
      console.error('加载训练失败:', error);
    }
  };

  const loadExercises = async () => {
    try {
      const response = await exerciseAPI.getAllExercises();
      if (response.success) {
        setExercises(response.data);
      }
    } catch (error) {
      console.error('加载动作库失败:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = async () => {
    if (!selectedExercise) {
      alert('请选择动作');
      return;
    }

    try {
      const response = await workoutAPI.addExerciseToWorkout(id, selectedExercise);
      if (response.success) {
        setWorkout(response.data);
        setSelectedExercise('');
      } else {
        alert('添加动作失败: ' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('添加动作失败:', error);
      alert('添加动作失败: ' + (error.response?.data?.message || error.message || '请检查网络连接'));
    }
  };

  const addSet = async (exerciseIndex) => {
    if (!weight || !reps) {
      alert('请填写重量和次数');
      return;
    }

    try {
      const response = await workoutAPI.addSetToWorkout(id, exerciseIndex, parseFloat(weight), parseInt(reps));
      if (response.success) {
        setWorkout(response.data);
        setWeight('');
        setReps('');
      }
    } catch (error) {
      console.error('添加组数失败:', error);
    }
  };

  const completeSet = async (exerciseIndex, setIndex) => {
    try {
      const response = await workoutAPI.completeSetInWorkout(id, exerciseIndex, setIndex);
      if (response.success) {
        setWorkout(response.data);
      }
    } catch (error) {
      console.error('完成组数失败:', error);
    }
  };

  const completeWorkout = async () => {
    if (!window.confirm('确定要完成训练吗？')) {
      return;
    }

    try {
      const response = await workoutAPI.completeWorkout(id);
      if (response.success) {
        alert('训练完成！');
        navigate('/');
      }
    } catch (error) {
      console.error('完成训练失败:', error);
    }
  };

  if (!workout) {
    return <div style={{ color: 'white', textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        background: '#f0f2f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>训练时间</h2>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: '#1890ff',
          fontFamily: 'monospace'
        }}>
          {formatTime(timer)}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>选择动作</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <select 
            value={selectedExercise} 
            onChange={(e) => setSelectedExercise(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: '1px solid #d9d9d9', 
              borderRadius: '4px'
            }}
          >
            <option value="">选择动作...</option>
            {exercises.map(exercise => (
              <option key={exercise._id} value={exercise._id}>
                {exercise.name} ({exercise.bodyPart} - {exercise.difficulty})
              </option>
            ))}
          </select>
          <button 
            onClick={addExercise}
            style={{ 
              padding: '10px 20px', 
              background: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            添加动作
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '15px' }}>训练动作</h3>
        {workout.exercises.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>暂无动作，请添加训练动作</p>
        ) : (
          workout.exercises.map((exerciseLog, exerciseIndex) => (
            <div 
              key={exerciseIndex}
              style={{ 
                border: '1px solid #d9d9d9', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '15px',
                background: '#fafafa'
              }}
            >
              <h4 style={{ marginBottom: '10px' }}>
                {exerciseLog.exercise?.name || '未知动作'}
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginLeft: '10px' 
                }}>
                  ({exerciseLog.exercise?.bodyPart} - {exerciseLog.exercise?.difficulty})
                </span>
              </h4>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="number"
                    placeholder="重量 (kg)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="次数"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    onClick={() => addSet(exerciseIndex)}
                    style={{ 
                      padding: '8px 16px', 
                      background: '#52c41a', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    添加组数
                  </button>
                </div>
              </div>

              {exerciseLog.sets.length > 0 && (
                <div>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px' }}>组数记录：</h5>
                  {exerciseLog.sets.map((set, setIndex) => (
                    <div 
                      key={setIndex}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        background: set.completed ? '#f6ffed' : '#fff',
                        border: `1px solid ${set.completed ? '#b7eb8f' : '#d9d9d9'}`,
                        borderRadius: '4px',
                        marginBottom: '5px'
                      }}
                    >
                      <span>
                        第{set.setNumber}组: {set.weight}kg × {set.reps}次
                        {set.completed && <span style={{ color: '#52c41a', marginLeft: '8px' }}>✓ 已完成</span>}
                      </span>
                      {!set.completed && (
                        <button
                          onClick={() => completeSet(exerciseIndex, setIndex)}
                          style={{ 
                            padding: '4px 12px', 
                            background: '#1890ff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          完成
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={completeWorkout}
          disabled={workout.exercises.length === 0}
          style={{ 
            padding: '12px 30px', 
            background: workout.exercises.length === 0 ? '#ccc' : '#52c41a', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: workout.exercises.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          完成训练
        </button>
      </div>
    </div>
  );
}

// 日历页面组件
function Calendar({ username }) {
  const { date } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [monthWorkouts, setMonthWorkouts] = useState([]);

  useEffect(() => {
    loadWorkout();
    loadMonthWorkouts();
  }, [date, username]);

  const loadWorkout = async () => {
    try {
      const response = await workoutAPI.getWorkoutByDate(date);
      if (response.success) {
        setWorkout(response.data);
      }
    } catch (error) {
      console.error('加载训练详情失败:', error);
    }
  };

  const loadMonthWorkouts = async () => {
    try {
      const response = await workoutAPI.getRecentWorkouts(30);
      if (response.success) {
        setMonthWorkouts(response.data);
      }
    } catch (error) {
      console.error('加载月度训练记录失败:', error);
    }
  };

  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      days.push(day);
    }
    return days;
  };

  const getWorkoutForDay = (day) => {
    const dateStr = day.toISOString().split('T')[0];
    return monthWorkouts.find(w => w.date.startsWith(dateStr));
  };

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <button 
        onClick={() => navigate('/')}
        style={{ 
          marginBottom: '20px', 
          padding: '8px 16px', 
          background: '#1890ff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        返回首页
      </button>

      <h2 style={{ marginBottom: '20px' }}>30天训练日历</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '10px', 
        marginBottom: '30px' 
      }}>
        {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
          <div 
            key={i}
            style={{ 
              textAlign: 'center', 
              fontWeight: 'bold', 
              padding: '10px',
              background: '#f0f2f5',
              borderRadius: '4px'
            }}
          >
            {day}
          </div>
        ))}
        
        {getCalendarDays().map((day, index) => {
          const workoutForDay = getWorkoutForDay(day);
          const isSelected = day.toISOString().split('T')[0] === date;
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={index}
              onClick={() => navigate(`/calendar/${day.toISOString().split('T')[0]}`)}
              style={{ 
                border: `2px solid ${isSelected ? '#1890ff' : '#d9d9d9'}`,
                borderRadius: '8px', 
                padding: '10px', 
                minHeight: '80px',
                cursor: 'pointer',
                background: isToday ? '#fffbe6' : '#fff',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ 
                fontWeight: isToday ? 'bold' : 'normal',
                marginBottom: '5px'
              }}>
                {day.getDate()}
              </div>
              
              {workoutForDay && (
                <div>
                  {workoutForDay.intensity > 0 && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: workoutForDay.intensity >= 7 ? '#f5222d' : 
                             workoutForDay.intensity >= 4 ? '#faad14' : '#52c41a',
                      fontWeight: 'bold'
                    }}>
                      {workoutForDay.intensity >= 7 ? '高' : 
                       workoutForDay.intensity >= 4 ? '中' : '低'}强度
                    </div>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '2px',
                    marginTop: '4px'
                  }}>
                    {workoutForDay.exercises.slice(0, 2).map((exerciseLog, i) => (
                      <span 
                        key={i}
                        style={{ 
                          background: '#1890ff', 
                          color: 'white', 
                          padding: '1px 4px', 
                          borderRadius: '2px',
                          fontSize: '8px'
                        }}
                      >
                        {exerciseLog.exercise?.bodyPart || '未知'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {date && (
        <div>
          <h3 style={{ marginBottom: '20px' }}>
            {new Date(date).toLocaleDateString('zh-CN')} 训练详情
          </h3>
          
          {workout ? (
            <div>
              {workout.status === '已完成' && workout.intensity > 0 && (
                <div style={{ 
                  marginBottom: '20px', 
                  padding: '15px', 
                  background: '#f6ffed', 
                  borderRadius: '8px',
                  border: '1px solid #b7eb8f'
                }}>
                  <strong>训练强度：</strong>
                  <span style={{ 
                    color: workout.intensity >= 7 ? '#f5222d' : 
                           workout.intensity >= 4 ? '#faad14' : '#52c41a',
                    fontWeight: 'bold',
                    marginLeft: '10px'
                  }}>
                    {workout.intensity}/10
                  </span>
                  <span style={{ marginLeft: '10px' }}>
                    ({workout.intensity >= 7 ? '高强度' : 
                       workout.intensity >= 4 ? '中强度' : '低强度'})
                  </span>
                </div>
              )}
              
              <div>
                <h4 style={{ marginBottom: '15px' }}>训练动作：</h4>
                {workout.exercises.map((exerciseLog, exerciseIndex) => (
                  <div 
                    key={exerciseIndex}
                    style={{ 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '8px', 
                      padding: '15px', 
                      marginBottom: '15px'
                    }}
                  >
                    <h5 style={{ marginBottom: '10px' }}>
                      {exerciseLog.exercise?.name || '未知动作'}
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        marginLeft: '10px' 
                      }}>
                        ({exerciseLog.exercise?.bodyPart} - {exerciseLog.exercise?.difficulty})
                      </span>
                    </h5>
                    
                    {exerciseLog.sets.length > 0 && (
                      <div>
                        <h6 style={{ marginBottom: '8px', fontSize: '14px' }}>组数记录：</h6>
                        {exerciseLog.sets.map((set, setIndex) => (
                          <div 
                            key={setIndex}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '8px',
                              background: set.completed ? '#f6ffed' : '#fff',
                              border: `1px solid ${set.completed ? '#b7eb8f' : '#d9d9d9'}`,
                              borderRadius: '4px',
                              marginBottom: '5px'
                            }}
                          >
                            <span>
                              第{set.setNumber}组: {set.weight}kg × {set.reps}次
                            </span>
                            {set.completed && (
                              <span style={{ color: '#52c41a' }}>✓ 已完成</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {workout.status === '已完成' && workout.duration > 0 && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  background: '#f0f2f5', 
                  borderRadius: '8px' 
                }}>
                  <strong>训练时长：</strong>
                  {Math.floor(workout.duration / 60)}分{workout.duration % 60}秒
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center' }}>
              {new Date(date).toLocaleDateString('zh-CN')} 暂无训练记录
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// 主App组件
function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('fitness_username'));

  const handleLogin = (user) => {
    setUsername(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('fitness_username');
    setUsername(null);
  };

  // 如果未登录，显示登录界面
  if (!username) {
    return <UserLogin onLogin={handleLogin} />;
  }

  return (
    <Container>
      <Header>
        <Title>💪 健身记录App</Title>
        <Nav>
          <NavLink to="/">首页</NavLink>
          <NavLink to="/calendar">训练日历</NavLink>
          <UserInfo>
            <span>👤 {username}</span>
            <LogoutButton onClick={handleLogout}>切换用户</LogoutButton>
          </UserInfo>
        </Nav>
      </Header>
      
      <Content>
        <Routes>
          <Route path="/" element={<Home username={username} />} />
          <Route path="/workout/:id" element={<Workout username={username} />} />
          <Route path="/calendar" element={<Calendar username={username} />} />
          <Route path="/calendar/:date" element={<Calendar username={username} />} />
        </Routes>
      </Content>
    </Container>
  );
}

export default App;
