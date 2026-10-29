# Plano de captação: Google, buscas com IA e tráfego pago

O site já está preparado para tudo abaixo. Este guia é o que você faz **fora** do código, na ordem certa.
Valores de custo são estimativas de mercado para começar; ajuste com os seus próprios números depois de 2 a 4 semanas.

## 1. Antes de anunciar (semana 1)

Sem isso, anúncio é dinheiro jogado fora:

1. **Publicar o site** na Vercel com as variáveis `PROPOSTA_SEGREDO`, `ADMIN_CHAVE` e `LEAD_WEBHOOK_URL` (ver `README.md`).
2. **Testar o funil**: faça o diagnóstico do site no seu celular e confira se o lead chegou na planilha e se a proposta abre.
3. **Google Search Console**: adicione o domínio e envie `https://SEU-DOMINIO/sitemap.xml`.
4. **Bing Webmaster Tools**: importe do Search Console. O ChatGPT e o Copilot usam o índice do Bing para buscar na web.
5. **Perfil da Empresa no Google** (Google Meu Negócio): categoria "Web designer", área de atendimento Curitiba e Brasil,
   link para o site e o WhatsApp. É o que mais pesa em buscas como "criação de site em Curitiba".
6. **Instagram**: link do site na bio apontando para `/?utm_source=instagram&utm_medium=bio`.

## 2. Aparecer no Google e nas buscas com IA (orgânico)

Já está no site:
- Dados estruturados (schema.org) com serviço, preços e perguntas frequentes.
- `/llms.txt`: um resumo em texto para assistentes de IA citarem você com preço e prazo certos.
- `robots.txt` liberando Google e robôs de IA, e `sitemap.xml` com todas as páginas.
- 9 páginas "Site para [nicho]" (`/para/hamburguerias`, `/para/advogados`...), cada uma mirando uma busca específica.

O que depende de você (é o que faz a IA e o Google confiarem em você):
- **Avaliações reais no Google**: peça para cada cliente avaliar o Perfil da Empresa. Elas aparecem nas respostas de IA.
- **Mesmo nome, telefone e cidade** em todo lugar (site, Google, Instagram, LinkedIn).
- **Ser citada em outros sites**: perfil no LinkedIn, Workana, 99Freelas, GetNinjas, e no site dos clientes
  ("Site feito por Andressa Soares", com link).
- **Conteúdo**: 1 artigo por mês respondendo dúvidas reais ("Quanto custa um site em 2026?", "Site ou Instagram?").
  Se quiser, o blog entra no próprio site.

## 3. Google Ads (quem já está procurando)

Comece pelo Google: a pessoa já está buscando um site, então converte mais.

- **Orçamento inicial**: R$ 20 a R$ 30 por dia.
- **Campanha**: Rede de Pesquisa, sem Display, local Curitiba e região metropolitana. Expanda para o Brasil depois que tiver dados.
- **Conversões**: crie a conversão "Lead" no Google Ads, coloque o ID em `NEXT_PUBLIC_GOOGLE_ADS_LEAD` e importe também o
  evento `contact` (clique no WhatsApp) do GA4.
- **Grupos de anúncios** (um por nicho, cada um levando para a página do nicho):

| Grupo | Palavras-chave (correspondência de frase) | Página de destino |
|---|---|---|
| Geral | "criação de site", "fazer site para empresa", "quanto custa um site" | `/` |
| Curitiba | "criação de sites curitiba", "web designer curitiba" | `/` |
| Hamburguerias | "site para hamburgueria", "cardápio online hamburgueria" | `/para/hamburguerias` |
| Dentistas | "site para dentista", "site para clínica odontológica" | `/para/clinicas-odontologicas` |
| Advogados | "site para advogado", "site para escritório de advocacia" | `/para/advogados` |
| Landing page | "landing page preço", "criar landing page" | `/para/personal-trainers` ou `/` |

- **Palavras negativas** (evitam cliques de quem não vai comprar): grátis, gratuito, curso, aprender, como fazer,
  sozinho, wix, wordpress tutorial, emprego, vaga, estágio, template grátis.
- **Exemplo de anúncio**:
  - Títulos: "Site Profissional em 7 Dias" · "A Partir de R$ 997" · "Domínio Incluso" · "Primeira Versão em 48h"
  - Descrição: "Você só paga a segunda metade se gostar. Textos, design e WhatsApp inclusos. Peça sua proposta."
