# Site de venda: sites, landing pages e IA

Feito em Next.js, Tailwind CSS e Motion (animações).

## O que o site faz

| Recurso | Onde fica |
|---|---|
| Página de vendas com planos e calculadora | `/` |
| Diagnóstico de 30s que captura o lead e gera proposta na hora | `/#diagnostico` |
| Galeria de modelos prontos com demonstração ao vivo | `/modelos` |
| Páginas por nicho para Google e anúncios ("Site para hamburguerias"...) | `/para/<nicho>` |
| Proposta personalizada, assinada e com botão "Salvar em PDF" | `/proposta?...` |
| Gerador de propostas e de "antes × depois" (só com a sua chave) | `/proposta/nova` |
| Página de resultado depois da entrega | `/resultado?...` |
| Robô que acha empresas sem site no Google | `/prospectar` (só com a sua chave) |
| Planos mensais com assinatura no Asaas | `/#mensal` |
| Painel de leads, propostas e pagamentos (com a sua chave) | `/admin` |
| Site por assinatura: 12x sem entrada, com aviso de atraso | proposta e calculadora |
| Assistente com IA no site (item adicional) | calculadora e propostas |
| Resumo para buscas com IA | `/llms.txt` |
| Mapa do site e robôs | `/sitemap.xml`, `/robots.txt` |
| Política de privacidade (LGPD) | `/privacidade` |

## Onde mudar cada coisa

| O quê | Arquivo |
|---|---|
| Nome, marca, WhatsApp, e-mail, Instagram, cidade | `src/lib/config.ts` |
| Preços (site, extras, IA, logo, planos mensais) | `src/lib/config.ts` (`precos`, `precosMensais`) |
| Parcelamento sem entrada (parcelas, acréscimo, dias de tolerância) | `src/lib/config.ts` (`assinaturaSite`) |
| Cores e fontes do site inteiro | `src/app/globals.css` e `src/app/layout.tsx` |
| O que cada plano mensal inclui | `src/lib/catalogo.ts` (`planosMensais`) |
| Avaliações, portfólio e perguntas frequentes | `src/lib/content.ts` |
| Modelos de site para o cliente escolher | `src/lib/modelos.ts` |
| Páginas por nicho | `src/lib/nichos.ts` |
| Prints do portfólio e sua foto | pasta `public/` |

### Avaliações
Depoimentos com `exemplo: true` só aparecem quando você roda o site no seu computador (`npm run dev`),
com a etiqueta "EXEMPLO". **Eles nunca vão para o site publicado.** Quando um cliente mandar um
depoimento real, cadastre sem o `exemplo`. Se não houver nenhum depoimento real, a seção some sozinha.

### Modelos prontos
Para criar um modelo novo, copie um bloco em `src/lib/modelos.ts` e troque os dados: segmento, cores,
fonte (`bricolage`, `fraunces` ou `grotesk`), layout (`dividido`, `centro`, `cinema` ou `lanchonete`) e textos.
Restaurantes podem ter `cardapio` e `local`. A demonstração e o cartão da galeria são gerados sozinhos.

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | Para quê | Obrigatória |
|---|---|---|
| `PROPOSTA_SEGREDO` | Assina as propostas. Qualquer texto longo e aleatório. | Sim |
| `ADMIN_CHAVE` | Sua senha do painel `/admin`, do gerador de propostas e do robô. | Sim |
| `LEAD_WEBHOOK_URL` | Opcional: também manda cada aviso para uma planilha, n8n ou CRM. | Não |
| `RESEND_API_KEY` | Chave do Resend para receber cada lead e pagamento por e-mail. | Recomendado |
| `AVISO_EMAIL_PARA` | Seu e-mail (pode ser mais de um, separados por vírgula). | Com o Resend |
| `AVISO_EMAIL_DE` | Remetente de um domínio verificado no Resend, ex.: `Site <avisos@seudominio.com.br>`. | Quando tiver domínio |
| `KV_REST_API_URL` e `KV_REST_API_TOKEN` | Banco do painel `/admin`. A Vercel cria sozinha ao instalar o Upstash Redis. | Sim, para o painel |
| `NEXT_PUBLIC_SITE_URL` | Seu domínio, ex.: `https://andressasoares.com.br`. | Quando tiver domínio |
| `NEXT_PUBLIC_META_PIXEL_ID` | Pixel da Meta (Instagram/Facebook Ads). | Para anúncios |
| `NEXT_PUBLIC_GOOGLE_TAG_ID` | Google Analytics 4 (`G-...`). | Para anúncios |
| `NEXT_PUBLIC_GOOGLE_ADS_LEAD` | Conversão do Google Ads (`AW-.../rótulo`). | Para anúncios |
| `GOOGLE_PLACES_API_KEY` | Robô de prospecção (Places API) e print/velocidade dos sites (PageSpeed). | Para o robô |
| `PAGESPEED_API_KEY` | Opcional: chave separada para o PageSpeed. Sem ela, usa a de cima. | Não |
| `ASAAS_API_KEY` | Chave da API do Asaas (Minha conta → Integrações). | Para cobrar |
| `ASAAS_AMBIENTE` | `sandbox` para testar, `producao` para valer. | Para cobrar |
| `ASAAS_WEBHOOK_TOKEN` | Token que você define no webhook do Asaas (avisos de pagamento). | Para cobrar |
| `ASAAS_TIPO_ASSINATURA` | Forma das mensalidades: `UNDEFINED` (padrão), `CREDIT_CARD` ou `BOLETO`. | Não |

