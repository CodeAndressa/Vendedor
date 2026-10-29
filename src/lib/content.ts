export type Depoimento = {
  nome: string;
  negocio: string;
  texto: string;
  estrelas: 1 | 2 | 3 | 4 | 5;
  // Depoimentos de exemplo só aparecem rodando localmente (npm run dev),
  // para você ver o layout. Eles NUNCA vão para o site publicado.
  // Quando tiver um depoimento real, cadastre sem "exemplo".
  exemplo?: boolean;
};

export const depoimentos: Depoimento[] = [
  {
    nome: "Diretor comercial",
    negocio: "4Core · controle de ponto",
    texto:
      "O site deixou de ser só um cartão de visitas. A calculadora e o material da Portaria 671 viraram nossa principal fonte de contatos qualificados.",
    estrelas: 5,
    exemplo: true,
  },
  {
    nome: "Dona de hamburgueria",
    negocio: "Alimentação · Curitiba",
    texto:
      "Em uma semana o cardápio estava no ar e os pedidos começaram a chegar direto no WhatsApp. Atendimento rápido e sem enrolação.",
    estrelas: 5,
    exemplo: true,
  },
  {
    nome: "Advogada",
    negocio: "Escritório de advocacia",
    texto:
      "Eu não precisei escrever nada. Ela entendeu o meu trabalho na conversa e o site ficou com a cara do escritório.",
    estrelas: 5,
    exemplo: true,
  },
];

export const depoimentosVisiveis = depoimentos.filter(
  (d) => !d.exemplo || process.env.NODE_ENV !== "production",
);

export type Projeto = {
  cliente: string;
  tipo: string;
  descricao: string;
  url?: string;
  imagem?: string; // print do computador em /public/portfolio/, ex.: "/portfolio/4core-desktop.png"
  imagemCelular?: string; // print do celular, aparece sobreposto ao do computador
  destaques?: string[]; // o que o projeto entregou, em frases curtas
  tags: string[];
};

export const projetos: Projeto[] = [
  {
    cliente: "4Core",
    tipo: "Site de vendas + plataforma sob medida",
    descricao:
      "Site para uma empresa de controle de ponto e acesso que vende para RH e departamento pessoal. A página mostra o risco trabalhista do ponto irregular, calcula quanto a empresa perde por ano e transforma o visitante em contato qualificado.",
    url: "https://4core.site",
    imagem: "/portfolio/4core-desktop.png",
    imagemCelular: "/portfolio/4core-celular.png",
    destaques: [
      "Calculadora do prejuízo anual com o ponto atual",
      "Material rico da Portaria 671 em troca do contato",
      "Atendimento com IA e WhatsApp em todas as páginas",
      "Sistema de gestão por trás: financeiro, cobrança e marketing",
    ],
    tags: ["Landing page", "Captação de leads", "Inteligência artificial", "Sistema de gestão"],
  },
];

export const faq = [
  {
    pergunta: "Preciso pagar mensalidade?",
    resposta:
      "Não é obrigatório. O site pode ser pago uma vez só (ou em 12x sem entrada) e a hospedagem do primeiro ano já está inclusa. Depois disso, o único custo fixo é a renovação anual do domínio .com.br, de cerca de R$ 40. Se quiser que eu cuide do site, do Google e dos anúncios, existem planos mensais a partir de R$ 49.",
  },
  {
    pergunta: "Eu preciso escrever os textos?",
    resposta:
      "Não. A partir da nossa conversa no WhatsApp eu escrevo os textos de todas as páginas. Você só revisa e aprova.",
  },
  {
    pergunta: "Qual a diferença entre site e landing page?",
    resposta:
      "O site tem várias páginas e apresenta o negócio inteiro. A landing page é uma página única focada em uma oferta, ideal para quem vai anunciar no Google ou no Instagram. As duas opções custam R$ 997.",
  },
  {
    pergunta: "E se eu não gostar do resultado?",
    resposta:
      "Você vê a primeira versão em até 48 horas. No pagamento em duas partes (50% para começar e 50% na entrega), se não gostar, não paga a segunda metade. Se gostar, faço os ajustes que você pedir até ficar do seu jeito. Essa garantia vale para o pagamento em duas partes, não para o site por assinatura em 12x.",
  },
  {
    pergunta: "Quais as formas de pagamento?",
    resposta:
      "Pix, cartão de crédito ou boleto. Metade para começar e metade quando o site estiver no ar.",
  },
  {
    pergunta: "Posso parcelar sem entrada?",
    resposta:
      "Pode. No site por assinatura você paga em 12 parcelas mensais, sem entrada, no Pix, cartão ou boleto. A condição é manter as parcelas em dia: se uma atrasar mais de 5 dias, o site fica fora do ar até o pagamento ser regularizado, e volta no mesmo dia em que for quitado.",
  },
  {
    pergunta: "Já tenho um domínio. Posso usar?",
    resposta: "Pode sim. Eu configuro o site no domínio que você já tem, sem custo extra.",
  },
  {
    pergunta: "Posso pedir alterações depois que o site estiver no ar?",
    resposta:
      "Sim. Pequenos ajustes nos primeiros 30 dias são por minha conta. Depois disso, faço um orçamento rápido para cada mudança.",
  },
  {
    pergunta: "Dá para colocar inteligência artificial no site?",
    resposta:
      "Dá. O assistente com IA conversa com o visitante a qualquer hora, responde dúvidas sobre os seus serviços, preços e horários com base nas informações do seu negócio, e encaminha quem quer comprar direto para o seu WhatsApp. Custa R$ 497 de implantação, somado ao site.",
  },
  {
    pergunta: "Você cria a logo também?",
    resposta:
      "Crio. Faço uma logo personalizada para o seu negócio por R$ 99,99, entregue com os arquivos para site, redes sociais e impressão.",
  },
  {
    pergunta: "Você faz projetos maiores, como loja ou sistema?",
    resposta:
      "Faço. Loja virtual, área com login, sistemas de gestão e integrações com IA. Esses projetos começam em + R$ 997 sobre o site e o valor final depende do escopo. Me chama que eu te passo um orçamento.",
  },
];