- **Link com origem**: o Google Ads marca o clique sozinho (gclid). Ative a marcação automática.

## 4. Meta Ads: Instagram e Facebook (quem ainda não está procurando)

- **Orçamento inicial**: R$ 15 a R$ 20 por dia, depois que o Google estiver rodando.
- **Pixel**: crie no Gerenciador de Eventos, coloque o ID em `NEXT_PUBLIC_META_PIXEL_ID`. O site já envia
  `Lead` (diagnóstico e logo), `Contact` (WhatsApp), `ViewContent` (proposta) e `CustomizeProduct` (criador de logo).
- **Campanha 1: Leads no site** (objetivo Leads, evento de conversão `Lead`)
  - Público: Curitiba + 40 km, 25 a 55 anos, interesses em empreendedorismo, pequenas empresas, administradores de página.
  - Criativos que funcionam para esse serviço:
    1. Vídeo curto (Reels) da tela mostrando um modelo sendo personalizado com o nome do negócio.
    2. Carrossel com 5 modelos (Onda, Sereno, Toga, Bloom, Pulso) e "Escolha o seu. No ar em 7 dias."
    3. Antes e depois: perfil só com Instagram × site profissional.
  - Link: `/?utm_source=meta&utm_medium=pago&utm_campaign=leads-site`
- **Campanha 2: Criador de logo como isca**
  - "Crie a logo do seu negócio grátis em 1 minuto." Link para `/logo?utm_source=meta&utm_medium=pago&utm_campaign=logo`.
  - Quem cria a logo vira lead e depois recebe a oferta do site.
- **Campanha 3: Remarketing** (quando tiver uns 500 visitantes)
  - Público: visitou o site nos últimos 30 dias e não virou lead.
  - Mensagem: garantia ("não gostou da primeira versão, não paga o resto") e prazo.

## 5. Como saber se está dando certo

Toda segunda-feira, olhe a planilha de leads e os painéis dos anúncios:

| Métrica | Onde ver | Referência para começar |
|---|---|---|
| Custo por lead | Google Ads / Meta Ads | Abaixo de R$ 40 está bom |
| Leads que respondem no WhatsApp | Sua planilha | Acima de 50% |
| Leads que fecham | Sua planilha | 1 em cada 10 a 15 no começo |
| Origem que mais fecha | Coluna "Veio de" | Coloque mais verba nela |

Conta rápida: com custo de R$ 30 por lead e 1 venda a cada 15 leads, cada site vendido custa R$ 450 em anúncio
e o ticket é R$ 997 ou mais. Se o custo por venda passar de R$ 600, pause os grupos que não fecham e reforce os que fecham.

## 6. Rotina de atendimento (o que mais faz vender)

1. Lead chegou → responda em até 15 minutos no WhatsApp. Velocidade fecha mais que preço.
2. Mande o link da proposta que o próprio site gerou (está na planilha).
3. Não respondeu em 24h → mande um modelo do segmento dele ("Fiz este para hamburgueria, olha como ficaria a sua").
4. Fechou → peça a avaliação no Google assim que o site for ao ar.

## 7. Prospecção ativa com o robô (sem gastar com anúncio)

O robô em `/prospectar` acha negócios sem site no Google, confere se estão funcionando e se o telefone é da
região, e ordena pelas melhores oportunidades.

1. **Escolha um nicho por semana** (ex.: hamburguerias de Curitiba). Fica mais fácil reaproveitar a prévia.
2. **Gere a proposta com prévia** pelo botão do robô. Ela mostra o perfil do Maps dele (ou o site atual, feio
   e lento, com a nota de velocidade do Google) do lado da prévia nova, em dois celulares.
3. **Abra o link uma vez antes de mandar** (botão "Conferir"): a medição fica pronta e o cliente vê na hora.
4. **Mande poucas mensagens por dia** (10 a 20), sempre personalizadas. Disparo em massa faz o WhatsApp
   bloquear o seu número.
5. **Peça para ele abrir no celular.** O site te avisa na planilha quando ele abrir (aba `proposta_aberta`):
   esse é o melhor momento para chamar de novo.
6. **Respeite quem pedir para não receber mais contato** e anote na planilha. Usar dados públicos de empresas
   para oferecer um serviço é permitido, mas a pessoa tem o direito de pedir para sair (LGPD).