Para gerar um segredo: `openssl rand -base64 32`. Depois de mudar variáveis, faça um novo deploy.

### Painel de leads (`/admin`)
Entre com a `ADMIN_CHAVE`. Mostra leads, propostas abertas, quem foi pagar e os avisos do Asaas, com a situação de cada lead
(novo, conversando, proposta enviada, fechou, perdido) e botão para chamar no WhatsApp.

Na Vercel: **Storage → Create → Upstash (Redis)** e conecte ao projeto; as variáveis `KV_REST_API_*` aparecem sozinhas.
No computador, sem Redis, os avisos ficam em `.dados/eventos.json` (fora do git).

### Avisos por e-mail (Resend)
1. Crie a conta em resend.com e gere uma chave de API.
2. Cadastre `RESEND_API_KEY` e `AVISO_EMAIL_PARA`.
3. Enquanto não verificar o seu domínio no Resend, ele só entrega para o e-mail dono da conta.

### Receber os leads numa planilha do Google (grátis)
1. Crie uma planilha e vá em **Extensões → Apps Script**.
2. Cole o código abaixo e salve.
3. **Implantar → Nova implantação → Tipo: App da Web**, "Executar como: eu", "Quem pode acessar: qualquer pessoa".
4. Copie a URL gerada e coloque em `LEAD_WEBHOOK_URL` na Vercel.

Cada tipo de aviso vai para uma aba: **lead**, **proposta_aberta** (o cliente abriu a proposta),
**checkout** (clicou para pagar) e **pagamento** (o Asaas confirmou).

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const tipo = d.tipo || "lead";
  const aba = planilha.getSheetByName(tipo) || planilha.insertSheet(tipo);
  delete d.tipo;
  const colunas = Object.keys(d);
  if (aba.getLastRow() === 0) aba.appendRow(colunas);
  const cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  aba.appendRow(cabecalho.map((c) => {
    const v = d[c];
    if (v === undefined || v === null) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return c === "whatsapp" ? "'" + v : v;
  }));
  return ContentService.createTextOutput("ok");
}
```

### Asaas (pagamentos e assinaturas)
1. Crie a chave em **Minha conta → Integrações → Chave de API** (primeiro no sandbox: sandbox.asaas.com).
2. Cadastre `ASAAS_API_KEY` e `ASAAS_AMBIENTE=sandbox` na Vercel e teste pagando uma proposta.
3. Em **Integrações → Webhooks**, crie um webhook com a URL `https://SEU-DOMINIO/api/asaas/webhook`,
   eventos de cobrança e assinatura, e o mesmo token de `ASAAS_WEBHOOK_TOKEN`.
4. Quando estiver tudo certo, troque a chave pela de produção e `ASAAS_AMBIENTE=producao`.

O valor cobrado é sempre calculado no servidor a partir da proposta assinada ou do plano, então ninguém
consegue pagar menos editando o link.

### Robô de prospecção
1. No Google Cloud, crie um projeto, ative **Places API (New)** e **PageSpeed Insights API** e gere uma chave.
2. Restrinja a chave a essas duas APIs e cadastre em `GOOGLE_PLACES_API_KEY`.
3. Abra `/prospectar`, escolha o nicho e a cidade. As melhores oportunidades aparecem no topo, com botão para
   abordar no WhatsApp e para gerar a proposta com o "hoje × como vai ficar".

### Site por assinatura (12x sem entrada)
Na proposta, o cliente escolhe entre 50% + 50% ou 12 parcelas mensais sem entrada (17% a mais, configurável).
Antes de pagar, ele precisa marcar que aceita a regra: se uma parcela atrasar mais de 5 dias, o site sai do ar até
o pagamento ser regularizado. O Asaas avisa o atraso (`PAYMENT_OVERDUE`) no painel e por e-mail; tirar o site do ar é manual.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para testar propostas localmente, crie um arquivo `.env.local` com
`ADMIN_CHAVE=qualquercoisa`.

## Publicar (grátis na Vercel)

1. Crie uma conta em vercel.com e entre com o GitHub.
2. "Add New → Project" e escolha este repositório (o app está na raiz).
3. Cadastre as variáveis de ambiente da tabela acima.
4. Clique em Deploy. Em 1 minuto o site está no ar com um endereço `.vercel.app`.
5. Para usar seu domínio: registre no registro.br e, na Vercel, vá em Settings → Domains.

Depois de publicar, siga o `docs/trafego-pago.md` (Google, IA e anúncios).
