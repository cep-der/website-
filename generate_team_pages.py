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

# Tentativa de abrir o CSV com codificação alternativa
try:
    df = pd.read_csv(csv_path, encoding="ISO-8859-1")  # Alternativamente, tente "latin1" se necessário
    print("Arquivo CSV carregado com sucesso!")
except Exception as e:
    print(f"Erro ao carregar o arquivo CSV: {e}")
    exit()

# Carregar o template HTML
with open(html_template_path, "r", encoding="utf-8") as file:
    template_html = file.read()

# Função para substituir os dados e criar novas páginas
def generate_html_files():
    for _, row in df.iterrows():
        new_html = template_html
        
        # Substituir os campos no HTML
        new_html = new_html.replace("Vinicius do Prado Capanema", row["NOME"])
        new_html = new_html.replace("Especialista em geoprocessamento", row["CARGO"])
        new_html = new_html.replace("Pesquisa", row["ÁREA DE ATUAÇÃO"])
        new_html = new_html.replace("Bacharelado em Engenharia Florestal (UNEMAT)", row["FORMAÇAO"])
        new_html = new_html.replace("Vinicius do Prado Capanema é Especialista em geoprocessamento, atuando na área de Pesquisa. Possui formação em Bacharelado em Engenharia Florestal (UNEMAT), Especialização em Georreferenciamento de Imóveis Rurais (AJES), MBA em Gestão de Projetos (UNOPAR), Mestrado em  Sensoriamento Remoto (INPE) e Doutorado em Sensoriamento Remoto (INPE).", row["BIO"])
        
        # Remover as informações extras da formação e biografia
        new_html = new_html.replace("<p style=\"font-weight: bold;font-size: 20px;\">Especialização em Georreferenciamento de Imóveis Rurais (AJES)</p>", "")
        new_html = new_html.replace("<p style=\"font-weight: bold;font-size: 20px;\">MBA em Gestão de Projetos (UNOPAR)</p>", "")
        new_html = new_html.replace("<p style=\"font-weight: bold;font-size: 20px;\">Mestrado em  Sensoriamento Remoto (INPE)</p>", "")
        new_html = new_html.replace("<p style=\"font-weight: bold;font-size: 20px;\">Doutorado em Sensoriamento Remoto (INPE)</p>", "")
        new_html = new_html.replace("<p style=\"text-align: justify;font-size: 20px;\">Com formação multidisciplinar, atua de maneira integrada na pesquisa, desenvolvimento e inovação na área de infraestrutura rodoviária...", "")

        # Definir o nome do arquivo
        file_name = f"{row['NOME'].lower().replace(' ', '_')}.html"
        file_path = os.path.join(output_dir, file_name)
        
        # Salvar o novo HTML
        with open(file_path, "w", encoding="utf-8") as new_file:
            new_file.write(new_html)
        print(f"Página gerada: {file_path}")

# Executar a função para gerar os arquivos
generate_html_files()
