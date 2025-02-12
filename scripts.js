document.addEventListener("DOMContentLoaded", async function () {
    /* =======================
       1. CONFIGURAÇÕES INICIAIS
    ======================= */
    
    const BASE_URL = "https://raw.githubusercontent.com/cep-der/website-/main/data/data_stat/2023/";
    const anoDados = BASE_URL.split("/").slice(-2, -1)[0]; // Obtém o ano da pasta onde os CSVs estão armazenados

    const csvURLs = [
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_andamento_aberto_na_unidade.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_andamento_fechado_na_unidade.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_com_tramitacao.csv`,
        `${BASE_URL}estatisticas_da_unidade_SEIPro_processos_gerados.csv`
    ];

    /* =======================
       2. FUNÇÃO PARA CARREGAR CSV
    ======================= */

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

    /* =======================
       3. FUNÇÃO PARA PROCESSAR CSV
    ======================= */

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

    /* =======================
       4. FUNÇÃO PRINCIPAL
    ======================= */

    async function main() {
        console.log("🔍 Iniciando carregamento dos dados...");
        for (let i = 0; i < csvURLs.length; i++) {
            const csvTexto = await carregarDadosCSV(csvURLs[i]);
            const dados = processarCSV(csvTexto);
            console.log(`📊 Dados processados para "${csvURLs[i]}":`, dados);
        }
        console.log("✅ Todos os dados foram carregados.");
    }

    main();
});
