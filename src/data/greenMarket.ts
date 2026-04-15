import type { ImpactFundSnapshot, ImpactPartner, MarketFaqItem, TokenPack } from '@/types';

export const TOKEN_PACKS: TokenPack[] = [
  {
    id: 'pack-broto',
    lookupKey: 'ecotokens_broto',
    name: 'Broto',
    description: 'Entrada leve para acelerar a jornada sem tirar o peso do jogo.',
    tokens: 60,
    priceInCents: 490,
    currency: 'BRL',
    fundSharePercent: 20,
    fundShareInCents: 98,
    badge: 'entrada consciente',
  },
  {
    id: 'pack-raiz',
    lookupKey: 'ecotokens_raiz',
    name: 'Raiz',
    description: 'Bom equilíbrio entre impulso de saldo e impacto imediato no fundo.',
    tokens: 140,
    priceInCents: 990,
    currency: 'BRL',
    fundSharePercent: 20,
    fundShareInCents: 198,
    badge: 'mais acessado',
  },
  {
    id: 'pack-copa',
    lookupKey: 'ecotokens_copa',
    name: 'Copa',
    description: 'Pack com melhor custo por token para quem já está engajado na rotina do app.',
    tokens: 320,
    priceInCents: 1990,
    currency: 'BRL',
    fundSharePercent: 20,
    fundShareInCents: 398,
    badge: 'melhor valor',
    featured: true,
  },
  {
    id: 'pack-floresta',
    lookupKey: 'ecotokens_floresta',
    name: 'Floresta',
    description: 'Pensado para jogadores recorrentes que querem destravar mais rápido a loja atual.',
    tokens: 700,
    priceInCents: 3990,
    currency: 'BRL',
    fundSharePercent: 20,
    fundShareInCents: 798,
    badge: 'impacto ampliado',
  },
];

export const IMPACT_FUND_SNAPSHOT: ImpactFundSnapshot = {
  totalRaisedInCents: 184320,
  totalCommittedInCents: 36864,
  supportedOrgs: 5,
  coveredSdgs: 17,
  lastTransferAt: '2026-04-05',
  verificationNote: 'Critérios públicos, documentação institucional e checagem em bases abertas antes de cada repasse.',
};

export const IMPACT_PARTNERS: ImpactPartner[] = [
  {
    id: 'partner-mare-circular',
    name: 'Instituto Maré Circular',
    city: 'Recife',
    state: 'PE',
    summary: 'Educação costeira e logística comunitária para reduzir resíduos e proteger manguezais.',
    sdgs: ['ODS 6', 'ODS 14', 'ODS 15'],
    verificationStatus: 'Verificada em bases públicas',
  },
  {
    id: 'partner-ponte-solar',
    name: 'Laboratório Ponte Solar',
    city: 'Fortaleza',
    state: 'CE',
    summary: 'Capacitação de bairros periféricos em energia limpa, retrofit urbano e consumo eficiente.',
    sdgs: ['ODS 7', 'ODS 9', 'ODS 11', 'ODS 13'],
    verificationStatus: 'Documentação institucional validada',
  },
  {
    id: 'partner-raiz-da-quebrada',
    name: 'Coletivo Raiz da Quebrada',
    city: 'São Paulo',
    state: 'SP',
    summary: 'Rede local de formação, renda e cidadania climática com foco em juventude e mulheres.',
    sdgs: ['ODS 1', 'ODS 4', 'ODS 5', 'ODS 10', 'ODS 16'],
    verificationStatus: 'Elegível para repasse curado',
  },
  {
    id: 'partner-semeia-futuro',
    name: 'Aliança Semeia Futuro',
    city: 'Belém',
    state: 'PA',
    summary: 'Produção agroecológica, alimentação saudável e articulação entre comunidades e cooperativas.',
    sdgs: ['ODS 2', 'ODS 3', 'ODS 8', 'ODS 12', 'ODS 17'],
    verificationStatus: 'Verificação documental concluída',
  },
  {
    id: 'partner-aurora-nascentes',
    name: 'Rede Aurora das Nascentes',
    city: 'Extrema',
    state: 'MG',
    summary: 'Proteção hídrica, recuperação de áreas degradadas e monitoramento comunitário de bacias.',
    sdgs: ['ODS 6', 'ODS 13', 'ODS 15'],
    verificationStatus: 'Em monitoramento contínuo',
  },
];

export const MARKET_FAQS: MarketFaqItem[] = [
  {
    id: 'faq-saldo',
    question: 'Eco-Tokens comprados substituem os ganhos do jogo?',
    answer: 'Não. Você continua ganhando Eco-Tokens normalmente por missões, scanner, desafios e ações da comunidade.',
  },
  {
    id: 'faq-fundo',
    question: 'Os 20% vão para onde?',
    answer: 'Eles compõem o Fundo EcoPulse, com repasses periódicos para OSCs alinhadas aos ODS.',
  },
  {
    id: 'faq-ong',
    question: 'Posso escolher a ONG?',
    answer: 'Ainda não. O fundo é curado automaticamente pela EcoPulse.',
  },
  {
    id: 'faq-validacao',
    question: 'Como vocês validam as instituições?',
    answer: 'Usamos critérios públicos, documentação institucional e presença em bases abertas antes de repassar.',
  },
];
