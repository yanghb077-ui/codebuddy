@echo off
echo 正在启动健身记录App前端开发服务器...
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo 错误：未找到package.json文件
    echo 请确保在frontend目录下运行此脚本
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
echo 正在启动前端开发服务器...
echo 服务器启动后，请访问：http://localhost:5173
echo.

REM 启动Vite开发服务器
npm run dev

if %errorlevel% neq 0 (
    echo 错误：前端服务器启动失败
    echo 请检查：
    echo 1. Node.js版本是否为16.0或更高
    echo 2. 端口5173是否被占用
    echo 3. 依赖包是否安装成功
    pause
    exit /b 1
)

pause
