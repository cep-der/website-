document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('graficoColunaEmpilhada').getContext('2d');
    let graficoColunaEmpilhada;

    // URL do CSV (substitua para cada novo gráfico conforme necessário)
    const csvUrl = 'https://raw.githubusercontent.com/cep-der/website-/main/data/data_stat/2023/estatisticas_da_unidade_SEIPro_processos_gerados.csv'; 

    // 🔹 Definição das colunas e linhas que podem ser excluídas
    const colunasParaExcluir = ["TOTAL", "Ago"]; // Defina aqui quais colunas não devem ser consideradas
    const linhasParaExcluir = ["TOTAL:"]; // Defina aqui quais linhas (Tipos) não devem ser consideradas

    const coresFixas = [
        'rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'
    ];

    // 🔹 Função para extrair o título do gráfico do nome do arquivo CSV e da pasta
    function gerarTitulo(csvUrl) {
        const partesUrl = csvUrl.split('/');
        const ano = partesUrl[partesUrl.length - 2]; // Ano da pasta
        const nomeArquivo = partesUrl[partesUrl.length - 1]; // Nome do arquivo

        // Extrai o texto entre "SEIPro_" e ".csv"
        const nomeProcesso = nomeArquivo.match(/SEIPro_(.*?)\.csv/);
        let tituloFormatado = "Estatísticas de Processos";

        if (nomeProcesso && nomeProcesso[1]) {
            tituloFormatado = nomeProcesso[1]
                .replace(/_/g, ' ')  // Substitui "_" por espaço
                .toLowerCase()        // Converte para minúsculas
                .replace(/\b\w/g, c => c.toUpperCase()); // Primeira letra maiúscula
        }

        return `${tituloFormatado} - ${ano}`;
    }

    function carregarDadosCSV(url, callback) {
        Papa.parse(url, {
            download: true, 
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                let data = results.data;

                data = data.map(row => {
                    colunasParaExcluir.forEach(col => delete row[col]);
                    return row;
                });

                data = data.filter(row => row.Tipo && !linhasParaExcluir.includes(row.Tipo));

                callback(data);
            },
            error: function (error) {
                console.error('Erro ao processar o arquivo CSV:', error);
            }
        });
    }

    function criarGrafico(data) {
        const labels = Object.keys(data[0]).filter(key => key !== 'Tipo');
        const tipos = data.map(row => row.Tipo).filter(tipo => tipo);

        const datasets = tipos.map((tipo, index) => ({
            label: tipo,
            data: labels.map(label => data[index][label] || 0),
            backgroundColor: coresFixas[index % coresFixas.length],
            borderColor: coresFixas[index % coresFixas.length].replace('0.7', '1'),
            borderWidth: 1,
            borderRadius: 5 // 🔹 Bordas arredondadas para um efeito moderno
        }));

        if (graficoColunaEmpilhada) {
            graficoColunaEmpilhada.destroy();
        }

        graficoColunaEmpilhada = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: gerarTitulo(csvUrl), // 🔹 Usa o título gerado dinamicamente
                        font: { size: 18 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom', // 🔹 Mantém a legenda abaixo do gráfico
                        align: 'start', // 🔹 Alinha a legenda à esquerda
                        labels: {
                            font: { size: 14 },
                            boxWidth: 20, // Ajuste do tamanho dos quadrados de cor
                            padding: 10
                        }
                    },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Período',
                            font: { size: 14 }
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Quantidade',
                            font: { size: 14 }
                        },
                        ticks: {
                            stepSize: 1
                        },
                        suggestedMax: Math.max(...datasets.flatMap(d => d.data)) * 1.1 // 🔹 Ajuste para espaçamento no topo
                    }
                }
            }
        });
    }

    carregarDadosCSV(csvUrl, criarGrafico);
});