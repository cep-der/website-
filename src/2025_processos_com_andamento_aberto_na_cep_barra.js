
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('2025_processos_com_andamento_aberto_na_cep_barra').getContext('2d');
    let grafico;

    const csvUrl = 'https://raw.githubusercontent.com/cep-der/website-/main/data/data_stat/2025/estatisticas_da_unidade_SEIPro_processos_com_andamento_aberto_na_cep.csv';
    
    const colunasRemover = ['TOTAL'];
    const linhasRemover = ['TOTAL:'];

    function removerLinhasEColunas(data, colunasRemover, linhasRemover) {
        return data.filter(row => !linhasRemover.includes(row.Tipo))
                   .map(row => {
                        colunasRemover.forEach(col => delete row[col]);
                        return row;
                    });
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

                data = removerLinhasEColunas(data, colunasRemover, linhasRemover);

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

    function criarLegendaPersonalizada(containerId, labels, cores) {
        const container = document.getElementById(containerId);
        if (!container) return;
    
        const metade = Math.ceil(labels.length / 2);
        const grupo1 = labels.slice(0, metade);
        const grupo2 = labels.slice(metade);
        const coresGrupo1 = cores.slice(0, metade);
        const coresGrupo2 = cores.slice(metade);
    
        const legendaHTML = `
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; width: 100%; margin-top: 5px;">
                <div style="display: flex; flex-direction: column; min-width: 45%; max-width: 50%; padding-right: 5px;">
                    ${grupo1.map((label, index) => `
                        <div style="display: flex; align-items: center; margin-bottom: 3px;">
                            <span style="display: inline-block; width: 12px; height: 12px; background-color: ${coresGrupo1[index]}; margin-right: 5px; border-radius: 3px;"></span>
                            <span style="font-size: 10px;">${label}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; flex-direction: column; min-width: 45%; max-width: 50%;">
                    ${grupo2.map((label, index) => `
                        <div style="display: flex; align-items: center; margin-bottom: 3px;">
                            <span style="display: inline-block; width: 12px; height: 12px; background-color: ${coresGrupo2[index]}; margin-right: 5px; border-radius: 3px;"></span>
                            <span style="font-size: 10px;">${label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    
        container.innerHTML = legendaHTML;
    }
    
    function criarGrafico(data) {
        const labels = Object.keys(data[0]).filter(key => key !== 'Tipo');
        const tipos = data.map(row => row.Tipo).filter(tipo => tipo);

        const coresUnicas = [
            'rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
            'rgba(255, 0, 0, 0.7)', 'rgba(0, 255, 0, 0.7)', 'rgba(0, 0, 255, 0.7)',
            'rgba(128, 0, 128, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(0, 128, 128, 0.7)'
        ];

        const datasets = tipos.map((tipo, index) => ({
            label: tipo,
            data: labels.map(label => data[index][label] || 0),
            backgroundColor: coresUnicas[index % coresUnicas.length],
            borderColor: coresUnicas[index % coresUnicas.length].replace('0.7', '1'),
            borderWidth: 1,
            borderRadius: 5,
            barThickness: 40,
            categoryPercentage: 1, // Deixa as colunas encostadas no eixo X
            barPercentage: 1,
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
                        text: 'Processos com andamento aberto em 2025',
                        font: { size: 18 }
                    },
                    legend: {
                        display: false
                    }
                },
                layout: {
                    padding: {
                        bottom: 40
                    }
                },
                scales: {
                    x: {
                        display: true,
                        offset: true,
                        stacked: false,
                        ticks: {
                            display: false
                        }
                    },
                    y: {
                        stacked: false,
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
                }
            }
        });

        criarLegendaPersonalizada('legenda-container', tipos, coresUnicas);
    }

    carregarDadosCSV(csvUrl, criarGrafico);
});
