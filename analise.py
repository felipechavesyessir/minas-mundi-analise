import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# =================================================================
# 1. MOTOR DE DADOS: O SEU PERFIL (INSIRA SEUS DADOS AQUI)
# =================================================================
meu_perfil = {
    "nome": "Candidato Civil - UFMG",
    "nsg": 82,                   # Seu NSG (0 a 100)
    "integralizacao": 82,        # % do curso concluído (Cuidado com o limite de 90%!)
    "idiomas": {
        "Inglês": "B2",          # Nível: N/A, B1, B2, C1
        "Espanhol": "B1",
        "Francês": "N/A",
        "Alemão": "N/A"
    },
    # Pontuação de Currículo (Edital UFMG: aprox. 3pts por cada 4 meses)
    "experiencia_meses": {
        "ic_pesquisa": 12,       # Iniciação Científica
        "extensao_gis": 8,       # Projetos como o de Nova Lima/Mapeamento
        "monitoria": 0,
        "estagio_python_bim": 18 # Desenvolvimento de software/estágio técnico
    },
    "publicacoes": 2             # Artigos, banners ou resumos em congressos
}

# =================================================================
# 2. BANCO DE DADOS HISTÓRICO (SIMULANDO MINERAÇÃO DA DRI)
# =================================================================
# Este dicionário contém o "comportamento" das vagas nos últimos 3 anos
# 'Sobra_Media': 1 = Esgota na 1ª chamada | 7 = Sobra até a última chamada
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

# Função auxiliar para comparar os níveis dos idiomas corretamente
def nivel_idioma_suficiente(nivel_candidato, nivel_exigido):
    niveis = {"N/A": 0, "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    return niveis.get(nivel_candidato, 0) >= niveis.get(nivel_exigido, 0)

# =================================================================
# 3. ALGORITMO DE PROBABILIDADE (MODELO DE PREDICÇÃO)
# =================================================================
def calcular_chances_sucesso(df, perfil):
    # Cálculo de Pontos de Currículo conforme Edital
    pts_curriculo = sum([m // 4 * 3 for m in perfil['experiencia_meses'].values()])
    pts_curriculo += perfil['publicacoes'] * 5
    
    probabilidades = []
    
    for idx, row in df.iterrows():
        # Score Base baseado na 'Taxa de Sobra' (Quanto mais sobra, mais fácil entrar)
        # Uma faculdade que sobra até a 7ª chamada tem score base maior
        score = row['Sobra_Media'] * 10 
        
        # Fator Idioma: O Grande Diferencial
        idioma_necessario = row['Idioma_Alvo']
        nivel_candidato = perfil['idiomas'].get(idioma_necessario, "N/A")
        
        eliminado = False

        if row['Lingua_Exigida'] in ["N/A", "Português"]:
            score += 15  # Fácil acesso, mas concorrência de NSG é altíssima
        elif nivel_idioma_suficiente(nivel_candidato, row['Lingua_Exigida']):
            score += 30  # VANTAGEM: Você tem a língua e a vaga sobra mais
        else:
            eliminado = True  # BLOQUEIO: Você não cumpre o requisito de língua
            
        # Fator Acadêmico (NSG e Currículo)
        score += (perfil['nsg'] * 0.15) + (pts_curriculo * 0.1)
        
        # Fator Integralização (Penalidade para quem está colando grau)
        if perfil['integralizacao'] >= 90:
            eliminado = True
        elif perfil['integralizacao'] >= 80:
            score -= 15
            
        # Normalização para escala realista
        if eliminado:
            probabilidades.append(0)
        else:
            probabilidades.append(max(min(score, 98), 2))

    df['Probabilidade_Final'] = probabilidades
    return df.sort_values(by="Probabilidade_Final", ascending=False)

# =================================================================
# 4. DASHBOARD VISUAL (MATPLOTLIB + SEABORN)
# =================================================================
df_final = calcular_chances_sucesso(df_historico, meu_perfil)

plt.figure(figsize=(14, 8))
sns.set_style("whitegrid")

# Cores dinâmicas: Verde (Alta), Amarelo (Média), Vermelho (Baixa)
colors = ["#2ecc71" if x > 70 else "#f1c40f" if x > 40 else "#e74c3c" for x in df_final['Probabilidade_Final']]

ax = sns.barplot(x="Probabilidade_Final", y="Universidade", data=df_final, palette=colors, hue="Universidade", legend=False)

# Adicionando rótulos detalhados
for i, p in enumerate(ax.patches):
    chamada = df_final.iloc[i]['Sobra_Media']
    idioma = df_final.iloc[i]['Lingua_Exigida']
    ax.annotate(f" Chances: {p.get_width():.1f}% | Sobra até {chamada:.1f}ª Chamada | Exige: {idioma}", 
                (p.get_width(), p.get_y() + p.get_height() / 2),
                xytext=(5, 0), textcoords='offset points', va='center', fontsize=10)

plt.title(f"ANÁLISE DE PROBABILIDADE - MINAS MUNDI UFMG\nCandidato: {meu_perfil['nome']}", fontsize=16, pad=20)
plt.xlabel("Probabilidade de Seleção (%)", fontsize=12)
plt.ylabel("Instituição", fontsize=12)
plt.xlim(0, 115) 
plt.tight_layout()
plt.show()

# Resumo em texto
top_vaga = df_final.iloc[0]
print(f"--- CONCLUSÃO DO SISTEMA ---")
print(f"Sua melhor aposta estratégica é: {top_vaga['Universidade']} ({top_vaga['Pais']})")
print(f"Motivo: Esta vaga costuma sobrar até a {top_vaga['Sobra_Media']}ª chamada e você cumpre o requisito de {top_vaga['Lingua_Exigida']}.")
