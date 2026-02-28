# Configuração de Variáveis de Ambiente no Netlify

O erro de rede ocorre porque o seu site no Netlify não sabe qual é o endereço do seu banco de dados (Nhost). Você precisa configurar as variáveis de ambiente para conectar o frontend ao backend.

## Passo a Passo

1. **Acesse o Painel do Nhost:**
   - Vá para o seu projeto em [app.nhost.io](https://app.nhost.io).
   - No menu lateral, clique em **Settings** (Configurações).
   - Clique em **General**.
   - Copie o **Subdomain** (ex: `eu-west-2` ou um código alfanumérico) e a **Region** (ex: `sa-east-1`).

2. **Acesse o Painel do Netlify (onde você tirou o print):**
   - Clique no botão azul **"Add a variable"**.
   - Escolha a opção **"Add a single variable"** (ou similar).

3. **Adicione as seguintes variáveis:**

   | Key (Chave) | Value (Valor) |
   | :--- | :--- |
   | `VITE_NHOST_SUBDOMAIN` | *Cole o Subdomain copiado do Nhost* |
   | `VITE_NHOST_REGION` | *Cole a Region copiada do Nhost* |

   *Exemplo:*
   - Key: `VITE_NHOST_SUBDOMAIN`
   - Value: `hdsjkhsdkjhsdjk`

   - Key: `VITE_NHOST_REGION`
   - Value: `sa-east-1`

4. **Redeploy (Importante):**
   - Após salvar as variáveis, elas **não** funcionam imediatamente no site que já está no ar.
   - Vá para a aba **Deploys** no menu lateral do Netlify.
   - Clique no botão **"Trigger deploy"** e selecione **"Deploy site"**.
   - Aguarde o processo terminar.

## Por que isso acontece?
O código do site usa `import.meta.env.VITE_NHOST_SUBDOMAIN`. Quando roda no seu computador, ele lê do arquivo `.env`. No Netlify, ele precisa ler dessas configurações que você acabou de adicionar. Sem elas, o site tenta conectar em um endereço inválido, gerando o "Erro de rede".
