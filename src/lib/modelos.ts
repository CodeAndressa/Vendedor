// Modelos prontos que o cliente pode escolher. Cada um vira uma página de demonstração
// em /modelos/[slug]. Para criar um novo, copie um bloco e mude os dados.

export type Fonte = "bricolage" | "fraunces" | "grotesk";
export type Layout = "dividido" | "centro" | "cinema" | "lanchonete" | "estetica";
export type Icone =
  | "gota"
  | "folha"
  | "sol"
  | "dente"
  | "balanca"
  | "flor"
  | "chama"
  | "haltere"
  | "regua"
  | "calculadora"
  | "pata"
  | "coracao"
  | "estrela"
  | "relogio"
  | "escudo"
  | "sparkles"
  | "copo"
  | "casa"
  | "grafico";

export type Modelo = {
  slug: string;
  nome: string; // nome do modelo
  segmento: string;
  categoria: "Saúde" | "Serviços" | "Beleza" | "Alimentação" | "Fitness" | "Criativo" | "Pet";
  tipo: "Site" | "Landing page";
  estilos: ("Claro" | "Escuro" | "Minimalista" | "Colorido" | "Elegante" | "Ousado")[];
  layout: Layout;
  fonte: Fonte;
  cores: { fundo: string; texto: string; destaque: string; textoDestaque: string; suave: string; cartao: string };
  negocio: {
    nome: string;
    icone: Icone;
    chamada: string;
    subtitulo: string;
    cta: string;
    servicos: { icone: Icone; titulo: string; texto: string; duracao?: string }[];
    sobre: string;
    numeros: [string, string][];
    depoimento: { texto: string; nome: string };
    // Opcional: restaurantes e lanchonetes ganham cardápio com abas e bloco de endereço
    cardapio?: { categoria: string; nota?: string; itens: { nome: string; descricao: string; preco: string; selo?: string }[] }[];
    local?: { endereco: string; horario: string; avaliacao: string };
    // Opcional: conteúdo extra das seções do layout "estetica"
    clinica?: Clinica;
  };
};

export type Clinica = {
  cidade: string;
  destaqueChamada: string; // trecho da chamada que aparece em itálico
  manifesto: string;
  especialista: { nome: string; cargo: string; texto: string; formacao: string[] };
  diferenciais: { icone: Icone; titulo: string; texto: string }[];
  resultados: { procedimento: string; perfil: string; sessoes: string; texto: string }[];
  passos: { titulo: string; texto: string }[];
  depoimentos: { texto: string; nome: string; procedimento: string }[];
  horarios: [string, string][];
  faq: { pergunta: string; resposta: string }[];
};

