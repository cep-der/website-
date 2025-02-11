document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('graficoColunaEmpilhada').getContext('2d');
    let graficoColunaEmpilhada;

    const csvUrl = 'https://raw.githubusercontent.com/cep-der/website-/main/data/data_stat/2023/estatisticas_da_unidade_SEIPro_processos_gerados.csv'; // Caminho local

    // Usar PapaParse para carregar o arquivo CSV
    Papa.parse(csvUrl, {
        download: true, // Baixa o arquivo CSV
        header: true, // Assume a primeira linha como cabeçalho
        dynamicTyping: true, // Converte strings para números automaticamente
        complete: function (results) {
            const data = results.data; // Dados do CSV
            const labels = Object.keys(data[0]).filter(key => key !== 'Tipo'); // Extrai os rótulos (eixo X)
            const tipos = data.map(row => row.Tipo); // Extrai os tipos (legenda)

            // Cria os datasets para o gráfico
            const datasets = tipos.map((tipo, index) => {
                return {
                    label: tipo, // Legenda
                    data: labels.map(label => data[index][label]), // Dados para cada tipo
                    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`, // Cor aleatória
                    borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`, // Cor da borda
                    borderWidth: 1 // Largura da borda
                };
            });

            // Destrói o gráfico anterior, se existir
            if (graficoColunaEmpilhada) {
                graficoColunaEmpilhada.destroy();
            }

            // Cria o gráfico com os dados do CSV
            graficoColunaEmpilhada = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels, // Rótulos do eixo X
                    datasets: datasets // Dados e legendas
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Estatísticas de Processos por Tipo' // Título do gráfico
                        },
                        legend: {
                            display: true,
                            position: 'bottom', // Legenda abaixo do gráfico
                            labels: {
                                font: {
                                    size: 12 // Tamanho da fonte da legenda
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true, // Barras empilhadas no eixo X
                            title: {
                                display: true,
                                text: 'Período' // Título do eixo X
                            }
                        },
                        y: {
                            stacked: true, // Barras empilhadas no eixo Y
                            title: {
                                display: true,
                                text: 'Quantidade' // Título do eixo Y
                            }
                        }
                    }
                }
            });
        },
        error: function (error) {
            console.error('Erro ao processar o arquivo CSV:', error);
        }
    });
});