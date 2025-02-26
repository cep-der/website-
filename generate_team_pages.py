import pandas as pd
import os

# Caminhos dos arquivos
csv_path = "/workspaces/website-/EQUIPE_CEP_BIO_updated_webpage.csv"
html_template_path = "/workspaces/website-/src/pages/vinicius_capanema.html"
output_dir = "/workspaces/website-/src/pages/"

# Verifica se o arquivo CSV existe antes de tentar abrir
if not os.path.exists(csv_path):
    print(f"Erro: O arquivo {csv_path} não foi encontrado!")
    exit()

# Tenta carregar o CSV usando encoding que lide com BOM
try:
    df = pd.read_csv(csv_path, encoding="utf-8-sig", on_bad_lines='skip', sep=None, engine="python")
    # Remove espaços extras e o BOM dos nomes das colunas
    df.columns = [col.strip().replace('\ufeff', '') for col in df.columns]
    print("Arquivo CSV carregado com sucesso!")
    print(f"Colunas detectadas no CSV: {df.columns.tolist()}")
except Exception as e:
    print(f"Erro ao carregar o arquivo CSV: {e}")
    exit()

# Verifica se o template HTML existe
if not os.path.exists(html_template_path):
    print(f"Erro: O arquivo de template {html_template_path} não foi encontrado!")
    exit()

# Carregar o template HTML
with open(html_template_path, "r", encoding="utf-8") as file:
    template_html = file.read()

# Mapeamento de colunas esperadas no CSV para os placeholders no HTML
# (Ajuste os nomes conforme aparecem corretamente no CSV)
column_map = {
    "NOME": "Vinicius do Prado Capanema",
    "CARGO": "Especialista em geoprocessamento",
    "ÁREA DE ATUAÇÃO": "Pesquisa",
    "FORMAÇÃO": "Bacharelado em Engenharia Florestal (UNEMAT)",
    "BIO": "Vinicius do Prado Capanema é Especialista em geoprocessamento, atuando na área de Pesquisa. Possui formação em Bacharelado em Engenharia Florestal (UNEMAT), Especialização em Georreferenciamento de Imóveis Rurais (AJES), MBA em Gestão de Projetos (UNOPAR), Mestrado em Sensoriamento Remoto (INPE) e Doutorado em Sensoriamento Remoto (INPE)."
}

# Verifica se a coluna "NOME" está presente
if "NOME" not in df.columns:
    print("Erro: A coluna 'NOME' não foi encontrada no CSV. Verifique se o nome está correto.")
    exit()

# Função para substituir os dados e criar novas páginas
def generate_html_files():
    for _, row in df.iterrows():
        new_html = template_html

        # Substituir os campos no HTML com os valores do CSV, se existirem e não forem NaN
        for col, placeholder in column_map.items():
            if col in df.columns and pd.notna(row[col]):
                new_html = new_html.replace(placeholder, str(row[col]))

        # Gerar nome do arquivo baseado no nome da pessoa, evitando sobrescrita
        nome_formatado = row["NOME"].lower().replace(' ', '_').replace(',', '').replace('.', '').replace('-', '_')
        file_name = f"{nome_formatado}.html"
        file_path = os.path.join(output_dir, file_name)

        # Salvar o novo HTML
        with open(file_path, "w", encoding="utf-8") as new_file:
            new_file.write(new_html)

        print(f"Página gerada: {file_path}")

# Executar a função para gerar os arquivos
generate_html_files()
