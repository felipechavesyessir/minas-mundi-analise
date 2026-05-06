// 1. BANCO DE DADOS DA DRI (MINERADO E SUBSTITUÍVEL)
let data_dri = [
    { Universidade: "U. Porto (FEUP)", Pais: "Portugal", Lingua_Exigida: "N/A", Idioma_Alvo: "N/A", Sobra_Media: 1.1 },
    { Universidade: "U. Coimbra", Pais: "Portugal", Lingua_Exigida: "N/A", Idioma_Alvo: "N/A", Sobra_Media: 1.4 },
    { Universidade: "Politécnica Madrid", Pais: "Espanha", Lingua_Exigida: "B1", Idioma_Alvo: "Espanhol", Sobra_Media: 3.2 },
    { Universidade: "U. Politécnica Valência", Pais: "Espanha", Lingua_Exigida: "B1", Idioma_Alvo: "Espanhol", Sobra_Media: 3.8 },
    { Universidade: "Sapienza Roma", Pais: "Itália", Lingua_Exigida: "B2", Idioma_Alvo: "Inglês", Sobra_Media: 5.1 },
    { Universidade: "TU Munich", Pais: "Alemanha", Lingua_Exigida: "B2", Idioma_Alvo: "Inglês", Sobra_Media: 6.5 },
    { Universidade: "INSA Lyon", Pais: "França", Lingua_Exigida: "B2", Idioma_Alvo: "Francês", Sobra_Media: 5.9 },
    { Universidade: "U. Chile", Pais: "Chile", Lingua_Exigida: "B1", Idioma_Alvo: "Espanhol", Sobra_Media: 4.2 },
    { Universidade: "U. Lisboa (IST)", Pais: "Portugal", Lingua_Exigida: "Português", Idioma_Alvo: "N/A", Sobra_Media: 1.3 },
    { Universidade: "KTH Suécia", Pais: "Suécia", Lingua_Exigida: "B2", Idioma_Alvo: "Inglês", Sobra_Media: 6.8 }
];

