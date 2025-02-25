document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('graficoBarra').getContext('2d');
    let graficoBarra;

    const csvUrl = 'https://raw.githubusercontent.com/cep-der/website-/main/data/data_stat/2023/estatisticas_da_unidade_SEIPro_processos_com_andamento_aberto_na_unidade.csv'; 

    const colunasParaExcluir = ["TOTAL"];
    const linhasParaExcluir = ["TOTAL:"];

    const coresFixas = [
        'rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'
    ];

    // 🔹 Função para extrair o título do gráfico do nome do arquivo CSV e da pasta
    function gerarTitulo(csvUrl) {
        const partesUrl = csvUrl.split('/');
        const ano = partesUrl[partesUrl.length - 2]; // Ano da pasta
        const nomeArquivo = partesUrl[partesUrl.length - 1]; // Nome do arquivo

        const nomeProcesso = nomeArquivo.match(/SEIPro_(.*?)\.csv/);
        let tituloFormatado = "Estatísticas de Processos";

        if (nomeProcesso && nomeProcesso[1]) {
            tituloFormatado = nomeProcesso[1]
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase()); 
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
        let tipos = data.map(row => row.Tipo).filter(tipo => tipo);

        // 🔹 Remover "DER: FAIXA -" do nome dos tipos de processo
        tipos = tipos.map(tipo => tipo.replace(/^DER: FAIXA - /, ''));

        const datasets = tipos.map((tipo, index) => ({
            label: tipo,
            data: labels.map(label => data[index][label] || 0),
            backgroundColor: coresFixas[index % coresFixas.length],
            borderColor: coresFixas[index % coresFixas.length].replace('0.7', '1'),
            borderWidth: 1,
            borderRadius: 5, // 🔹 Bordas arredondadas para um efeito moderno
            barThickness: 10, //'flex', // 🔹 Ajusta automaticamente ao tamanho do gráfico
            maxBarThickness: 90,  // 🔹 Define um limite para evitar barras gigantes
            categoryPercentage: 0.4, // 🔹 Controla espaçamento entre categorias
            barPercentage: 0.1, // 🔹 Controla o espaçamento interno das barras
            animation: {
                duration: 1000, // 🔹 Animação suave ao carregar
                easing: 'easeOutBounce' // 🔹 Efeito elástico para suavidade
            }
        }));

        if (graficoBarra) {
            graficoBarra.destroy();
        }

        graficoBarra = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: gerarTitulo(csvUrl), 
                        font: { size: 18 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'start', // 🔹 Alinha a legenda à esquerda
                        labels: {
                            font: (context) => {
                                let width = context.chart.width;
                                let size = Math.round(width / 35); // 🔹 Fonte dinâmica para a legenda
                                return { size: size > 16 ? 16 : size }; // Máximo 16px
                            },
                            boxWidth: 25,    // 🔹 Mantém a integridade dos retângulos da legenda
                            boxHeight: 12,   // 🔹 Ajusta o tamanho do símbolo para retângulo
                            padding: 8       // 🔹 Espaço entre os elementos da legenda
                        }
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            title: (tooltipItems) => tooltipItems[0].dataset.label, // 🔹 Exibe o tipo do processo
                            label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}` // 🔹 Formato "Nome do tipo: valor"
                        }
                    }
                },
                scales: {
                    x: {
                        display: false, // 🔹 Remove o nome do eixo X
                        offset: true // 🔹 Aproxima a primeira barra do eixo Y
                    },
                    y: {
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
                },
                layout: {
                    padding: {
                        bottom: 30  // 🔹 Define o espaço entre o eixo X e a legenda
                    }
                }
            }
        });
    }

    carregarDadosCSV(csvUrl, criarGrafico);
});