import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { workoutAPI, exerciseAPI } from './services/api';
import UserLogin from './components/UserLogin';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

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

// 综合训练分析页面
function WorkoutOverview({ username }) {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOverview();
  }, [days, username]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await workoutAPI.getWorkoutOverview(days);
      if (response.success) {
        setOverview(response.data);
      } else {
        setError(response.message || '加载失败');
      }
    } catch (err) {
      console.error('加载综合分析失败:', err);
      setError(err.response?.data?.message || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const overviewCards = overview ? [
    { label: '训练次数', value: overview.summary.totalWorkouts },
    { label: '训练天数', value: overview.summary.trainingDays },
    { label: '每周频率', value: `${overview.summary.frequencyPerWeek} 次/周` },
    { label: '平均强度', value: overview.summary.avgIntensity },
    { label: '总训练时长', value: `${overview.summary.totalDuration} 分钟` },
    { label: '平均时长', value: `${overview.summary.avgDuration} 分钟` }
  ] : [];

  const dailyLabels = overview ? overview.dailySeries.map(item => item.date) : [];
  const dailyWorkouts = overview ? overview.dailySeries.map(item => item.workouts) : [];
  const dailyIntensity = overview ? overview.dailySeries.map(item => item.avgIntensity) : [];

  const dailyChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: '训练次数',
        data: dailyWorkouts,
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24,144,255,0.2)',
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: '平均强度',
        data: dailyIntensity,
        borderColor: '#faad14',
        backgroundColor: 'rgba(250,173,20,0.2)',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  };

  const bodyPartLabels = overview ? Object.keys(overview.bodyPartCounts) : [];
  const bodyPartValues = overview ? Object.values(overview.bodyPartCounts) : [];

  const bodyPartChartData = {
    labels: bodyPartLabels,
    datasets: [
      {
        label: '组数统计',
        data: bodyPartValues,
        backgroundColor: [
          '#1890ff',
          '#52c41a',
          '#faad14',
          '#722ed1',
          '#13c2c2',
          '#eb2f96',
          '#2f54eb'
        ]
      }
    ]
  };

  const intensityChartData = overview ? {
    labels: ['低强度', '中强度', '高强度'],
    datasets: [
      {
        label: '次数',
        data: [
          overview.intensityBuckets.low,
          overview.intensityBuckets.medium,
          overview.intensityBuckets.high
        ],
        backgroundColor: ['#52c41a', '#faad14', '#f5222d']
      }
    ]
  } : { labels: [], datasets: [] };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ marginBottom: '20px' }}>综合训练分析</h2>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[7, 30, 90, 180].map(range => (
          <button
            key={range}
            onClick={() => setDays(range)}
            style={{
              padding: '10px 16px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              background: days === range ? '#1890ff' : '#fff',
              color: days === range ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            最近{range}天
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#666' }}>加载中...</p>}
      {error && <p style={{ color: '#ff4d4f' }}>{error}</p>}

      {!loading && overview && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {overviewCards.map((card, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  background: '#fff'
                }}
              >
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '6px' }}>{card.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
              <Line
                data={dailyChartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' } },
                  scales: {
                    y: { beginAtZero: true, position: 'left' },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }
                  }
                }}
              />
            </div>
            <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
              <Bar data={bodyPartChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
            <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
              <Bar data={intensityChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [draftSets, setDraftSets] = useState({});
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
        setDraftSets({});
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

  const addDraftSet = (exerciseIndex) => {
    setDraftSets(prev => {
      const current = prev[exerciseIndex] || [];
      return {
        ...prev,
        [exerciseIndex]: [...current, { weight: '', reps: '' }]
      };
    });
  };

  const updateDraftSet = (exerciseIndex, draftIndex, field, value) => {
    setDraftSets(prev => {
      const current = prev[exerciseIndex] || [];
      const updated = current.map((item, index) =>
        index === draftIndex ? { ...item, [field]: value } : item
      );
      return { ...prev, [exerciseIndex]: updated };
    });
  };

  const removeDraftSet = (exerciseIndex, draftIndex) => {
    setDraftSets(prev => {
      const current = prev[exerciseIndex] || [];
      const updated = current.filter((_, index) => index !== draftIndex);
      return { ...prev, [exerciseIndex]: updated };
    });
  };

  const saveDraftSet = async (exerciseIndex, draftIndex) => {
    const current = draftSets[exerciseIndex] || [];
    const draft = current[draftIndex];
    if (!draft || !draft.weight || !draft.reps) {
      alert('请填写重量和次数');
      return;
    }

    try {
      const response = await workoutAPI.addSetToWorkout(
        id,
        exerciseIndex,
        parseFloat(draft.weight),
        parseInt(draft.reps)
      );
      if (response.success) {
        setWorkout(response.data);
        const newSetIndex = response.data.exercises?.[exerciseIndex]?.sets?.length
          ? response.data.exercises[exerciseIndex].sets.length - 1
          : null;
        if (newSetIndex !== null) {
          const completeResponse = await workoutAPI.completeSetInWorkout(
            id,
            exerciseIndex,
            newSetIndex
          );
          if (completeResponse.success) {
            setWorkout(completeResponse.data);
          }
        }
        removeDraftSet(exerciseIndex, draftIndex);
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

  const deleteSet = async (exerciseIndex, setIndex) => {
    try {
      const response = await workoutAPI.deleteSetFromWorkout(id, exerciseIndex, setIndex);
      if (response.success) {
        setWorkout(response.data);
      }
    } catch (error) {
      console.error('删除组数失败:', error);
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
                <button
                  onClick={() => addDraftSet(exerciseIndex)}
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

              {((draftSets[exerciseIndex] || []).length > 0 || exerciseLog.sets.length > 0) && (
                <div>
                  <h5 style={{ marginBottom: '8px', fontSize: '14px' }}>组数记录：</h5>
                  {(draftSets[exerciseIndex] || []).map((draft, draftIndex) => (
                    <div
                      key={`draft-${draftIndex}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr auto auto',
                        gap: '8px',
                        alignItems: 'center',
                        padding: '8px',
                        background: '#fffbe6',
                        border: '1px solid #ffe58f',
                        borderRadius: '4px',
                        marginBottom: '5px'
                      }}
                    >
                      <input
                        type="number"
                        placeholder="重量 (kg)"
                        value={draft.weight}
                        onChange={(e) => updateDraftSet(exerciseIndex, draftIndex, 'weight', e.target.value)}
                        style={{
                          padding: '8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px'
                        }}
                      />
                      <input
                        type="number"
                        placeholder="次数"
                        value={draft.reps}
                        onChange={(e) => updateDraftSet(exerciseIndex, draftIndex, 'reps', e.target.value)}
                        style={{
                          padding: '8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px'
                        }}
                      />
                      <button
                        onClick={() => saveDraftSet(exerciseIndex, draftIndex)}
                        style={{
                          padding: '6px 12px',
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
                      <button
                        onClick={() => removeDraftSet(exerciseIndex, draftIndex)}
                        style={{
                          padding: '6px 12px',
                          background: '#f5f5f5',
                          color: '#333',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        删除
                      </button>
                    </div>
                  ))}
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
                      <div style={{ display: 'flex', gap: '6px' }}>
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
                        <button
                          onClick={() => deleteSet(exerciseIndex, setIndex)}
                          style={{ 
                            padding: '4px 12px', 
                            background: '#f5f5f5', 
                            color: '#333', 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          删除
                        </button>
                      </div>
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

// 动作历史与数据分析页面
function ExerciseHistory({ username }) {
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [days, setDays] = useState(180);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExercises();
  }, [username]);

  useEffect(() => {
    if (selectedExerciseId) {
      loadHistory();
    } else {
      setHistoryData(null);
    }
  }, [selectedExerciseId, days]);

  const loadExercises = async () => {
    try {
      const response = await exerciseAPI.getAllExercises();
      if (response.success) {
        setExercises(response.data);
      }
    } catch (err) {
      console.error('加载动作库失败:', err);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await workoutAPI.getExerciseHistory(selectedExerciseId, days);
      if (response.success) {
        setHistoryData(response.data);
      } else {
        setError(response.message || '加载失败');
      }
    } catch (err) {
      console.error('加载动作历史失败:', err);
      setError(err.response?.data?.message || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  };

  const summaryCards = historyData ? [
    { label: '训练次数', value: historyData.summary.totalWorkouts },
    { label: '总组数', value: historyData.summary.totalSets },
    { label: '总次数', value: historyData.summary.totalReps },
    { label: '总训练量', value: `${historyData.summary.totalVolume} kg·次` },
    { label: '最高重量', value: `${historyData.summary.bestWeight} kg` },
    { label: '最佳单组量', value: `${historyData.summary.bestSetVolume} kg·次` },
    { label: '平均每次训练量', value: `${historyData.summary.avgVolumePerWorkout} kg·次` },
    { label: '平均每组次数', value: historyData.summary.avgRepsPerSet },
    { label: '近3次变化', value: `${historyData.summary.volumeChangeRate}%` }
  ] : [];

  const chartLabels = historyData
    ? historyData.history.slice().reverse().map(item => formatDate(item.date))
    : [];
  const volumeSeries = historyData
    ? historyData.history.slice().reverse().map(item => item.totals.volume)
    : [];
  const bestWeightSeries = historyData
    ? historyData.history.slice().reverse().map(item => item.bests.weight)
    : [];
  const setsSeries = historyData
    ? historyData.history.slice().reverse().map(item => item.totals.sets)
    : [];
  const repsSeries = historyData
    ? historyData.history.slice().reverse().map(item => item.totals.reps)
    : [];

  const volumeChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '训练量(kg·次)',
        data: volumeSeries,
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24,144,255,0.2)',
        tension: 0.3
      }
    ]
  };

  const bestWeightChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '最高重量(kg)',
        data: bestWeightSeries,
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82,196,26,0.2)',
        tension: 0.3
      }
    ]
  };

  const setsRepsChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '组数',
        data: setsSeries,
        backgroundColor: 'rgba(250,173,20,0.7)'
      },
      {
        label: '次数',
        data: repsSeries,
        backgroundColor: 'rgba(114,46,209,0.7)'
      }
    ]
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ marginBottom: '20px' }}>动作历史详情与数据分析</h2>

      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          style={{
            flex: '1 1 260px',
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

        {[30, 90, 180, 365].map(range => (
          <button
            key={range}
            onClick={() => setDays(range)}
            style={{
              padding: '10px 16px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              background: days === range ? '#1890ff' : '#fff',
              color: days === range ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            最近{range}天
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#666' }}>加载中...</p>}
      {error && <p style={{ color: '#ff4d4f' }}>{error}</p>}

      {!loading && selectedExerciseId && historyData && (
        <div>
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: '#f0f2f5',
            borderRadius: '8px'
          }}>
            <strong>{historyData.exercise.name}</strong>
            <span style={{ marginLeft: '8px', color: '#666' }}>
              ({historyData.exercise.bodyPart} - {historyData.exercise.difficulty})
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {summaryCards.map((card, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  background: '#fff'
                }}
              >
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '6px' }}>{card.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{card.value}</div>
              </div>
            ))}
          </div>

          {historyData.history.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>趋势图表</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <Line data={volumeChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
                <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <Line data={bestWeightChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
                <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <Bar data={setsRepsChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
              </div>
            </div>
          )}

          {historyData.history.length === 0 ? (
            <p style={{ color: '#666' }}>暂无历史记录</p>
          ) : (
            <div>
              <h3 style={{ marginBottom: '12px' }}>训练历史</h3>
              {historyData.history.map((item, index) => (
                <div
                  key={`${item.workoutId}-${index}`}
                  style={{
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <strong>{formatDate(item.date)}</strong>
                    <span style={{ color: '#666' }}>总量 {item.totals.volume} kg·次</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    color: '#666',
                    fontSize: '12px',
                    marginBottom: '8px'
                  }}>
                    <span>组数: {item.totals.sets}</span>
                    <span>次数: {item.totals.reps}</span>
                    <span>最高重量: {item.bests.weight}kg</span>
                    <span>最佳单组量: {item.bests.setVolume}kg·次</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {item.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: '1px solid #f0f0f0',
                          background: set.completed ? '#f6ffed' : '#fff'
                        }}
                      >
                        <span>第{set.setNumber}组</span>
                        <span>{set.weight}kg × {set.reps}次</span>
                        <span style={{ color: set.completed ? '#52c41a' : '#999' }}>
                          {set.completed ? '已完成' : '未完成'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedExerciseId && !loading && (
        <p style={{ color: '#666' }}>请选择动作以查看历史详情与数据分析</p>
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
          <NavLink to="/overview">综合分析</NavLink>
          <NavLink to="/exercise-history">动作分析</NavLink>
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
          <Route path="/overview" element={<WorkoutOverview username={username} />} />
          <Route path="/exercise-history" element={<ExerciseHistory username={username} />} />
        </Routes>
      </Content>
    </Container>
  );
}

export default App;
