/**
 * 用户登录组件
 * 处理用户输入用户名，实现数据隔离
 * @module components/UserLogin
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  color: #555;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 10px;
  padding: 10px;
  background: #fdeaea;
  border-radius: 8px;
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  font-size: 13px;
  color: #666;
  text-align: left;

  ul {
    margin: 8px 0 0 18px;
    padding: 0;
  }

  li {
    margin: 4px 0;
  }
`;

const UserList = styled.div`
  margin-top: 20px;
  text-align: left;
`;

const UserListTitle = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
`;

const UserTag = styled.span`
  display: inline-block;
  padding: 6px 12px;
  background: #e8e8e8;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  margin: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #d0d0d0;
  }
`;

/**
 * 用户登录组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onLogin - 登录成功回调
 * @returns {JSX.Element} 登录界面
 */
const UserLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [recentUsers, setRecentUsers] = useState([]);

  // 加载最近使用的用户名
  useEffect(() => {
    const savedUsers = localStorage.getItem('fitness_recent_users');
    if (savedUsers) {
      try {
        setRecentUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error('解析最近用户列表失败', e);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 验证用户名
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError('请输入用户名');
      return;
    }

    if (trimmedUsername.length < 2) {
      setError('用户名至少需要2个字符');
      return;
    }

    if (trimmedUsername.length > 20) {
      setError('用户名不能超过20个字符');
      return;
    }

    // 只允许字母、数字、中文和下划线
    const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
    if (!validPattern.test(trimmedUsername)) {
      setError('用户名只能包含字母、数字、中文和下划线');
      return;
    }

    // 保存用户名
    localStorage.setItem('fitness_username', trimmedUsername);

    // 更新最近用户列表
    const updatedUsers = [trimmedUsername, ...recentUsers.filter(u => u !== trimmedUsername)].slice(0, 5);
    setRecentUsers(updatedUsers);
    localStorage.setItem('fitness_recent_users', JSON.stringify(updatedUsers));

    // 调用登录回调
    onLogin(trimmedUsername);
  };

  const handleSelectUser = (user) => {
    setUsername(user);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>健身记录</Title>
        <Subtitle>记录每一次进步</Subtitle>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>用户名</Label>
            <Input
              type="text"
              placeholder="请输入用户名（如：zhangsan）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit">
            开始训练
          </Button>
        </form>

        {recentUsers.length > 0 && (
          <UserList>
            <UserListTitle>最近使用：</UserListTitle>
            {recentUsers.map((user, index) => (
              <UserTag key={index} onClick={() => handleSelectUser(user)}>
                {user}
              </UserTag>
            ))}
          </UserList>
        )}

        <InfoBox>
          <strong>提示：</strong>
          <ul>
            <li>每个用户只能看到自己的训练记录</li>
            <li>用户名区分大小写</li>
            <li>建议使用容易记住的用户名</li>
          </ul>
        </InfoBox>
      </LoginCard>
    </LoginContainer>
  );
};

export default UserLogin;
