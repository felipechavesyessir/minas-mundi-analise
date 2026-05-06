import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Configuração da página
st.set_page_config(page_title="Minas Mundi - Análise", layout="wide", initial_sidebar_state="expanded")

st.title("🌍 Análise de Probabilidade - Minas Mundi UFMG")
st.markdown("Descubra suas melhores chances de intercâmbio!")

# Sidebar para inputs
st.sidebar.header("📋 Seu Perfil")

nome = st.sidebar.text_input("Nome:", "Candidato Civil - UFMG")
nsg = st.sidebar.slider("NSG (0-100):", 0, 100, 82)
integralizacao = st.sidebar.slider("Integralização do Curso (%):", 0, 100, 82)

st.sidebar.subheader("🗣️ Idiomas")
idiomas = {
    "Inglês": st.sidebar.selectbox("Inglês:", ["N/A", "A1", "A2", "B1", "B2", "C1", "C2"], index=4),
    "Espanhol": st.sidebar.selectbox("Espanhol:", ["N/A", "A1", "A2", "B1", "B2", "C1", "C2"], index=3),
    "Francês": st.sidebar.selectbox("Francês:", ["N/A", "A1", "A2", "B1", "B2", "C1", "C2"], index=0),
    "Alemão": st.sidebar.selectbox("Alemão:", ["N/A", "A1", "A2", "B1", "B2", "C1", "C2"], index=0),
}

st.sidebar.subheader("💼 Experiência (em meses)")
experiencia_meses = {
    "Iniciação Científica": st.sidebar.number_input("IC/Pesquisa:", 0, 60, 12),
    "Extensão/GIS": st.sidebar.number_input("Extensão/Projetos:", 0, 60, 8),
    "Monitoria": st.sidebar.number_input("Monitoria:", 0, 60, 0),
    "Estágio/Dev": st.sidebar.number_input("Estágio/Dev:", 0, 60, 18),
}

publicacoes = st.sidebar.number_input("Publicações/Artigos:", 0, 20, 2)

# Criar perfil
meu_perfil = {
    "nome": nome,
    "nsg": nsg,
    "integralizacao": integralizacao,
    "idiomas": idiomas,
    "experiencia_meses": experiencia_meses,
    "publicacoes": publicacoes
}

# Banco de dados histórico
data_dri = {
    "Universidade": [
        "U. Porto (FEUP)", "U. Coimbra", "Politécnica Madrid", 
        "U. Politécnica Valência", "Sapienza Roma", "TU Munich",
        "INSA Lyon", "U. Chile", "U. Lisboa (IST)", "KTH Suécia"
    ],
    "Pais": ["Portugal", "Portugal", "Espanha", "Espanha", "Itália", "Alemanha", "França", "Chile", "Portugal", "Suécia"],
    "Lingua_Exigida": ["N/A", "N/A", "B1", "B1", "B2", "B2", "B2", "B1", "Português", "B2"],
    "Idioma_Alvo": ["N/A", "N/A", "Espanhol", "Espanhol", "Inglês", "Inglês", "Francês", "Espanhol", "N/A", "Inglês"],
    "Sobra_Media": [1.1, 1.4, 3.2, 3.8, 5.1, 6.5, 5.9, 4.2, 1.3, 6.8] 
}

df_historico = pd.DataFrame(data_dri)

