
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('2023_processos_com_tramitacao_barra').getContext('2d');
    let grafico;

    const csvUrl = 'data/data_stat/2023/estatisticas_da_unidade_SEIPro_processos_com_tramitacao.csv';

    function carregarDadosCSV(url, callback) {
        Papa.parse(url, {
            download: true, 
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                let data = results.data;

                if (data.length === 0) {
                    console.error('Nenhum dado encontrado no arquivo:', url);
                    return;
                }

                data = data.map(row => {
                    if (row.Tipo) {
                        row.Tipo = row.Tipo.replace(/^DER: FAIXA - /, '');
                    }
                    return row;
                });

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

        const coresFixas = [
            'rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'
        ];

        const datasets = tipos.map((tipo, index) => ({
            label: tipo,
            data: labels.map(label => data[index][label] || 0),
            backgroundColor: coresFixas[index % coresFixas.length],
            borderColor: coresFixas[index % coresFixas.length].replace('0.7', '1'),
            borderWidth: 1,
            borderRadius: 5,
            barThickness: 'flex',
            maxBarThickness: 80,
            categoryPercentage: 0.8,
            barPercentage: 0.9,
            animation: {
                duration: 1000,
                easing: 'easeOutBounce'
            }
        }));

        if (grafico) {
            grafico.destroy();
        }

        grafico = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '2023 PROCESSOS COM TRAMITACAO',
                        font: { size: 18 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'start',
                        labels: {
                            font: (context) => {
                                let width = context.chart.width;
                                let size = Math.round(width / 35);
                                return { size: size > 16 ? 16 : size };
                            },
                            boxWidth: 25,
                            boxHeight: 12,
                            padding: 8
                        }
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            title: (tooltipItems) => tooltipItems[0].dataset.label,
                            label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}`
                        }
                    }
                },
                scales: {
                    x: {
                        display: false,
                        offset: true
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
                        suggestedMax: Math.max(...datasets.flatMap(d => d.data)) * 1.1
                    }
                },
                layout: {
                    padding: {
                        bottom: 30
                    }
                }
            }
        });
    }

    carregarDadosCSV(csvUrl, criarGrafico);
});
        