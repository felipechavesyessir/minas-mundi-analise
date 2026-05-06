#!/usr/bin/env python3
"""
Script para rodar Streamlit no modo rede local
Permitindo acesso via celular/outro PC na mesma rede WiFi
"""
import socket
import subprocess
import sys
import os

def get_local_ip():
    """Obtém o IP local da máquina"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    local_ip = get_local_ip()
    print(f"\n{'='*60}")
    print(f"🚀 Iniciando Streamlit App")
    print(f"{'='*60}")
    print(f"✅ PC Local: http://localhost:8501")
    print(f"📱 Celular/Outro PC: http://{local_ip}:8501")
    print(f"{'='*60}\n")
    
    # Executar Streamlit na porta 8501 acessível na rede
    subprocess.run([
        sys.executable, "-m", "streamlit", "run", 
        "app.py", 
        "--server.address", "0.0.0.0",
        "--server.port", "8501"
    ])
