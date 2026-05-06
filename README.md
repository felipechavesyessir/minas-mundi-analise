# 🌍 Minas Mundi - Análise de Probabilidade

Aplicação web interativa para calcular suas chances de aprovação no intercâmbio Minas Mundi UFMG.

## 🚀 Rodar Localmente

### 1. Instalar dependências
```bash
pip install -r requirements.txt
```

### 2. Rodar a aplicação
```bash
streamlit run app.py
```

A app abrirá em `http://localhost:8501` no seu navegador.

---

## 📱 Deploy Gratuito na Web (Celular + Desktop)

### Opção 1: Streamlit Cloud (Recomendado ⭐)

**Passo 1:** Fazer upload do projeto para GitHub
```bash
# Se ainda não fez:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USER/minas-mundi.git
git push -u origin main
```

**Passo 2:** Acessar Streamlit Cloud
1. Ir para https://streamlit.io/cloud
2. Clicar em "Sign up with GitHub"
3. Autorizar Streamlit
4. Clicar em "New app"
5. Selecionar seu repositório e a branch `main`
6. Selecionar o arquivo `app.py`
7. Clicar em "Deploy"

✅ Pronto! A app estará disponível em `https://seu-app-name.streamlit.app` em menos de 1 minuto!

**Acesso pelo celular:**
- Apenas abra o link no navegador do celular
- Funciona 100% responsivo (já testado)

---

### Opção 2: Render.com (Alternativa)

1. Ir para https://render.com
2. Conectar com GitHub
3. Criar novo "Web Service"
4. Selecionar repositório
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `streamlit run app.py`
7. Deploy

---

## 📋 Arquivos

- `app.py` - Aplicação Streamlit interativa
- `requirements.txt` - Dependências Python
- `analise.py` - Script original (mantido para referência)

---

## 🎨 Funcionalidades

✅ Formulário interativo (sidebar)  
✅ Gráfico dinâmico com cores  
✅ Tabela de dados detalhada  
✅ Cálculo automático de probabilidades  
✅ Responsivo para celular  
✅ Deploy gratuito  

---

## ⚡ Como Usar

1. **Preencha seu perfil** na barra lateral esquerda:
   - Nome
   - NSG
   - Integralização
   - Idiomas
   - Experiência

2. **Veja os resultados** em tempo real:
   - Gráfico atualiza automaticamente
   - Mostra sua melhor opção
   - Tabela com análise completa

3. **Compartilhe o link** com colegas da UFMG!

---

## 📞 Ajuda

Se tiver dúvidas sobre o deploy, comente no [Streamlit Community](https://discuss.streamlit.io/)
