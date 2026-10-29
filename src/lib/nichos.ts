// Páginas "Site para X" (/para/[slug]): aparecem no Google para buscas de cada nicho
// e servem de página de destino para anúncios segmentados.

export type Nicho = {
  slug: string;
  nome: string; // como aparece no título: "Site para {nome}"
  singular: string; // "sua hamburgueria"
  modelo: string; // slug do modelo de partida
  dor: string;
  beneficios: { titulo: string; texto: string }[];
  perguntas: { pergunta: string; resposta: string }[];
};

export const nichos: Nicho[] = [
  {
    slug: "hamburguerias",
    nome: "hamburguerias",
    singular: "sua hamburgueria",
    modelo: "onda",
    dor: "Quem tem fome procura no Google e no Instagram. Se o seu cardápio não aparece, o pedido vai para o vizinho.",
    beneficios: [
      { titulo: "Cardápio online", texto: "Burgers, fritas e bebidas com preço e foto, fácil de atualizar." },
      { titulo: "Pedido em um clique", texto: "Botão direto para WhatsApp, iFood ou seu app de delivery." },
      { titulo: "No Google Maps", texto: "Endereço, horário e avaliações aparecendo para quem está perto." },
    ],
    perguntas: [
      { pergunta: "Dá para colocar o cardápio com preços?", resposta: "Sim. O cardápio fica organizado por categorias, com descrição e preço, e eu te ensino a atualizar." },
      { pergunta: "Integra com iFood ou app de delivery?", resposta: "Sim, os botões de pedido podem levar para o iFood, para o seu app próprio ou direto para o WhatsApp." },
    ],
  },
  {
    slug: "restaurantes",
    nome: "restaurantes e delivery",
    singular: "seu restaurante",
    modelo: "brasa",
    dor: "Cliente novo decide onde comer pelo celular, em segundos. Site bonito e cardápio claro fazem ele escolher você.",
    beneficios: [
      { titulo: "Cardápio sempre atualizado", texto: "Pratos, combos e horários num lugar só." },
      { titulo: "Reserva e delivery", texto: "Botões de reserva e pedido direto no WhatsApp." },
      { titulo: "Aparece para quem está perto", texto: "Configuração para buscas como “restaurante perto de mim”." },
    ],
    perguntas: [
      { pergunta: "Consigo receber reservas pelo site?", resposta: "Sim, pelo WhatsApp com mensagem pronta, ou por formulário que chega para você." },
      { pergunta: "Precisa de fotos profissionais?", resposta: "Ajuda, mas não é obrigatório. Dá para começar com boas fotos de celular." },
    ],
  },
  {
    slug: "clinicas-odontologicas",
    nome: "clínicas odontológicas e consultórios",
    singular: "sua clínica",
    modelo: "sereno",
    dor: "Paciente pesquisa antes de marcar. Um site que passa confiança vira agendamento; sem site, vira dúvida.",
    beneficios: [
      { titulo: "Agendamento pelo WhatsApp", texto: "O paciente marca a avaliação em um clique." },
      { titulo: "Confiança desde o primeiro clique", texto: "Equipe, estrutura, tratamentos e registro profissional à vista." },
      { titulo: "Pronto para o Google", texto: "Páginas pensadas para “dentista em [sua cidade]”." },
    ],
    perguntas: [
      { pergunta: "O site segue as regras do conselho profissional?", resposta: "Sim. Os textos evitam promessas de resultado e sensacionalismo, e incluem o registro profissional." },
      { pergunta: "Posso mostrar antes e depois?", resposta: "Depende das regras do seu conselho. Eu te ajudo a montar o conteúdo dentro do permitido." },
    ],
  },
  {
    slug: "saloes-de-beleza",
    nome: "salões de beleza e estética",
    singular: "seu salão",
    modelo: "bloom",
    dor: "Sua agenda depende de quem te encontra. Instagram mostra o trabalho; o site transforma a visita em horário marcado.",
    beneficios: [
      { titulo: "Serviços e preços claros", texto: "Cabelo, unhas e estética organizados para a cliente escolher." },
      { titulo: "Reserva rápida", texto: "Botão para marcar horário pelo WhatsApp ou app de agenda." },
      { titulo: "Visual que combina com você", texto: "Cores e fotos com a cara do seu espaço." },
    ],
    perguntas: [
      { pergunta: "Integra com app de agendamento?", resposta: "Sim, o botão pode levar para o seu app de agenda ou para o WhatsApp." },
      { pergunta: "Dá para mostrar meus trabalhos?", resposta: "Sim, com galeria de fotos e link para o seu Instagram." },
    ],
  },
  {
    slug: "advogados",
    nome: "advogados e escritórios de advocacia",
    singular: "seu escritório",
    modelo: "toga",
    dor: "Quem precisa de um advogado pesquisa com calma. Um site sério e claro faz o cliente escolher falar com você.",
    beneficios: [
      { titulo: "Áreas de atuação claras", texto: "Cada área explicada em linguagem simples." },
      { titulo: "Contato discreto", texto: "WhatsApp e formulário para o primeiro atendimento." },
      { titulo: "Dentro das regras da OAB", texto: "Conteúdo informativo, sem captação indevida." },
    ],
    perguntas: [
      { pergunta: "O site segue o Código de Ética da OAB?", resposta: "Sim. O conteúdo é informativo e sóbrio, sem promessas de resultado nem mercantilização." },
      { pergunta: "Posso ter um blog jurídico?", resposta: "Pode, e ajuda muito a aparecer no Google. O blog é um extra de R$ 497." },
    ],
  },
  {
    slug: "contadores",
    nome: "contadores e escritórios de contabilidade",
    singular: "seu escritório",
    modelo: "conta-certa",
    dor: "Empreendedor procura contador no Google. Quem tem site claro, com serviços e preços, fecha mais clientes.",
    beneficios: [
      { titulo: "Serviços bem explicados", texto: "Abertura de empresa, MEI, impostos e folha." },
      { titulo: "Orçamento pelo WhatsApp", texto: "O cliente pede proposta em um clique." },
      { titulo: "Autoridade com conteúdo", texto: "Blog opcional com dicas que atraem clientes." },
    ],
    perguntas: [
      { pergunta: "Dá para atender clientes de todo o Brasil?", resposta: "Sim. O site pode focar em atendimento 100% online." },
      { pergunta: "Posso colocar uma calculadora ou simulador?", resposta: "Sim, como projeto sob medida (a partir de + R$ 997)." },
    ],
  },
  {
    slug: "personal-trainers",
    nome: "personal trainers e academias",
    singular: "sua consultoria",
    modelo: "pulso",
    dor: "Aluno novo chega pelo Instagram, mas fecha quando entende o seu método. Uma landing page explica e vende por você.",
    beneficios: [
      { titulo: "Landing page que vende", texto: "Método, resultados e planos numa página só." },
      { titulo: "Perfeita para anúncios", texto: "Feita para receber tráfego do Instagram e do Google." },
      { titulo: "Matrícula pelo WhatsApp", texto: "O aluno chama você com a mensagem pronta." },
    ],
    perguntas: [
      { pergunta: "Serve para consultoria online?", resposta: "Sim, a landing page é ideal para vender consultoria online." },
      { pergunta: "Posso mostrar resultados de alunos?", resposta: "Sim, com autorização dos alunos e respeitando as regras do seu conselho." },
    ],
  },
  {
    slug: "pet-shops",
    nome: "pet shops e banho e tosa",
    singular: "seu pet shop",
    modelo: "patas",
    dor: "Tutor quer confiança antes de deixar o pet com alguém. O site mostra cuidado e facilita o agendamento.",
    beneficios: [
      { titulo: "Agendamento fácil", texto: "Banho, tosa e day care marcados pelo WhatsApp." },
      { titulo: "Leva e traz em destaque", texto: "Bairros atendidos e horários à vista." },
      { titulo: "Aparece no bairro", texto: "Configuração para buscas locais no Google." },
    ],
    perguntas: [
      { pergunta: "Dá para mostrar preços por porte do pet?", resposta: "Sim, em tabela simples por porte e serviço." },
      { pergunta: "Posso vender produtos?", resposta: "Sim, com loja virtual (projeto sob medida a partir de + R$ 997)." },
    ],
  },
  {
    slug: "arquitetos",
    nome: "arquitetos e designers de interiores",
    singular: "seu estúdio",
    modelo: "linha",
    dor: "Seu portfólio é seu maior vendedor. Um site elegante mostra seus projetos do jeito que eles merecem.",
    beneficios: [
      { titulo: "Portfólio em destaque", texto: "Projetos com fotos grandes e descrição." },
      { titulo: "Visual minimalista", texto: "O design não compete com o seu trabalho." },
      { titulo: "Orçamento direto", texto: "O cliente conta o projeto e fala com você." },
    ],
    perguntas: [
      { pergunta: "Consigo adicionar projetos novos depois?", resposta: "Sim, eu deixo um jeito simples de incluir novos projetos." },
      { pergunta: "Precisa de muitas páginas?", resposta: "Não. Até 5 páginas cobrem bem um estúdio; projetos maiores entram como extra." },
    ],
  },
];

export function nichoPorSlug(slug: string) {
  return nichos.find((n) => n.slug === slug);
}
