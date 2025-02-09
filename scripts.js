document.addEventListener("DOMContentLoaded", async function () {
    const graficosContainer = document.getElementById("graficos-container");
    const caminhoBase = "data/data_stat/"; // Caminho base onde os arquivos estão armazenados

    // Função para carregar anos_disponiveis.json
    async function carregarAnosDisponiveis() {
        try {
            const resposta = await fetch(`${caminhoBase}anos_disponiveis.json`);
            if (!resposta.ok) throw new Error("Erro ao carregar anos_disponiveis.json.");
            return await resposta.json();
        } catch (erro) {
            console.error("Erro ao carregar anos_disponiveis.json:", erro);
            return [];
        }
    }

    // Função para carregar arquivos_disponiveis.json
    async function carregarArquivosDisponiveis(ano) {
        try {
            const resposta = await fetch(`${caminhoBase}${ano}/arquivos_disponiveis.json`);
            if (!resposta.ok) throw new Error(`Erro ao carregar arquivos_disponiveis.json para ${ano}.`);
            return await resposta.json();
        } catch (erro) {
            console.error(`Erro ao carregar arquivos_disponiveis.json para ${ano}:`, erro);
            return [];
        }
    }

    // Função para carregar dados JSON
    async function carregarDadosJSON(caminho) {
        try {
            const resposta = await fetch(caminho);
            if (!resposta.ok) throw new Error("Erro ao carregar JSON.");
            return await resposta.json();
        } catch (erro) {
            console.error(`Erro ao carregar o arquivo JSON: ${caminho}`, erro);
            return [];
        }
    }

    // Função para formatar o título do gráfico
    function formatarTitulo(nomeArquivo) {
        let titulo = nomeArquivo.replace(".json", "").replace(/_/g, " ");
        return titulo.charAt(0).toUpperCase() + titulo.slice(1);
    }

    // Função para gerar HTML do gráfico
    function gerarGraficoHTML(titulo) {
        const canvasId = titulo.replace(/[^a-zA-Z0-9]/g, "_");
        return `
            <div class="chart-container">
                <h4>${titulo}</h4>
                <canvas id="${canvasId}"></canvas>
            </div>
        `;
    }

    // Função para gerar os gráficos com Chart.js
    function gerarGrafico(canvasId, dados, titulo) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas não encontrado para: ${canvasId}`);
            return;
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.map(item => item.Categoria || item.Tipo || "Sem Nome"),
                datasets: [{
                    label: titulo,
                    data: dados.map(item => item.Quantidade || item.Valor || 0),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Função para carregar dados e gerar gráficos
    async function carregarDadosAno(ano) {
        graficosContainer.innerHTML = `<p class="text-muted">Carregando estatísticas para ${ano}...</p>`;

        try {
            const arquivosJSON = await carregarArquivosDisponiveis(ano);
            let conteudoGraficos = "";

            for (const arquivoJSON of arquivosJSON) {
                const caminhoArquivo = `${caminhoBase}${ano}/${arquivoJSON}`;
                const dados = await carregarDadosJSON(caminhoArquivo);

                if (dados.length === 0) {
                    console.warn(`Arquivo JSON vazio ou com erro: ${caminhoArquivo}`);
                    continue;
                }

                const tituloGrafico = formatarTitulo(arquivoJSON);
                conteudoGraficos += gerarGraficoHTML(tituloGrafico);
                gerarGrafico(tituloGrafico.replace(/[^a-zA-Z0-9]/g, "_"), dados, tituloGrafico);
            }

            graficosContainer.innerHTML = conteudoGraficos;
        } catch (erro) {
            console.error("Erro ao carregar os dados:", erro);
            graficosContainer.innerHTML = `<p class="text-danger">Erro ao carregar estatísticas.</p>`;
        }
    }

    // Função principal
    async function main() {
        const anosDisponiveis = await carregarAnosDisponiveis();
        const anoMaisRecente = anosDisponiveis.length > 0 ? Math.max(...anosDisponiveis.map(ano => parseInt(ano))) : null;

        if (anoMaisRecente && !isNaN(anoMaisRecente)) {
            await carregarDadosAno(anoMaisRecente);
        } else {
            graficosContainer.innerHTML = `<p class="text-danger">Nenhum ano válido encontrado.</p>`;
        }
    }

    // Inicializa o processo
    main();
});