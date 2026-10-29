# Plano do site de venda de sites

Resumo de tudo que foi pensado, decidido e construído. O código está na raiz e o guia de anúncios e
prospecção em `docs/trafego-pago.md`. Os prints de cada tela estão em `docs/prints/`.

## Objetivo

Vender sites e landing pages para pequenos negócios, no modelo do thallisribeiro.com.br: oferta simples, preço
fechado, prazo curto e garantia. Em cima disso, o próprio site busca clientes, monta propostas, cobra e oferece
planos mensais.

## Oferta

| Item | Valor |
|---|---|
| Site (até 5 páginas) ou landing page | R$ 997 |
| Blog | + R$ 497 |
| Loja, login, sistema ou 10+ páginas | a partir de + R$ 997 |
| Logo personalizada | R$ 99,99 |
| Logo express (cliente monta no criador) | R$ 9,99 |
| Plano Cuidado | R$ 49/mês |
| Plano Crescimento | R$ 149/mês |
| Plano Anúncios | R$ 397/mês + verba |

- Primeira versão em 48h, site no ar em até 7 dias.
- Metade no início, metade na entrega. Pix, cartão ou boleto (Asaas).
- Garantia: se a primeira versão não agradar, o cliente não paga a segunda metade.
- Domínio .com.br e hospedagem do primeiro ano inclusos; ajustes pequenos por 30 dias.

Todos os preços ficam em `src/lib/config.ts`.

## Decisões tomadas

- **Textos próprios**: a estrutura segue o site de referência, mas nenhum texto foi copiado.
- **Marca pessoal** ("Andressa Soares"), como no site de referência. Troca em um arquivo só.
- **Verde** como cor principal, a pedido.
- **Next.js + Tailwind + Motion** em vez de HTML puro, para ter animações, páginas internas e servidor
  (leads, propostas, pagamentos). Hospedagem recomendada: Vercel.
- **Sem avaliações inventadas**: a seção de depoimentos só mostra exemplos no computador local; no site
  publicado ela some até existirem depoimentos reais.
- **"Recomendado" em vez de "Mais escolhido"** nos planos, porque ainda não há clientes para afirmar isso.
- **Propostas assinadas**: o link leva os dados da proposta e uma assinatura. Se alguém mudar valor ou desconto,
  a proposta aparece como não verificada e o pagamento é bloqueado.
- **Valor da cobrança sempre calculado no servidor**, nunca vindo do navegador.
- **Cookies e pixels só depois do aceite** (LGPD), com página de privacidade.
- **Robô de prospecção** usa dados públicos de empresas no Google; não busca dados pessoais de donos.
- **Modelos de demonstração usam negócios fictícios**, com aviso no topo de cada demo.

## O que o site tem

| Parte | Onde | Para quê |
|---|---|---|
| Página de vendas | `/` | Oferta, garantia, planos, calculadora, FAQ |
| Diagnóstico de 30s | `/#diagnostico` | Captura o lead e gera proposta na hora |
| Galeria de modelos | `/modelos` e `/modelos/<nome>` | 9 modelos com demonstração ao vivo |
| Criador de logo | `/logo` | Isca de lead e venda de logo |
| Páginas por nicho | `/para/<nicho>` | Google e destino de anúncios |
| Planos mensais | `/#mensal` | Assinatura recorrente no Asaas |
| Proposta | `/proposta?...` | Hoje × como vai ficar, no celular; pagar entrada |
| Resultado | `/resultado?...` | Antes × depois após a entrega, depoimento, upsell |
| Gerador de propostas | `/proposta/nova` | Uso interno, com senha |
| Robô de prospecção | `/prospectar` | Uso interno, com senha |
| SEO e IA | `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Google e buscas com IA |

## Como os dados circulam

1. Visitante chega (anúncio, Google, Instagram). O site guarda a origem.
2. Faz o diagnóstico ou cria a logo → vira lead → aviso na planilha (aba `lead`).
3. Recebe a proposta assinada → quando abre, aviso na planilha (aba `proposta_aberta`).
4. Clica em pagar → Asaas gera a cobrança (aba `checkout`).
5. Asaas confirma o pagamento → webhook → aviso na planilha (aba `pagamento`).

Prospecção ativa: robô acha empresas sem site → abordagem no WhatsApp → proposta com prévia → mesmo fluxo acima.

## Para colocar no ar

1. Publicar a pasta `site/` na Vercel.
2. Cadastrar as variáveis de ambiente (lista completa em `README.md` e `.env.example`).
3. Criar a planilha de leads com o Apps Script do README e colocar a URL em `LEAD_WEBHOOK_URL`.
4. Asaas: começar em sandbox, testar uma proposta, configurar o webhook, depois trocar para produção.
5. Google Cloud: ativar Places API e PageSpeed Insights API para o robô e o comparativo.
6. Registrar o domínio e configurar Search Console, Bing Webmaster e Perfil da Empresa no Google.
7. Seguir `docs/trafego-pago.md` para anúncios e prospecção.

## Como foi testado

- Build e lint sem erros a cada etapa; telas conferidas no computador e no celular (sem rolagem lateral).
- Fluxos completos testados com servidores locais que simulam Google Places, PageSpeed e Asaas:
  diagnóstico → lead → proposta; proposta → pagamento da entrada; assinatura mensal; webhook do Asaas;
  link adulterado aparece como não verificado.
- Ainda não testado com as contas reais (dependem das chaves de API).

## Pendências e perguntas em aberto

- Preço da logo: manter R$ 99,99 ou trocar para R$ 97 / R$ 147?
- Preços e conteúdo dos planos mensais; oferecer também "site por assinatura" (ex.: 12× sem entrada)?
- Para onde vão os leads: planilha do Google ou outra ferramenta.
- Prints e link confirmados do projeto 4Core para o portfólio; foto e texto do "Sobre".
- Depoimentos reais (ex.: cliente da 4Core ou primeiros clientes em troca de desconto).
- E-mail e Instagram para o rodapé.
- Referências que não puderam ser abertas daqui (rede bloqueada): pitombas.com.br, propoza.com.br,
  heydamir.design e as galerias de inspiração. Com prints, dá para ajustar o visual.
- Confirmar no Asaas se a conta aceita Pix em assinatura (por padrão ficou cartão ou boleto).

## Prints

Telas geradas durante os testes (com dados de exemplo e empresas fictícias).

- [Topo do site (computador)](prints/hero-desktop.png)
- [Topo do site (celular)](prints/hero-mobile.png)
- [Galeria de modelos](prints/g-desktop.png)
- [Demonstração do modelo Brasa](prints/demo-brasa.png)
- [Modelo Onda (hamburgueria)](prints/onda-top.png)
- [Cardápio com abas](prints/onda-smash.png)
- [Vitrine de modelos na home](prints/h-vitrine.png)
- [Planos com notificação no topo](prints/h-ilha.png)
- [Resultado do diagnóstico](prints/q5.png)
- [Proposta personalizada](prints/prop-admin.png)
- [Criador de logo](prints/logo2.png)
- [Página "Site para hamburguerias"](prints/nicho.png)
- [Rodapé](prints/rodape.png)
- [Robô de prospecção](prints/r-robo.png)
- [Proposta no celular: Maps sem site × prévia](prints/r-prop-maps-celular.png)
- [Proposta no celular: site antigo × prévia](prints/r-prop-site-celular.png)
- [Proposta no computador com QR](prints/r-prop-desktop.png)
- [Resultado antes × depois](prints/r-resultado-celular.png)
- [Planos mensais](prints/r-mensal.png)
- [Pagamento da entrada](prints/r-checkout.png)
