export type CommunityFeedImage = {
  imageKey: string;
  src: string;
  alt: string;
  promptSummary: string;
  dominantTone: 'craft' | 'recycling' | 'garden' | 'mobility' | 'food' | 'repair' | 'nature';
};

export const COMMUNITY_FEED_IMAGES = {
  upcyclingCrafts: {
    imageKey: 'upcyclingCrafts',
    src: '/community/feed/f1-milk-carton-organizer.png',
    alt: 'Organizador de mesa feito com caixa de leite reaproveitada.',
    promptSummary: 'Caixa de leite transformada em organizador de mesa com materiais escolares.',
    dominantTone: 'craft',
  },
  recyclingBins: {
    imageKey: 'recyclingBins',
    src: '/community/feed/f2-battery-ecopoint.png',
    alt: 'Pilhas usadas em um coletor de EcoPonto para descarte correto.',
    promptSummary: 'Pilhas e baterias em coletor limpo de descarte seguro.',
    dominantTone: 'recycling',
  },
  urbanGarden: {
    imageKey: 'urbanGarden',
    src: '/community/feed/f3-pallet-vertical-garden.png',
    alt: 'Horta vertical de paletes com alfaces e ervas em varanda.',
    promptSummary: 'Horta vertical montada com paletes reaproveitados e folhas verdes.',
    dominantTone: 'garden',
  },
  bulkShopping: {
    imageKey: 'bulkShopping',
    src: '/community/feed/f4-bulk-shopping-jars.png',
    alt: 'Compra a granel com potes de vidro e sacolas reutilizáveis.',
    promptSummary: 'Potes reutilizáveis em compra a granel sem embalagem descartável.',
    dominantTone: 'recycling',
  },
  composting: {
    imageKey: 'composting',
    src: '/community/feed/f5-home-compost-bin.png',
    alt: 'Composteira doméstica limpa com folhas secas e resíduos orgânicos.',
    promptSummary: 'Composteira caseira organizada com resíduos orgânicos e composto pronto.',
    dominantTone: 'garden',
  },
  bicycle: {
    imageKey: 'bicycle',
    src: '/community/feed/f6-bike-commute.png',
    alt: 'Bicicleta de deslocamento urbano com mochila de trabalho.',
    promptSummary: 'Bicicleta como alternativa ao carro no trajeto diário de trabalho.',
    dominantTone: 'mobility',
  },
  vintageFashion: {
    imageKey: 'vintageFashion',
    src: '/community/feed/f7-thrift-finds.png',
    alt: 'Peças de brechó selecionadas em arara de roupas reutilizadas.',
    promptSummary: 'Achados de brechó em arara premium com roupas de segunda mão.',
    dominantTone: 'craft',
  },
  repairCafe: {
    imageKey: 'repairCafe',
    src: '/community/feed/f8-toaster-repair.png',
    alt: 'Torradeira aberta em bancada de reparo com ferramentas pequenas.',
    promptSummary: 'Torradeira sendo consertada para evitar descarte.',
    dominantTone: 'repair',
  },
  beachCleanup: {
    imageKey: 'beachCleanup',
    src: '/community/feed/f9-lake-cleanup.png',
    alt: 'Sacos de lixo coletados em mutirão na margem de um lago urbano.',
    promptSummary: 'Resultado de mutirão de limpeza no Lago Igapó com sacos coletados.',
    dominantTone: 'nature',
  },
  soap: {
    imageKey: 'soap',
    src: '/community/feed/f10-lavender-soap.png',
    alt: 'Sabonete em barra de lavanda sem embalagem plástica.',
    promptSummary: 'Sabonete sólido como alternativa de higiene sem plástico.',
    dominantTone: 'craft',
  },
  freshProduce: {
    imageKey: 'freshProduce',
    src: '/community/feed/f11-kale-stem-soup.png',
    alt: 'Sopa feita com talos de couve e cascas de vegetais.',
    promptSummary: 'Cozinha integral com sopa de talos e aproveitamento de cascas.',
    dominantTone: 'food',
  },
  ceramics: {
    imageKey: 'ceramics',
    src: '/community/feed/f12-broken-bottle-ceramics.png',
    alt: 'Cerâmica artesanal com fragmentos de garrafa de vidro reaproveitada.',
    promptSummary: 'Peça cerâmica com vidro quebrado reaproveitado em upcycling.',
    dominantTone: 'craft',
  },
  reusableBags: {
    imageKey: 'reusableBags',
    src: '/community/feed/f13-reusable-market-bags.png',
    alt: 'Sacolas de pano com produtos de feira, sem sacos plásticos.',
    promptSummary: 'Sacolas reutilizáveis substituindo saquinhos descartáveis na feira.',
    dominantTone: 'food',
  },
  forest: {
    imageKey: 'forest',
    src: '/community/feed/f14-arthur-thomas-trail-cleanup.png',
    alt: 'Trilha em floresta urbana com lixo recolhido em sacola reutilizável.',
    promptSummary: 'Trilha consciente no Parque Arthur Thomas com coleta de lixo encontrado.',
    dominantTone: 'nature',
  },
} as const satisfies Record<string, CommunityFeedImage>;

export type CommunityFeedImageKey = keyof typeof COMMUNITY_FEED_IMAGES;

export function communityFeedImage(imageKey: string): CommunityFeedImage {
  return (
    COMMUNITY_FEED_IMAGES[imageKey as CommunityFeedImageKey] ??
    COMMUNITY_FEED_IMAGES.upcyclingCrafts
  );
}
