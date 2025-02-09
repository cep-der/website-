const fs = require("fs");
const path = require("path");
const csv = require("csvtojson");

const caminhoBase = path.join(__dirname, "data/data_stat/");

// Função para listar subpastas (anos) no diretório
function listarSubpastas() {
    return fs.readdirSync(caminhoBase, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

// Função para salvar anos_disponiveis.json
function salvarAnosDisponiveis(anos) {
    const caminhoArquivo = path.join(caminhoBase, "anos_disponiveis.json");
    fs.writeFileSync(caminhoArquivo, JSON.stringify(anos, null, 2));
    console.log(`Arquivo ${caminhoArquivo} atualizado com os anos: ${anos.join(", ")}`);
}

// Função para listar arquivos CSV em uma subpasta
function listarArquivosCSV(ano) {
    const caminhoAno = path.join(caminhoBase, ano);
    return fs.readdirSync(caminhoAno)
        .filter(arquivo => arquivo.endsWith(".csv"))
        .map(arquivo => arquivo);
}

// Função para converter CSV para JSON
async function converterCSVparaJSON(ano, arquivoCSV) {
    const caminhoCSV = path.join(caminhoBase, ano, arquivoCSV);
    const caminhoJSON = path.join(caminhoBase, ano, arquivoCSV.replace(".csv", ".json"));

    try {
        const jsonArray = await csv().fromFile(caminhoCSV);
        fs.writeFileSync(caminhoJSON, JSON.stringify(jsonArray, null, 2));
        console.log(`Arquivo ${caminhoJSON} gerado com sucesso.`);
        return arquivoCSV.replace(".csv", ".json");
    } catch (erro) {
        console.error(`Erro ao converter ${caminhoCSV} para JSON:`, erro);
        return null;
    }
}

// Função para salvar arquivos_disponiveis.json
function salvarArquivosDisponiveis(ano, arquivos) {
    const caminhoArquivo = path.join(caminhoBase, ano, "arquivos_disponiveis.json");
    fs.writeFileSync(caminhoArquivo, JSON.stringify(arquivos, null, 2));
    console.log(`Arquivo ${caminhoArquivo} atualizado com os arquivos: ${arquivos.join(", ")}`);
}

// Função principal
async function main() {
    // Lista as subpastas (anos)
    const subpastas = listarSubpastas();
    salvarAnosDisponiveis(subpastas);

    // Para cada subpasta (ano)
    for (const ano of subpastas) {
        // Lista os arquivos CSV
        const arquivosCSV = listarArquivosCSV(ano);
        const arquivosJSON = [];

        // Converte cada CSV para JSON
        for (const arquivoCSV of arquivosCSV) {
            const nomeJSON = await converterCSVparaJSON(ano, arquivoCSV);
            if (nomeJSON) {
                arquivosJSON.push(nomeJSON);
            }
        }

        // Salva arquivos_disponiveis.json
        salvarArquivosDisponiveis(ano, arquivosJSON);
    }
}

// Executa o script
main();