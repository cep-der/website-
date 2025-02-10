document.addEventListener("DOMContentLoaded", async function () {
    const BASE_URL = "https://raw.githubusercontent.com/cep-der/website-/main/data/data_stat/2023/";

    const csvURLs = [
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_andamento_aberto_na_unidade.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_andamento_fechado_na_unidade.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_tramitacao.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_gerados.csv`
    ];

    const idsGraficos = ["grafico-1", "grafico-2", "grafico-3", "grafico-4"];
    const titulos = [
        "Processos com andamento aberto na CEP em 2023",
        "Processos com andamento fechado na CEP em 2023",
        "Processos com tramitação na CEP em 2023",
        "Processos gerados na CEP em 2023"
    ];

    async function carregarDadosCSV(url) {
        try {
            console.log(`Carregando CSV: ${url}`);
            const resposta = await fetch(url);
            if (!resposta.ok) throw new Error(`Erro ao carregar CSV: ${resposta.statusText}`);
            return await resposta.text();
        } catch (erro) {
            console.error(`Erro ao carregar ${url}:`, erro);
            return "";
        }
    }

    function processarCSV(csvTexto) {
        const linhas = csvTexto.split("\n").map(l => l.trim()).filter(l => l);
        if (linhas.length < 2) return [];

        const cabecalho = linhas[0].split(";");
        return linhas.slice(1).map(linha => {
            const valores = linha.split(";");
            return cabecalho.reduce((obj, chave, i) => {
                obj[chave.trim()] = valores[i] ? valores[i].trim() : "";
                return obj;
            }, {});
        });
    }

    function gerarGrafico(dados, containerId, titulo) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `<h4 class="grafico-titulo mb-3">${titulo}</h4><canvas></canvas>`;
        const canvas = container.querySelector("canvas").getContext("2d");

        const labels = dados.map(item => item.Tipo);
        const valores = dados.map(item => parseInt(item.Quantidade, 10));
        const cores = labels.map((_, i) => `hsl(${i * 360 / labels.length}, 70%, 50%)`);

        new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Quantidade",
                    data: valores,
                    backgroundColor: cores
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    async function main() {
        for (let i = 0; i < csvURLs.length; i++) {
            const csvTexto = await carregarDadosCSV(csvURLs[i]);
            const dados = processarCSV(csvTexto);
            gerarGrafico(dados, idsGraficos[i], titulos[i]);
        }
    }

    main();
});
