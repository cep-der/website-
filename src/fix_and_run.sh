#!/bin/bash

# Criar a pasta pages se não existir
mkdir -p /workspaces/website-/src/pages

# Mover o template para o local correto
mv -f /workspaces/website-/pages/template_subpagina.html /workspaces/website-/src/pages/

# Ajustar caminho do CSS no template
sed -i 's|href="styles.css"|href="/styles.css"|g' /workspaces/website-/src/pages/template_subpagina.html

# Iniciar o servidor Live Server
cd /workspaces/website-/src
npx live-server --port=5500 --host=0.0.0.0

