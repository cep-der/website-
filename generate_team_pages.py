import os
import pandas as pd
import re

# Definições de caminhos
TEMPLATE_PATH = "src/pages/vinicius_capanema.html"
OUTPUT_DIR = "src/pages/"
CSV_PATH = "data/EQUIPE_CEP_BIO.csv"

# Carregar os dados do CSV
df = pd.read_csv(CSV_PATH, delimiter=';', encoding='utf-8')

# Transpor o dataframe para facilitar o acesso por chave
df = df.set_index(df.columns[0]).transpose()

# Criar diretório de saída se não existir
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Iterar sobre os colaboradores (ignorando a primeira linha que contém os títulos)
for _, row in df.iterrows():
    nome_completo = row.get("NOME", "")
    if not nome_completo:
        continue
    
    partes_nome = nome_completo.split()
    nome_arquivo = f"{partes_nome[0].lower()}_{partes_nome[-1].lower()}.html"
    output_path = os.path.join(OUTPUT_DIR, nome_arquivo)
    
    # Ler o template
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as file:
        conteudo = file.read()
    
    # Atualizar nome e imagem do colaborador
    imagem_nome = partes_nome[0].upper() + ".jpg"
    conteudo = conteudo.replace("Vinicius do Prado Capanema", nome_completo)
    conteudo = conteudo.replace("VINICIUS.jpg", imagem_nome)
    
    # Substituir a área de atuação
    conteudo = re.sub(
        r"<section id=\"area de atuacao\" class=\"py-5 text-start\">.*?<p style=\"text-align: justify;font-size: 20px;\">.*?</p>",
        f"<section id=\"area de atuacao\" class=\"py-5 text-start\"><div class='container section-box'><h2 class='text-start mb-4'>ÁREA DE ATUAÇÃO</h2><p style=\"text-align: justify;font-size: 20px;\">{row.get('ÁREA DE ATUAÇÃO', '')}</p></div></section>",
        conteudo,
        flags=re.DOTALL
    )
    
    # Substituir a formação acadêmica
    formacoes = row.get("FORMACAO", "").split("|")
    formacao_html = "\n".join([f"<p style=\"text-align: justify;font-size: 20px;\">{f.strip()}</p>" for f in formacoes if f.strip()])
    conteudo = re.sub(
        r"<section id=\"formacao academica\" class=\"py-5 text-start\">.*?<h2 class=\"text-start mb-4\">FORMAÇÃO ACADÊMICA</h2>.*?</div>",
        f"<section id=\"formacao academica\" class=\"py-5 text-start\"><div class='container section-box'><h2 class='text-start mb-4'>FORMAÇÃO ACADÊMICA</h2>{formacao_html}</div></section>",
        conteudo,
        flags=re.DOTALL
    )
    
    # Substituir a biografia
    conteudo = re.sub(
        r"<section id=\"biografia\" class=\"py-5 text-start\">.*?<p></p>",
        f"<section id=\"biografia\" class=\"py-5 text-start\"><div class='container section-box'><h2 class='text-start mb-4'>BIOGRAFIA</h2><p>{row.get('BIO', '')}</p></div></section>",
        conteudo,
        flags=re.DOTALL
    )
    
    # Criar a seção de contato
    contato = f"""
    <section id=\"contato\" class=\"py-5 text-start\">
        <div class='container section-box'>
            <h2 class='text-start mb-4'>CONTATO</h2>
            <p>TELEFONE: (11) 3311-1400 / RAMAL: {row.get('RAMAL', '')}</p>
            <p>E-MAIL: {row.get('EMAIL', '')}</p>
            <p>LinkedIn: {row.get('URL LI', '')}</p>
            <p>Lattes: {row.get('Lattes', '')}</p>
            <p>ORCID: {row.get('ORCID', '')}</p>
        </div>
    </section>
    """
    conteudo = re.sub(
        r"<section id=\"contato\" class=\"py-5 text-start\">.*?</section>", contato, conteudo, flags=re.DOTALL
    )
    
    # Escrever a nova página
    with open(output_path, "w", encoding="utf-8") as file:
        file.write(conteudo)
    
    print(f"Página criada: {output_path}")
