document.addEventListener("DOMContentLoaded", async function () {
    const BASE_URL = "https://raw.githubusercontent.com/cep-der/website-/main/data/data_stat/2023/";
    const anoDados = BASE_URL.split("/").slice(-2, -1)[0]; // Obtém o ano da pasta onde os CSVs estão armazenados

    const csvURLs = [
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_andamento_aberto_na_unidade.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_andamento_fechado_na_unidade.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_tramitacao.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_gerados.csv`
    ];

    const idsGraficos = ["grafico-1", "grafico-2", "grafico-3", "grafico-4"];
    const titulosBase = [
        "Processos com andamento aberto na CEP em",
        "Processos com andamento fechado na CEP em",
        "Processos com tramitação na CEP em",
        "Processos gerados na CEP em"
    ];

    async function carregarDadosCSV(url) {
        try {
            console.log(`🔄 Carregando CSV: ${url}`);
            const resposta = await fetch(url);
            if (!resposta.ok) throw new Error(`❌ Erro ao carregar CSV: ${resposta.statusText}`);
            const texto = await resposta.text();
            console.log(`✅ CSV carregado com sucesso: ${url}`);
            return texto;
        } catch (erro) {
            console.error(`⚠️ Erro ao carregar ${url}:`, erro);
            return "";
        }
    }

    function processarCSV(csvTexto) {
        const linhas = csvTexto.split("\n").map(l => l.trim()).filter(l => l);

        if (linhas.length < 2) {
            console.warn("⚠️ CSV parece estar vazio ou mal formatado.");
            return [];
        }

        const cabecalho = linhas[0].split(";");
        let dados = linhas.slice(1).map(linha => {
            const valores = linha.split(";");
            return cabecalho.reduce((obj, chave, i) => {
                obj[chave.trim()] = valores[i] ? valores[i].trim() : "";
                return obj;
            }, {});
        });

        // 🔹 Remover a linha "TOTAL:"
        dados = dados.filter(item => item.Tipo && item.Tipo.toUpperCase() !== "TOTAL:");

        // 🔹 Corrigir o nome de "DER: FAIXA - Autorização de ocupação da faixa de domínio"
        dados.forEach(item => {
            if (item.Tipo && item.Tipo.includes("DER: FAIXA - Autorização de ocupação da faixa de domínio")) {
                item.Tipo = "Autorização de ocupação da faixa de domínio";
            }
        });

        return dados;
    }

    function calcularLimiteSuperior(dados) {
        let maxValor = 0;

        dados.forEach(item => {
            const quantidade = parseInt(item.Quantidade, 10);
            if (!isNaN(quantidade)) {
                maxValor = Math.max(maxValor, quantidade);
            }
        });

        return Math.ceil(maxValor / 5) * 5; // Arredondar para múltiplo de 5
    }

    function gerarLegenda(container, labels, cores) {
        const legendaContainer = document.createElement("div");
        legendaContainer.classList.add("legenda-container");
        legendaContainer.style.display = "grid";
        legendaContainer.style.gridTemplateColumns = "1fr 1fr"; // Duas colunas
        legendaContainer.style.gap = "10px";
        legendaContainer.style.marginTop = "10px";
        legendaContainer.style.padding = "10px";
        legendaContainer.style.backgroundColor = "#f8f9fa"; // Fundo leve para separar do gráfico
        legendaContainer.style.borderRadius = "5px";
        legendaContainer.style.boxShadow = "0px 2px 4px rgba(0,0,0,0.1)";

        labels.forEach((label, i) => {
            const legendaItem = document.createElement("div");
            legendaItem.style.display = "flex";
            legendaItem.style.alignItems = "center";
            legendaItem.style.fontSize = "14px"; // Fonte menor para melhor ajuste
            legendaItem.style.wordBreak = "break-word"; // Quebra de linha automática

            const corBox = document.createElement("span");
            corBox.style.backgroundColor = cores[i];
            corBox.style.width = "12px";
            corBox.style.height = "12px";
            corBox.style.marginRight = "8px";
            corBox.style.borderRadius = "3px";

            legendaItem.appendChild(corBox);
            legendaItem.appendChild(document.createTextNode(label));
            legendaContainer.appendChild(legendaItem);
        });

        // 🔹 Agora a legenda será inserida dentro do container do gráfico
        container.appendChild(legendaContainer);
    }
    // 🔹 Mapeamento fixo de cores baseado no Gráfico 3
const mapaCores = {
    "Autorização de Ocupação da Faixa de Domínio": "rgba(54, 162, 235, 0.6)", // Azul
    "Licenciamento Ambiental": "rgba(75, 192, 192, 0.6)", // Verde
    "Processo de Desapropriação": "rgba(255, 206, 86, 0.6)", // Amarelo
    "Termo de Permissão Especial de Uso": "rgba(255, 159, 64, 0.6)", // Laranja
    "Projeto de Engenharia Rodoviária": "rgba(153, 102, 255, 0.6)", // Roxo
    "Processo Administrativo": "rgba(255, 99, 132, 0.6)", // Vermelho
    "Contrato de Concessão Rodoviária": "rgba(0, 204, 102, 0.6)", // Verde claro
    "Obra de Melhorias Rodoviárias": "rgba(102, 102, 255, 0.6)", // Azul claro
    "Estudo de Impacto de Tráfego": "rgba(255, 153, 204, 0.6)", // Rosa claro
    "Processo Judicial": "rgba(204, 102, 0, 0.6)" // Marrom claro
};

// 🔹 Função para gerar cores aleatórias caso um novo tipo apareça
function gerarCorAleatoria() {
    const h = Math.floor(Math.random() * 360); // Gera um tom de cor aleatório
    return `hsla(${h}, 60%, 70%, 0.6)`; // Garante tons suaves
}

function gerarGrafico(dados, containerId, tituloBase, graficoIndex) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Contêiner do gráfico não encontrado: ${containerId}`);
        return;
    }

    if (dados.length === 0) {
        console.warn(`⚠️ Nenhum dado encontrado para o gráfico: ${tituloBase} ${anoDados}`);
        container.innerHTML = `<h4 class="grafico-titulo mb-3" style="font-size: 16px;">${tituloBase} ${anoDados}</h4><p class="text-danger">⚠️ Dados indisponíveis</p>`;
        return;
    }

    container.innerHTML = `
        <h4 class="grafico-titulo" style="font-size: 16px; text-align: center; margin-bottom: 10px;">
            ${tituloBase} ${anoDados}
        </h4>
        <canvas></canvas>
    `;
    const canvas = container.querySelector("canvas").getContext("2d");

    let labels = dados.map(item => item.Tipo || "Desconhecido");
    let valores = dados.map(item => parseInt(item.Quantidade, 10) || 0);

    // 🔹 Aplicar cores específicas para cada tipo de processo
    const backgroundColors = labels.map(tipo => {
        if (!mapaCores[tipo]) {
            mapaCores[tipo] = gerarCorAleatoria(); // Atribui uma nova cor caso não exista no mapa
        }
        return mapaCores[tipo];
    });

    const limiteSuperior = calcularLimiteSuperior(dados);

    let config = {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Quantidade",
                data: valores,
                backgroundColor: backgroundColors // Aplicando as cores personalizadas
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 5,
                    max: limiteSuperior
                }
            },
            plugins: {
                legend: { display: false } // Remover a legenda superior desnecessária
            }
        }
    };

    // 🔹 Para os gráficos 1, 2 e 3, remover os rótulos do eixo X e adicionar legenda dentro do container do gráfico
    if (graficoIndex < 3) {
        config.options.scales.x = { display: false };
        new Chart(canvas, config);
        gerarLegenda(container, labels, backgroundColors);
        return;
    }

    new Chart(canvas, config);
    }



    async function main() {
        console.log("🔍 Iniciando carregamento dos gráficos...");
        for (let i = 0; i < csvURLs.length; i++) {
            const csvTexto = await carregarDadosCSV(csvURLs[i]);
            const dados = processarCSV(csvTexto);
            console.log(`📊 Dados processados para "${titulosBase[i]} ${anoDados}":`, dados);
            gerarGrafico(dados, idsGraficos[i], titulosBase[i], i);
        }
        console.log("✅ Todos os gráficos foram carregados.");
    }

    main();
});
