#!/usr/bin/env python3
"""
Script para compartilhar Streamlit app pela internet usando ngrok
Funciona em qualquer rede - celular não precisa estar na mesma WiFi!
"""
import subprocess
import sys
import time
import threading
from pyngrok import ngrok

def run_streamlit():
    """Roda o Streamlit normalmente"""
    subprocess.run([
        sys.executable, "-m", "streamlit", "run", 
        "app.py",
        "--server.headless", "true"
    ])

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🚀 INICIANDO APP COM ACESSO PÚBLICO (NGROK)")
    print("="*70)
    
    # Iniciar Streamlit em thread separada
    streamlit_thread = threading.Thread(target=run_streamlit, daemon=True)
    streamlit_thread.start()
    
    # Aguardar servidor iniciar
    time.sleep(3)
    
    try:
        # Criar tunnel público
        print("\n⏳ Criando tunnel ngrok (pode levar alguns segundos)...")
        public_url = ngrok.connect(8501)
        
        print("\n" + "="*70)
        print("✅ APP ACESSÍVEL PUBLICAMENTE!")
        print("="*70)
        print(f"\n📱 CELULAR / QUALQUER REDE:")
        print(f"   🔗 {public_url}")
        print(f"\n💻 PC LOCAL:")
        print(f"   🔗 http://localhost:8501")
        print("\n" + "="*70)
        print("Pressione Ctrl+C para parar o servidor\n")
        
        # Manter vivo
        ngrok_process = ngrok.get_ngrok_process()
        ngrok_process.proc.wait()
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        print("\nDica: Verifique sua conexão com internet e tente novamente")
        sys.exit(1)