export const modelos: Modelo[] = [
  {
    slug: "nacar",
    nome: "Nácar",
    segmento: "Clínica de estética avançada",
    categoria: "Beleza",
    tipo: "Site",
    estilos: ["Claro", "Minimalista", "Elegante"],
    layout: "estetica",
    fonte: "fraunces",
    cores: { fundo: "#F7F2EC", texto: "#2F2722", destaque: "#56634F", textoDestaque: "#FFFFFF", suave: "#ECE1D5", cartao: "#FCFAF7" },
    negocio: {
      nome: "Lis Estética Avançada",
      icone: "flor",
      chamada: "Sua melhor pele, com a naturalidade de sempre.",
      subtitulo:
        "Harmonização, bioestimuladores e tecnologias para a pele, planejados a partir de uma avaliação sem pressa do seu rosto.",
      cta: "Agendar avaliação",
      servicos: [
        { icone: "gota", titulo: "Limpeza de pele profunda", texto: "Extração cuidadosa, peeling enzimático e máscara calmante para uma pele limpa e luminosa.", duracao: "75 min" },
        { icone: "sparkles", titulo: "Harmonização facial", texto: "Ajustes sutis de contorno e proporção, respeitando os traços que fazem você ser você.", duracao: "60 min" },
        { icone: "folha", titulo: "Bioestimulador de colágeno", texto: "Estímulo gradual do colágeno para mais firmeza e sustentação, com resultado que dura.", duracao: "45 min" },
        { icone: "sol", titulo: "Laser e luz pulsada", texto: "Manchas, vasinhos e textura tratados com tecnologia ajustada ao seu tipo de pele.", duracao: "40 min" },
        { icone: "gota", titulo: "Skinbooster", texto: "Hidratação profunda de dentro para fora, com um viço que aparece já nas primeiras semanas.", duracao: "30 min" },
        { icone: "estrela", titulo: "Microagulhamento", texto: "Renova a textura e suaviza marcas de acne, com recuperação rápida e acompanhada.", duracao: "50 min" },
      ],
      sobre:
        "Uma clínica pequena de propósito: poucos atendimentos por dia, salas silenciosas e tempo para entender o que você quer, antes de propor qualquer procedimento.",
      numeros: [["12", "anos de experiência"], ["4 mil", "atendimentos"], ["4,9", "no Google"]],
      depoimento: {
        texto: "Saí com a sensação de ter descansado um mês. Ninguém percebe que fiz algo, só dizem que estou com a pele linda.",
        nome: "Paciente da clínica",
      },
      local: { endereco: "Rua das Magnólias, 480 · Jardim Botânico", horario: "Seg a sex, 9h às 20h", avaliacao: "4,9 no Google" },
      clinica: {
        cidade: "Curitiba",
        destaqueChamada: "com a naturalidade",
        manifesto:
          "Acreditamos em resultados que não chamam atenção para o procedimento, e sim para você. Menos excesso, mais critério: cada protocolo começa por ouvir e termina com acompanhamento.",
        especialista: {
          nome: "Dra. Helena Prado",
          cargo: "Biomédica esteta e fundadora",
          texto:
            "Há doze anos a Helena cuida de pele com um olhar que mistura técnica e delicadeza. Ela acompanha pessoalmente cada paciente, da primeira avaliação ao retorno.",
          formacao: ["Pós-graduação em estética avançada", "Especialização em harmonização facial", "Formação contínua em tecnologias a laser"],
        },
        diferenciais: [
          { icone: "relogio", titulo: "Avaliação sem pressa", texto: "Uma hora de conversa e análise de pele antes de qualquer indicação." },
          { icone: "escudo", titulo: "Produtos rastreáveis", texto: "Cada ampola é aberta na sua frente, com o lote anotado no prontuário." },
          { icone: "folha", titulo: "Plano por escrito", texto: "Você sai com o protocolo, as datas e o investimento, sem surpresa." },
          { icone: "coracao", titulo: "Retorno incluso", texto: "Revisão em 15 dias para ajustar o que for preciso, sem custo." },
        ],
        resultados: [
          { procedimento: "Bioestimulador", perfil: "Paciente, 42 anos", sessoes: "3 sessões em 4 meses", texto: "Contorno mais definido e pele com aspecto descansado." },
          { procedimento: "Laser", perfil: "Paciente, 35 anos", sessoes: "4 sessões em 2 meses", texto: "Manchas de sol suavizadas e tom de pele mais uniforme." },
          { procedimento: "Skinbooster", perfil: "Paciente, 29 anos", sessoes: "2 sessões em 1 mês", texto: "Viço e hidratação visíveis, sem mudar a expressão." },
        ],
        passos: [
          { titulo: "Avaliação", texto: "Conversa, análise de pele e fotos de referência." },
          { titulo: "Plano", texto: "Protocolo por escrito, com prioridades e prazos." },
          { titulo: "Sessões", texto: "Procedimentos em sala privativa, com conforto." },
          { titulo: "Retorno", texto: "Revisão em 15 dias e acompanhamento pelo WhatsApp." },
        ],
        depoimentos: [
          { texto: "A Helena me convenceu a fazer menos do que eu pedi, e foi a melhor decisão. Ficou natural.", nome: "Paciente da clínica", procedimento: "Harmonização facial" },
          { texto: "Ambiente lindo e calmo, atendimento no horário e explicação de cada etapa.", nome: "Paciente da clínica", procedimento: "Limpeza de pele" },
        ],
        horarios: [
          ["Segunda a sexta", "9h às 20h"],
          ["Sábado", "9h às 14h"],
          ["Domingo", "Fechado"],
        ],
        faq: [
          { pergunta: "A avaliação tem custo?", resposta: "A primeira avaliação é cobrada e o valor é abatido integralmente se você fizer o procedimento em até 30 dias." },
          { pergunta: "O resultado fica artificial?", resposta: "Nosso foco é a naturalidade. Trabalhamos com doses conservadoras e fazemos ajustes no retorno, se necessário." },
          { pergunta: "Preciso me afastar da rotina?", resposta: "A maioria dos procedimentos permite voltar às atividades no mesmo dia. Explicamos os cuidados de cada um na avaliação." },
          { pergunta: "Como faço para agendar?", resposta: "Pelo WhatsApp. Respondemos em horário comercial e enviamos as opções de dia e horário disponíveis." },
        ],
      },
    },
  },
  {
    slug: "sereno",
    nome: "Sereno",
    segmento: "Clínica odontológica",
    categoria: "Saúde",
    tipo: "Site",
    estilos: ["Claro", "Minimalista"],
    layout: "dividido",
    fonte: "grotesk",
    cores: { fundo: "#F4FAFA", texto: "#0B2B2E", destaque: "#0E9384", textoDestaque: "#FFFFFF", suave: "#D5EFEC", cartao: "#FFFFFF" },
    negocio: {
      nome: "Clínica Sorriso Leve",
      icone: "dente",
      chamada: "Cuidado que faz você voltar a sorrir.",
      subtitulo: "Odontologia completa em um ambiente calmo, com horários que cabem na sua rotina.",
      cta: "Agendar avaliação",
      servicos: [
        { icone: "dente", titulo: "Clareamento", texto: "Sorriso mais branco com acompanhamento profissional." },
        { icone: "escudo", titulo: "Prevenção", texto: "Limpeza e check-up para evitar dor de cabeça depois." },
        { icone: "sparkles", titulo: "Estética", texto: "Lentes e facetas planejadas para o seu rosto." },
      ],
      sobre: "Há mais de 10 anos cuidando de famílias inteiras, com tecnologia moderna e atendimento sem pressa.",
      numeros: [["10+", "anos de clínica"], ["3 mil", "pacientes"], ["4,9", "nota no Google"]],
      depoimento: { texto: "Atendimento impecável. Primeira vez que saio do dentista sem medo.", nome: "Paciente da clínica" },
    },
  },
  {
    slug: "toga",
    nome: "Toga",
    segmento: "Escritório de advocacia",
    categoria: "Serviços",
    tipo: "Site",
    estilos: ["Escuro", "Elegante"],
    layout: "centro",
    fonte: "fraunces",
    cores: { fundo: "#0F1724", texto: "#F3EEE4", destaque: "#C9A45C", textoDestaque: "#0F1724", suave: "#1B2638", cartao: "#152033" },
    negocio: {
      nome: "Marques & Lima Advocacia",
      icone: "balanca",
      chamada: "Seus direitos defendidos com seriedade.",
      subtitulo: "Atuação em direito trabalhista, família e empresarial, com atendimento próximo do início ao fim.",
      cta: "Falar com um advogado",
      servicos: [
        { icone: "balanca", titulo: "Trabalhista", texto: "Rescisões, horas extras e acordos." },
        { icone: "coracao", titulo: "Família", texto: "Divórcio, guarda e pensão com sensibilidade." },
        { icone: "grafico", titulo: "Empresarial", texto: "Contratos e prevenção de riscos para o seu negócio." },
      ],
      sobre: "Um escritório de porte humano: você fala direto com quem cuida do seu caso.",
      numeros: [["15", "anos de atuação"], ["800+", "casos"], ["OAB", "PR"]],
      depoimento: { texto: "Explicaram cada passo do processo com paciência. Me senti segura o tempo todo.", nome: "Cliente do escritório" },
    },
  },
  {
    slug: "bloom",
    nome: "Bloom",
    segmento: "Salão e estética",
    categoria: "Beleza",
    tipo: "Landing page",
    estilos: ["Claro", "Colorido"],
    layout: "dividido",
    fonte: "fraunces",
    cores: { fundo: "#FFF5F3", texto: "#3A1420", destaque: "#E2557A", textoDestaque: "#FFFFFF", suave: "#FBDDE3", cartao: "#FFFFFF" },
    negocio: {
      nome: "Studio Bela Flor",
      icone: "flor",
      chamada: "Seu momento de cuidado começa aqui.",
      subtitulo: "Cabelo, unhas e estética em um espaço pensado para você relaxar.",
      cta: "Reservar horário",
      servicos: [
        { icone: "sparkles", titulo: "Cabelo", texto: "Corte, cor e tratamentos com produtos profissionais." },
        { icone: "flor", titulo: "Unhas", texto: "Manicure, pedicure e alongamento." },
        { icone: "coracao", titulo: "Estética", texto: "Limpeza de pele e design de sobrancelhas." },
      ],
      sobre: "Uma equipe de mulheres apaixonadas por beleza e por fazer você se sentir bem.",
      numeros: [["7", "profissionais"], ["2 mil", "clientes"], ["Seg-Sáb", "abertas"]],
      depoimento: { texto: "Saio de lá outra pessoa. O atendimento é um carinho.", nome: "Cliente do studio" },
    },
  },
  {
    slug: "brasa",
    nome: "Brasa",
    segmento: "Hamburgueria e restaurante",
    categoria: "Alimentação",
    tipo: "Site",
    estilos: ["Escuro", "Ousado"],
    layout: "cinema",
    fonte: "bricolage",
    cores: { fundo: "#120D0A", texto: "#FFF4E8", destaque: "#FF6A1A", textoDestaque: "#120D0A", suave: "#2A1B12", cartao: "#1E1510" },
    negocio: {
      nome: "Brasa Burger",
      icone: "chama",
      chamada: "Feito na brasa. Do jeito certo.",
      subtitulo: "Blend da casa, pão de fermentação natural e batata que estala. Delivery e salão.",
      cta: "Pedir agora",
      servicos: [
        { icone: "chama", titulo: "Smash da casa", texto: "Duas carnes, cheddar e cebola caramelizada." },
        { icone: "copo", titulo: "Drinks", texto: "Carta autoral e chopp gelado." },
        { icone: "relogio", titulo: "Delivery", texto: "Em até 40 minutos na sua casa." },
      ],
      sobre: "Nasceu num food truck e virou o ponto de encontro do bairro.",
      numeros: [["40 min", "delivery"], ["12", "burgers"], ["4,8", "no iFood"]],
      depoimento: { texto: "Melhor hambúrguer da cidade, sem exagero.", nome: "Cliente da casa" },
    },
  },
  {
    slug: "onda",
    nome: "Onda",
    segmento: "Hamburgueria artesanal de praia",
    categoria: "Alimentação",
    tipo: "Site",
    estilos: ["Claro", "Colorido", "Ousado"],
    layout: "lanchonete",
    fonte: "bricolage",
    cores: { fundo: "#FFF4E2", texto: "#2B0F0A", destaque: "#E2412A", textoDestaque: "#FFF4E2", suave: "#FFCF4D", cartao: "#FFFFFF" },
    negocio: {
      nome: "Onda Burger & Fritas",
      icone: "chama",
      chamada: "Burger artesanal pé na areia.",
      subtitulo: "Clássicos de 160 g, smash de 80 g e fritas crocantes. Todo dia a partir das 18h, na avenida da praia.",
      cta: "Pedir delivery",
      servicos: [
        { icone: "chama", titulo: "Carne moída na hora", texto: "Blend próprio, temperado só com sal e pimenta." },
        { icone: "relogio", titulo: "Delivery rápido", texto: "Entregamos em toda a orla em até 40 minutos." },
        { icone: "coracao", titulo: "Lugar de família", texto: "Espaço kids e mesas ao ar livre." },
      ],
      sobre: "Começou com uma chapa e uma barraca na areia. Hoje é parada obrigatória de quem passa pela praia, sempre com o mesmo pão macio e a mesma carne suculenta.",
      numeros: [["160 g", "clássicos"], ["80 g", "smash"], ["18h", "todo dia"]],
      depoimento: { texto: "Melhor smash do litoral. A batata é viciante.", nome: "Cliente da casa" },
      cardapio: [
        {
          categoria: "Clássicos da casa",
          nota: "Burger de 160 g no pão brioche",
          itens: [
            { nome: "Onda Clássico", descricao: "Burger 160 g, queijo prato, alface, tomate e maionese da casa.", preco: "R$ 34,90", selo: "Mais pedido" },
            { nome: "Onda Bacon", descricao: "Burger 160 g, cheddar, bacon crocante e cebola caramelizada.", preco: "R$ 39,90" },
            { nome: "Onda Salada", descricao: "Burger 160 g, muçarela, alface, tomate, cebola roxa e picles.", preco: "R$ 36,90" },
            { nome: "Onda Veggie", descricao: "Burger de grão-de-bico, queijo, rúcula e maionese verde.", preco: "R$ 33,90" },
          ],
        },
        {
          categoria: "Smash",
          nota: "Burger de 80 g prensado na chapa",
          itens: [
            { nome: "Smash Duplo Bacon", descricao: "Dois smash 80 g, cheddar em dobro e bacon.", preco: "R$ 42,90", selo: "Favorito" },
            { nome: "American Smash", descricao: "Dois smash 80 g, queijo americano, picles e molho especial.", preco: "R$ 35,90" },
            { nome: "Salad Smash", descricao: "Smash 80 g, queijo, alface, tomate e cebola.", preco: "R$ 31,90" },
            { nome: "Smashinho", descricao: "Versão kids: smash 80 g e queijo.", preco: "R$ 22,90" },
          ],
        },
        {
          categoria: "Fritas e bebidas",
          itens: [
            { nome: "Fritas da casa", descricao: "Batata rústica com páprica e alecrim.", preco: "R$ 19,90" },
            { nome: "Fritas cheddar e bacon", descricao: "Porção generosa coberta de cheddar cremoso e bacon.", preco: "R$ 29,90" },
            { nome: "Onion rings", descricao: "Anéis de cebola empanados com molho barbecue.", preco: "R$ 24,90" },
            { nome: "Limonada da praia", descricao: "Limão, hortelã e gengibre. 500 ml.", preco: "R$ 12,90" },
          ],
        },
      ],
      local: {
        endereco: "Av. Beira-Mar, 1000 · Praia Central",
        horario: "Todos os dias, das 18h às 23h30",
        avaliacao: "5,0 no Google",
      },
    },
  },
  {
    slug: "pulso",
    nome: "Pulso",
    segmento: "Personal trainer",
    categoria: "Fitness",
    tipo: "Landing page",
    estilos: ["Escuro", "Ousado"],
    layout: "cinema",
    fonte: "grotesk",
    cores: { fundo: "#0A0B0A", texto: "#F2F5EE", destaque: "#C6F432", textoDestaque: "#0A0B0A", suave: "#1A1C18", cartao: "#141613" },
    negocio: {
      nome: "Rafa Moura Treinos",
      icone: "haltere",
      chamada: "12 semanas para mudar o seu corpo.",
      subtitulo: "Treino individual, online ou presencial, com acompanhamento semanal pelo WhatsApp.",
      cta: "Quero começar",
      servicos: [
        { icone: "haltere", titulo: "Treino sob medida", texto: "Montado para o seu objetivo e sua rotina." },
        { icone: "grafico", titulo: "Evolução medida", texto: "Avaliação a cada 4 semanas." },
        { icone: "relogio", titulo: "Treinos de 45 min", texto: "Resultado sem morar na academia." },
      ],
      sobre: "Educador físico há 8 anos, especialista em emagrecimento e hipertrofia.",
      numeros: [["8", "anos"], ["300+", "alunos"], ["12", "semanas"]],
      depoimento: { texto: "Perdi 9 kg e ganhei disposição. Valeu cada treino.", nome: "Aluno da consultoria" },
    },
  },
  {
    slug: "linha",
    nome: "Linha",
    segmento: "Arquitetura e interiores",
    categoria: "Criativo",
    tipo: "Site",
    estilos: ["Claro", "Minimalista", "Elegante"],
    layout: "centro",
    fonte: "fraunces",
    cores: { fundo: "#F3EFE8", texto: "#22201C", destaque: "#22201C", textoDestaque: "#F3EFE8", suave: "#E4DDD1", cartao: "#FAF7F2" },
    negocio: {
      nome: "Atelier Linha",
      icone: "regua",
      chamada: "Espaços que contam a sua história.",
      subtitulo: "Projetos residenciais e comerciais com acompanhamento de obra do início ao fim.",
      cta: "Conversar sobre meu projeto",
      servicos: [
        { icone: "casa", titulo: "Residencial", texto: "Casas e apartamentos sob medida." },
        { icone: "regua", titulo: "Interiores", texto: "Marcenaria, iluminação e decoração." },
        { icone: "grafico", titulo: "Comercial", texto: "Lojas e escritórios que vendem." },
      ],
      sobre: "Um estúdio pequeno, com olhar atento para cada detalhe do seu espaço.",
      numeros: [["120", "projetos"], ["9", "anos"], ["CAU", "registrado"]],
      depoimento: { texto: "Entenderam exatamente o que a gente queria, até o que não sabíamos explicar.", nome: "Cliente do atelier" },
    },
  },
  {
    slug: "conta-certa",
    nome: "Conta Certa",
    segmento: "Contabilidade",
    categoria: "Serviços",
    tipo: "Site",
    estilos: ["Claro", "Minimalista"],
    layout: "dividido",
    fonte: "grotesk",
    cores: { fundo: "#F5F7FC", texto: "#0D1B3E", destaque: "#2557D6", textoDestaque: "#FFFFFF", suave: "#DCE5FA", cartao: "#FFFFFF" },
    negocio: {
      nome: "Conta Certa Contabilidade",
      icone: "calculadora",
      chamada: "Contabilidade sem complicação para o seu negócio.",
      subtitulo: "Abertura de empresa, MEI e impostos em dia, com um contador que responde no WhatsApp.",
      cta: "Pedir orçamento",
      servicos: [
        { icone: "calculadora", titulo: "Abertura de empresa", texto: "CNPJ pronto em poucos dias." },
        { icone: "grafico", titulo: "Planejamento tributário", texto: "Pague só o imposto que é devido." },
        { icone: "escudo", titulo: "Folha e obrigações", texto: "Tudo entregue no prazo, sem multa." },
      ],
      sobre: "Atendemos MEIs, pequenas e médias empresas de todo o Brasil, 100% online.",
      numeros: [["500+", "empresas"], ["100%", "online"], ["24h", "para responder"]],
      depoimento: { texto: "Finalmente entendo para onde vai meu dinheiro. Recomendo demais.", nome: "Cliente do escritório" },
    },
  },
  {
    slug: "patas",
    nome: "Patas",
    segmento: "Pet shop e banho e tosa",
    categoria: "Pet",
    tipo: "Landing page",
    estilos: ["Claro", "Colorido"],
    layout: "centro",
    fonte: "bricolage",
    cores: { fundo: "#FFF8E6", texto: "#2B1A4A", destaque: "#6D3FD6", textoDestaque: "#FFFFFF", suave: "#FFE7A3", cartao: "#FFFFFF" },
    negocio: {
      nome: "Patas & Cia",
      icone: "pata",
      chamada: "Banho, tosa e muito carinho.",
      subtitulo: "Leva e traz grátis no bairro. Seu pet volta cheiroso e feliz.",
      cta: "Agendar banho",
      servicos: [
        { icone: "pata", titulo: "Banho e tosa", texto: "Produtos hipoalergênicos e secagem sem estresse." },
        { icone: "casa", titulo: "Leva e traz", texto: "Buscamos e devolvemos na sua porta." },
        { icone: "coracao", titulo: "Day care", texto: "Diversão supervisionada enquanto você trabalha." },
      ],
      sobre: "Somos tutores também. Tratamos cada pet como se fosse da família.",
      numeros: [["5 mil", "banhos"], ["Grátis", "leva e traz"], ["4,9", "no Google"]],
      depoimento: { texto: "Meu cachorro fica feliz só de ver a van chegando.", nome: "Tutor de cliente" },
    },
  },
];

export const categorias = Array.from(new Set(modelos.map((m) => m.categoria)));
export const estilos = Array.from(new Set(modelos.flatMap((m) => m.estilos)));

export function modeloPorSlug(slug: string) {
  return modelos.find((m) => m.slug === slug);
}