# Função auxiliar
def nivel_idioma_suficiente(nivel_candidato, nivel_exigido):
    niveis = {"N/A": 0, "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    return niveis.get(nivel_candidato, 0) >= niveis.get(nivel_exigido, 0)

# Algoritmo de probabilidade
def calcular_chances_sucesso(df, perfil):
    pts_curriculo = sum([m // 4 * 3 for m in perfil['experiencia_meses'].values()])
    pts_curriculo += perfil['publicacoes'] * 5
    
    probabilidades = []
    
    for idx, row in df.iterrows():
        score = row['Sobra_Media'] * 10 
        
        idioma_necessario = row['Idioma_Alvo']
        nivel_candidato = perfil['idiomas'].get(idioma_necessario, "N/A")
        
        eliminado = False

        if row['Lingua_Exigida'] in ["N/A", "Português"]:
            score += 15
        elif nivel_idioma_suficiente(nivel_candidato, row['Lingua_Exigida']):
            score += 30
        else:
            eliminado = True
            
        score += (perfil['nsg'] * 0.15) + (pts_curriculo * 0.1)
        
        if perfil['integralizacao'] >= 90:
            eliminado = True
        elif perfil['integralizacao'] >= 80:
            score -= 15
            
        if eliminado:
            probabilidades.append(0)
        else:
            probabilidades.append(max(min(score, 98), 2))

    df['Probabilidade_Final'] = probabilidades
    return df.sort_values(by="Probabilidade_Final", ascending=False)

# Calcular
df_final = calcular_chances_sucesso(df_historico.copy(), meu_perfil)

# Dashboard
col1, col2 = st.columns([3, 1])

with col1:
    st.subheader("📊 Gráfico de Probabilidades")
    
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.set_style("whitegrid")
    
    colors = ["#2ecc71" if x > 70 else "#f1c40f" if x > 40 else "#e74c3c" for x in df_final['Probabilidade_Final']]
    
    sns.barplot(x="Probabilidade_Final", y="Universidade", data=df_final, palette=colors, ax=ax, hue="Universidade", legend=False)
    
    for i, p in enumerate(ax.patches):
        width = p.get_width()
        chamada = df_final.iloc[i]['Sobra_Media']
        idioma = df_final.iloc[i]['Lingua_Exigida']
        ax.text(width + 1, p.get_y() + p.get_height()/2, 
                f"{width:.0f}% | Sobra {chamada:.1f}ª | {idioma}", 
                va='center', fontsize=9)
    
    ax.set_xlabel("Probabilidade de Seleção (%)", fontsize=11)
    ax.set_ylabel("")
    ax.set_xlim(0, 115)
    plt.tight_layout()
    st.pyplot(fig)

with col2:
    st.subheader("🎯 Melhores Opções")
    top_3 = df_final.head(3)
    
    for i, (_, row) in enumerate(top_3.iterrows(), 1):
        prob = row['Probabilidade_Final']
        if prob > 0:
            st.metric(
                f"{i}º lugar",
                f"{prob:.0f}%",
                f"{row['Universidade']}, {row['Pais']}"
            )
        else:
            st.warning(f"{i}º - Não elegível")

# Tabela detalhada
st.subheader("📋 Análise Detalhada")
df_display = df_final[['Universidade', 'Pais', 'Lingua_Exigida', 'Sobra_Media', 'Probabilidade_Final']].copy()
df_display.columns = ['Universidade', 'País', 'Idioma Exigido', 'Sobra até', 'Chance (%)']
df_display['Chance (%)'] = df_display['Chance (%)'].apply(lambda x: f"{x:.1f}%" if x > 0 else "❌ Inelegível")
st.dataframe(df_display, use_container_width=True, hide_index=True)

# Conclusão
st.divider()
top_vaga = df_final.iloc[0]
if top_vaga['Probabilidade_Final'] > 0:
    st.success(f"""
    ✅ **Sua melhor aposta:** {top_vaga['Universidade']} ({top_vaga['Pais']})
    
    📍 **Por quê?** Esta vaga costuma sobrar até a {top_vaga['Sobra_Media']:.1f}ª chamada e você cumpre o requisito de {top_vaga['Lingua_Exigida']}.
    """)
else:
    st.warning("⚠️ Revise seus dados - todas as vagas aparecem como inelegíveis.")

# Footer
st.divider()
st.caption("💡 **Dica:** Ajuste seu perfil na barra lateral e veja as chances atualizarem em tempo real!")
