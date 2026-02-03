@echo off
echo 正在启动健身记录App后端服务器...
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo 错误：未找到package.json文件
    echo 请确保在backend目录下运行此脚本
    pause
    exit /b 1
)

echo 安装依赖包...
call npm install

if %errorlevel% neq 0 (
    echo 错误：依赖包安装失败
    pause
    exit /b 1
)

echo.
echo 正在启动MongoDB...
echo 请确保MongoDB服务已安装并正在运行
echo 如果未安装MongoDB，请访问：https://www.mongodb.com/try/download/community
echo.
echo 启动服务器...
echo.

REM 启动Node.js服务器
node server.js

if %errorlevel% neq 0 (
    echo 错误：服务器启动失败
    echo 请检查：
    echo 1. MongoDB是否正在运行
    echo 2. .env文件配置是否正确
    echo 3. 端口5000是否被占用
    pause
    exit /b 1
)

pause
