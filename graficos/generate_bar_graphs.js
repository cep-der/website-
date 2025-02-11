const fs = require('fs');
const path = require('path');

const pastaCSV = 'data/data_stat/2025';
const arquivoExcluido = 'estatisticas_da_unidade_SEIPro_processos_gerados_no_periodo.csv'; // Arquivo já usado para colunas empilhadas
const pastaSaida = 'graficos';

// 🔹 Garante que a pasta de saída exista
if (!fs.existsSync(pastaSaida)) {
    fs.mkdirSync(pastaSaida);
}

// 🔹 Lê todos os arquivos CSV na pasta
fs.readdir(pastaCSV, (err, files) => {
    if (err) {
        console.error('Erro ao ler a pasta:', err);
        return;
    }

    // 🔹 Filtra os arquivos CSV excluindo o que já foi usado
    const arquivosCSV = files.filter(file => file.endsWith('.csv') && file !== arquivoExcluido);

    // 🔹 Gera um arquivo `.js` para cada CSV encontrado
    arquivosCSV.forEach(arquivo => {
        const match = arquivo.match(/SEIPro_(.*?)\.csv/); // Extrai o nome após "SEIPro_" e antes de ".csv"
        if (!match) return;

        const nomeExtraido = match[1].replace(/_/g, ' '); // Remove os "_" e substitui por espaços
        const nomeID = match[1].replace(/_/g, '_'); // Mantém "_" para IDs HTML e nomes de arquivos
        const ano = pastaCSV.split('/').pop(); // Obtém o ano da pasta (ex: "2023")
        const nomeArquivoJS = `${pastaSaida}/${ano}_${nomeID}_barra.js`; // Nome final do arquivo JS

        const caminhoCSV = `${pastaCSV}/${arquivo}`;

        // 🔹 Código modelo para criar o gráfico baseado no CSV
        const codigoGrafico = `
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('${ano}_${nomeID}_barra').getContext('2d');
    let grafico;

    const csvUrl = '${caminhoCSV}';

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
                        text: '${ano} ${nomeExtraido.toUpperCase()}',
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
                            label: (tooltipItem) => \`\${tooltipItem.dataset.label}: \${tooltipItem.raw}\`
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
        `;

        // 🔹 Escreve o arquivo JS na pasta de saída
        fs.writeFileSync(nomeArquivoJS, codigoGrafico, 'utf8');
        console.log(`✔ Arquivo gerado: ${nomeArquivoJS}`);
    });
});
