"""
Ollama Service Manager Node
Ollama服务管理节点 - 一键启动/停止Ollama服务

提供可视化的Ollama服务控制界面
"""

import subprocess
import time
import psutil
import requests
import os
import platform
from typing import Optional, Dict, Any

try:
    from server import PromptServer
    from aiohttp import web
    WEB_AVAILABLE = True
except ImportError:
    WEB_AVAILABLE = False

CATEGORY_TYPE = "🎨 LRPG Canvas"

class OllamaServiceManager:
    """
    🦙 Ollama Service Manager
    
    一键启动/停止Ollama服务的管理节点
    """
    
    # 类级别的进程管理
    _ollama_process = None
    _service_status = "stopped"  # stopped, starting, running, stopping
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "hidden": {
                "unique_id": "UNIQUE_ID",
            },
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("status",)
    FUNCTION = "manage_service"
    CATEGORY = CATEGORY_TYPE
    OUTPUT_NODE = True
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        # 强制每次都重新执行以更新状态
        return float(time.time())
    
    def manage_service(self, unique_id=""):
        """
        管理Ollama服务
        """
        try:
            # 检测当前服务状态
            status = self.check_ollama_status()
            print(f"[Ollama Service Manager] 当前状态: {status}")
            
            return (f"Ollama服务状态: {status}",)
            
        except Exception as e:
            print(f"[Ollama Service Manager] 错误: {str(e)}")
            return (f"错误: {str(e)}",)
    
    @classmethod
    def check_ollama_status(cls) -> str:
        """检查Ollama服务状态"""
        try:
            # 方法1: 检查端口11434是否开放
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                cls._service_status = "running"
                return "运行中"
        except:
            pass
        
        # 方法2: 检查进程
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['name'] and 'ollama' in proc.info['name'].lower():
                    if proc.info['cmdline'] and any('serve' in str(cmd) for cmd in proc.info['cmdline']):
                        cls._service_status = "running"
                        return "运行中"
            except:
                continue
        
        cls._service_status = "stopped"
        return "已停止"
    
    @classmethod
    def start_ollama_service(cls) -> Dict[str, Any]:
        """启动Ollama服务"""
        try:
            # 检查是否已经运行
            if cls.check_ollama_status() == "运行中":
                return {"success": True, "message": "Ollama服务已在运行"}
            
            cls._service_status = "starting"
            
            # 确定操作系统和命令
            system = platform.system().lower()
            if system == "windows":
                cmd = ["ollama.exe", "serve"]
                # Windows下创建新的控制台窗口
                cls._ollama_process = subprocess.Popen(
                    cmd,
                    creationflags=subprocess.CREATE_NEW_CONSOLE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
            else:
                cmd = ["ollama", "serve"]
                cls._ollama_process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
            
            # 等待服务启动
            for i in range(10):  # 最多等待10秒
                time.sleep(1)
                if cls.check_ollama_status() == "运行中":
                    return {"success": True, "message": "Ollama服务启动成功"}
            
            return {"success": False, "message": "Ollama服务启动超时"}
            
        except FileNotFoundError:
            cls._service_status = "stopped"
            return {"success": False, "message": "Ollama未安装，请先安装Ollama"}
        except Exception as e:
            cls._service_status = "stopped"
            return {"success": False, "message": f"启动失败: {str(e)}"}
    
    @classmethod
    def stop_ollama_service(cls) -> Dict[str, Any]:
        """停止Ollama服务"""
        try:
            cls._service_status = "stopping"
            
            # 如果有记录的进程，先尝试终止
            if cls._ollama_process:
                try:
                    cls._ollama_process.terminate()
                    cls._ollama_process.wait(timeout=5)
                except:
                    try:
                        cls._ollama_process.kill()
                    except:
                        pass
                finally:
                    cls._ollama_process = None
            
            # 查找并终止所有Ollama进程
            terminated_count = 0
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if proc.info['name'] and 'ollama' in proc.info['name'].lower():
                        if proc.info['cmdline'] and any('serve' in str(cmd) for cmd in proc.info['cmdline']):
                            proc.terminate()
                            terminated_count += 1
                except:
                    continue
            
            # 等待进程完全退出
            time.sleep(2)
            
            # 验证是否真的停止了
            if cls.check_ollama_status() == "已停止":
                return {"success": True, "message": f"Ollama服务已停止 (终止了{terminated_count}个进程)"}
            else:
                return {"success": False, "message": "部分进程可能仍在运行"}
                
        except Exception as e:
            cls._service_status = "stopped"
            return {"success": False, "message": f"停止失败: {str(e)}"}

# Web API接口
if WEB_AVAILABLE:
    @PromptServer.instance.routes.post("/ollama_service_control")
    async def ollama_service_control(request):
        """Ollama服务控制API"""
        try:
            data = await request.json()
            action = data.get('action', '')
            
            if action == "status":
                status = OllamaServiceManager.check_ollama_status()
                return web.json_response({
                    "success": True,
                    "status": status,
                    "message": f"当前状态: {status}"
                })
            
            elif action == "start":
                result = OllamaServiceManager.start_ollama_service()
                return web.json_response(result)
            
            elif action == "stop":
                result = OllamaServiceManager.stop_ollama_service()
                return web.json_response(result)
            
            else:
                return web.json_response({
                    "success": False,
                    "message": "无效的操作"
                }, status=400)
                
        except Exception as e:
            return web.json_response({
                "success": False,
                "message": f"API错误: {str(e)}"
            }, status=500)

# 注册节点
NODE_CLASS_MAPPINGS = {
    "OllamaServiceManager": OllamaServiceManager,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "OllamaServiceManager": "🦙 Ollama Service Manager",
}

print("[Ollama Service Manager] 🦙 Ollama服务管理节点已注册")