// Conversão Analítica de Níveis de Idioma (N/A -> C2)
const niveisIdioma = { "N/A": 0, "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6, "Português": 0 };

function checkIdiomaSuficiente(candidato, exigido) {
    return (niveisIdioma[candidato] || 0) >= (niveisIdioma[exigido] || 0);
}

// 2. MOTOR PROBABILÍSTICO (Algoritmo Reactivo)
function calcularChances() {
    // 2.a Lendo os dados do Frontend
    const nsgStr = document.getElementById('nsg').value;
    const nsg = nsgStr ? parseFloat(nsgStr) : 0;
    
    const intStr = document.getElementById('integralizacao').value;
    const integralizacao = intStr ? parseInt(intStr) : 0;
    
    // Níveis de Proficiência Inserida
    const idiomas = {
        "Inglês": document.getElementById('Inglês').value,
        "Espanhol": document.getElementById('Espanhol').value,
        "Francês": document.getElementById('Francês').value,
        "Alemão": document.getElementById('Alemão').value,
        "N/A": "N/A"
    };

    // Tempo de Atividades em Meses
    const exp = {
        ic: parseInt(document.getElementById('ic').value) || 0,
        ext: parseInt(document.getElementById('extensao').value) || 0,
        mon: parseInt(document.getElementById('monitoria').value) || 0,
        est: parseInt(document.getElementById('estagio').value) || 0,
    };
    
    const publicacoes = parseInt(document.getElementById('publicacoes').value) || 0;

    // 2.b Calcular a Nota de Currículo (Edital) -> 3pts a cada 4 meses
    let ptsCurriculo = 0;
    Object.values(exp).forEach(meses => {
        ptsCurriculo += Math.floor(meses / 4) * 3;
    });
    ptsCurriculo += publicacoes * 5;

    // 2.c Sistema de Pesagem por Universidade
    let simulacoes = data_dri.map(row => {
        // Vaga que sobra muito é mais fácil
        let pontuacao = row.Sobra_Media * 10;
        
        // Match de Idioma
        const nivel_candidato = idiomas[row.Idioma_Alvo] || "N/A";
        let bloqueio_eliminatorio = false;
        let motivo_bloqueio = "";
        
        if (row.Lingua_Exigida === "N/A" || row.Lingua_Exigida === "Português") {
            pontuacao += 15; // Muita concorrência, pouco requisito
        } else if (checkIdiomaSuficiente(nivel_candidato, row.Lingua_Exigida)) {
            pontuacao += 30; // Diferencial Competitivo
        } else {
            bloqueio_eliminatorio = true;
            motivo_bloqueio = "Falta a Língua Exigida";
        }

        // Fator Desempenho e Currículo
        pontuacao += (nsg * 0.15) + (ptsCurriculo * 0.1);

        // Penalidade de Integralização Excessiva (colação de grau)
        if (integralizacao >= 90) {
            bloqueio_eliminatorio = true;
            motivo_bloqueio = "Risco de Jubilamento/Colação (≥90%)";
        } else if (integralizacao >= 80) {
            pontuacao -= 15;
        }

        // Caps probabilísticos
        const probReal = bloqueio_eliminatorio ? 0 : Math.max(Math.min(pontuacao, 98), 2);

        return { ...row, probabilidade: parseFloat(probReal.toFixed(1)), bloqueio: motivo_bloqueio };
    });

    // 3. Ordenação Descendente e Renderização
    simulacoes.sort((a, b) => b.probabilidade - a.probabilidade);
    renderDashboardUI(simulacoes);
    
    // 4. Gerar Feedback Personalizado
    gerarDicasPersonalizadas(nsg, integralizacao, idiomas, publicacoes, exp);
}

// 5. INTELIGÊNCIA ARTIFICIAL E RECOMENDAÇÕES (ABA MELHORAR)
function gerarDicasPersonalizadas(nsg, integralizacao, idiomas, publicacoes, exp) {
    const container = document.getElementById('dynamic-tips-container');
    container.innerHTML = '';
    let dicas = [];

    // Crítico - Integralização
    if (integralizacao > 85) {
        dicas.push({
            cor: "var(--color-low)", 
            title: "ALERTA VERMELHO: Perigo de Colação de Grau (-20 pts)",
            text: `Seu grau de integralização inserido está em ${integralizacao}%. O algoritmo da DRI obrigatoriamente aplica pesadas punições de pontos quando os alunos ultrapassam 85-90% de curso, temendo que faltem matérias para validarem internacionalmente. Caso esse número seja real, apresse a sua aplicação sem pensar nas faculdades tão concorridas!`
        });
    }

    // Mineração de Vagas Desperdiçadas
    let vagasPerdidasPorIdioma = data_dri.filter(row => {
        if (row.Lingua_Exigida === "N/A" || row.Lingua_Exigida === "Português") return false;
        const nivelCand = idiomas[row.Idioma_Alvo] || "N/A";
        return !checkIdiomaSuficiente(nivelCand, row.Lingua_Exigida);
    });
    
    if (vagasPerdidasPorIdioma.length > 0) {
        // Encontra o diamante bruto perdido
        vagasPerdidasPorIdioma.sort((a,b) => b.Sobra_Media - a.Sobra_Media);
        let tesouro = vagasPerdidasPorIdioma[0];
        
        dicas.push({
            cor: "var(--accent)",
            title: `O Atalho Secreto: Ganhe 90 Pontos estudando ${tesouro.Idioma_Alvo}`,
            text: `A vaga na **${tesouro.Universidade} (${tesouro.Pais})** é raríssima mente preenchida na 1° chamada, às vezes sobrando até a ${tesouro.Sobra_Media}ª oportunidade! Hoje o sistema tirou -50 pontos seus pela falta de fluência nela. Se você pegar firme no **${tesouro.Idioma_Alvo}** e conseguir o certificado ${tesouro.Lingua_Exigida}, o bloqueio some e se converte num bônus extra enorme (+40 pts) que ofusca até currículos com NSGs perfeitos!`
        });
    }

    // Análise de Produtividade Acadêmica Extra
    let somaExps = exp.ic + exp.ext + exp.mon + exp.est;
    if (publicacoes === 0 && somaExps < 12) {
        dicas.push({
            cor: "var(--color-med)",
            title: "O Peso das Atividades Comuns e de Extensão",
            text: `Seu dossiê carece de peso acadêmico. Percebeu como estágio e bolsas (IC) somam apenas míseros 3 pontos a cada cansativos 4 meses completados? Reverter isso toma tempo de longo prazo, procure envolver-se num projeto de bolsa (BIM/Iniciação).`
        });
    }
    
    // Tática do Banners
    if (publicacoes === 0) {
        dicas.push({
            cor: "var(--color-high)",
            title: "Publicações Valem Ouro na UFMG (Burlador de Tempo)",
            text: `A matemática não mente: Escrever um único resumo, pôster ou apresentação na 'Semana do Conhecimento' injeta instantaneamente **+5 Pontos inteiros**! É muito mais negócio fazer uma semana de artigo do que lutar por 6 meses diários trabalhando num estágio focado apenas nisso. Se inscreva no próximo congresso local da UFMG para adicionar essa vantagem rápida da noite pro dia.`
        });
    }

    // Blindagem de NSG
    if (nsg < 70) {
        dicas.push({
            cor: "var(--color-low)",
            title: "Sinal Amarelo no NSG da DRI",
            text: `Com ${nsg} de NSG, você vai perder a queda de braços contra candidatos disputando a Universidade do Porto (que nivela alunos pelo teto). Faça algumas "materinhas grátis e flexíveis" do catálogo para estabilizar essa nota acima do 80 até o final do ano.`
        });
    } else if (nsg > 88) {
         dicas.push({
            cor: "var(--color-high)",
            title: "Poder de Fogo Bruto",
            text: `Seu NSG majestoso de ${nsg} te fornece um benefício incrível. Apenas mantenha esse ritmo constante e não reprove por falta! Suas portas na Espanha e Portugal (onde dependem primariamente desta nota pura) continuam favoráveis.`
        });
    }

    if(dicas.length === 0) {
       dicas.push({
           cor: "var(--color-high)",
           title: "Perfíl Blindado e Balanceado!",
           text: "Ficamos sem dicas para você. De verdade, você possui notas altas, idiomas e experiência de sobra. Arrume o voo e os vistos!"
       });
    }

    // Injetar Dicas na DOM
    dicas.forEach((d, index) => {
        const blit = `
        <div style="background: rgba(255, 255, 255, 0.03); border-left: 4px solid ${d.cor}; padding: 1.5rem; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: fadeIn 0.5s ease-out;">
            <strong style="color: white; font-size: 1.1rem;">Insight Especial #${index+1} — ${d.title}</strong><br><br>
            <span style="color: var(--text-secondary); line-height: 1.6;">${d.text}</span>
        </div>`;
        container.insertAdjacentHTML('beforeend', blit);
    });
}

// Helper para coloração condicional de Probabilidade
function getGradienteCor(prob) {
    if (prob >= 75) return 'var(--color-high)';
    if (prob > 35) return 'var(--color-med)';
    return 'var(--color-low)';
}

// 4. CAMADA DE RENDERIZAÇÃO DOM
function renderDashboardUI(resultados) {
    const topoContainer = document.getElementById('top-match-content');
    const barrasContainer = document.getElementById('bars-container');
    
    // a) Top Match Hero Section
    const topVaga = resultados[0];
    topoContainer.innerHTML = `
        <div class="match-uni">${topVaga.Universidade} <span style="font-size: 1.3rem">(${topVaga.Pais})</span></div>
        <div class="match-details">
            Aposta viável porque costuma sobrar até a <strong>${topVaga.Sobra_Media}ª chamada</strong> e 
            você satisfaz o requisito esperado (${topVaga.Lingua_Exigida === 'N/A' ? 'Nenhum' : topVaga.Lingua_Exigida}).
        </div>
    `;

    // b) Construir as Barras HTML
    barrasContainer.innerHTML = '';
    
    resultados.forEach((item, index) => {
        const corProb = getGradienteCor(item.probabilidade);
        
        // Estrutura HTML Dinâmica e Limpa
        const template = `
            <div class="bar-item">
                <div class="bar-header">
                    <span><strong>#${index + 1}</strong> ${item.Universidade}</span>
                    <span style="color: ${item.probabilidade === 0 ? '#e74c3c' : corProb}; font-weight: 800; font-size: 1.05rem;">
                        ${item.probabilidade === 0 ? 'ELIMINADO (0%)' : item.probabilidade + '%'}
                    </span>
                </div>
                <div class="bar-bg">
                    <div class="bar-fill" data-width="${item.probabilidade}%" style="background-color: ${corProb};"></div>
                </div>
                <div class="info-tooltip">
                    <span><strong>Exige:</strong> ${item.Lingua_Exigida}</span>
                    <span><strong>Sobra média:</strong> ${item.Sobra_Media}ª Chamada</span>
                    ${item.probabilidade === 0 ? `<span style="color: #e74c3c;"><strong>Motivo:</strong> ${item.bloqueio}</span>` : ''}
                </div>
            </div>
        `;
        
        barrasContainer.insertAdjacentHTML('beforeend', template);
    });

    // c) Forçar Micro-Animação do preenchimento das barras (CSS Transition)
    setTimeout(() => {
        document.querySelectorAll('.bar-fill').forEach(animLayer => {
            animLayer.style.width = animLayer.getAttribute('data-width');
        });
    }, 50); // Timeout rápido para garantir o DOM attach antes da trigger de animação
}

// 5. INICIALIZAR LISTENERS AO VIVO (Interactive Design)
// Qualquer mudança em qualquer input recalcula tudo e anima perfeitamente.
document.querySelectorAll('input, select').forEach(elementoGlobal => {
    elementoGlobal.addEventListener('input', calcularChances);
});

// Lógica de Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
});

