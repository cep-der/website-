
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('2025_tempo_medio_tramitacao_barra').getContext('2d');
    let grafico;

    const csvUrl = 'https://raw.githubusercontent.com/cep-der/website-/main/data/data_stat/2025/estatisticas_da_unidade_SEIPro_tempo_medio_tramitacao.csv';

    function converterParaDias(duracao) {
        const partes = duracao.split(' ');
        let dias = parseInt(partes[0]) || 0;

        if (partes.length > 1) {
            const [horas, minutos, segundos] = partes[1].split(':').map(n => parseInt(n) || 0);
            dias += horas / 24 + minutos / 1440 + segundos / 86400;
        }

        return dias;
    }

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
                    if (row.Tipo && row.Duração) {
                        row.Duração = converterParaDias(row.Duração);
                    }
                    return row;
                });

                data.sort((a, b) => b.Duração - a.Duração);

                callback(data);
            },
            error: function (error) {
                console.error('Erro ao processar o arquivo CSV:', error);
            }
        });
    }

    function criarGrafico(data) {
        const labels = data.map(row => row.Tipo);
        const valores = data.map(row => row.Duração);

        if (grafico) {
            grafico.destroy();
        }

        grafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Duração Média (dias)',
                    data: valores,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    barThickness: 'flex',
                    maxBarThickness: 30
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tempo Médio de Tramitação dos Processos (Atualizado)',
                        font: { size: 18 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: { size: 12 },
                            boxWidth: 20,
                            padding: 8
                        }
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: (tooltipItem) => ` ${tooltipItem.raw.toFixed(2)} dias`
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Duração (dias)',
                            font: { size: 14 }
                        },
                        ticks: {
                            stepSize: 5
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Processo',
                            font: { size: 14 }
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 0,
                            font: { size: 12 }
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        bottom: 30
                    }
                }
            }
        });
    }

    carregarDadosCSV(csvUrl, criarGrafico);
});