// Importador de Carga Estratégica (Integração Excel)
document.getElementById('btn-importar').addEventListener('click', () => {
    const rawData = document.getElementById('data-import').value;
    const lines = rawData.split('\n');
    let injectedData = [];

    for (let row of lines) {
        if (!row.trim()) continue;
        
        // Cópia do Excel usa Tab (\t)
        let cols = row.split('\t');
        if (cols.length < 5) cols = row.split(','); // Fallback pra arquivo CSV original
        if (cols.length < 5) cols = row.split(';'); // Fallback alternativo Brasil CSV
        
        if (cols.length >= 5) {
            // Se encontrar a linha de cabeçalho acidentalmente colada, ignora
            if(cols[0].trim().toLowerCase().includes('universidade')) continue;

            injectedData.push({
                Universidade: cols[0].trim(),
                Pais: cols[1].trim(),
                Lingua_Exigida: cols[2].trim(),
                Idioma_Alvo: cols[3].trim(),
                Sobra_Media: parseFloat(cols[4].trim().replace(',', '.')) || 1.0
            });
        }
    }

    if (injectedData.length > 0) {
        data_dri = injectedData; // Substitui o array protótipo
        calcularChances(); // Atualiza tudo perfeitamente com os novos dados
        
        const btn = document.getElementById('btn-importar');
        const oldText = btn.innerText;
        btn.innerText = "✓ Edital Injetado com Sucesso! (" + injectedData.length + " Instituições)";
        btn.style.background = "var(--color-high)";
        
        setTimeout(() => {
            btn.innerText = oldText;
            btn.style.background = "var(--accent)";
            // Simula clique na primeira aba pra mostrar o gráfico na mesma hora
            document.querySelector('.tab-btn[data-tab="simulador"]').click();
        }, 2000);
    } else {
        alert("Erro! Não consegui entender as colunas. Verifique se copiou as 5 colunas requeridas do Excel adequadamente e colou direto aqui.");
    }
});

// Chute Inicial
window.onload = calcularChances;
