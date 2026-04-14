import type { Product } from '@/types';

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Café Orgânico Serra Alta', brand: 'Serra Alta', category: 'Alimentos', emoji: '☕', score: 'A', breakdown: { carbono: 92, embalagem: 85, reciclabilidade: 90, origem: 95 }, tip: 'Embalagem 100% compostável. Produção local com certificação orgânica.' },
  { id: 'p2', name: 'Sabonete Artesanal Lavanda', brand: 'NaturaBio', category: 'Higiene', emoji: '🧼', score: 'A', breakdown: { carbono: 88, embalagem: 90, reciclabilidade: 85, origem: 92 }, tip: 'Ingredientes naturais, embalagem de papel reciclado.' },
  { id: 'p3', name: 'Leite Vegetal de Aveia', brand: 'VegLife', category: 'Bebidas', emoji: '🥛', score: 'B', breakdown: { carbono: 78, embalagem: 72, reciclabilidade: 80, origem: 75 }, tip: 'Baixa pegada hídrica. Embalagem Tetra Pak reciclável.' },
  { id: 'p4', name: 'Camiseta Algodão Reciclado', brand: 'ReWear', category: 'Moda', emoji: '👕', score: 'B', breakdown: { carbono: 75, embalagem: 70, reciclabilidade: 82, origem: 68 }, tip: 'Fibras recicladas pós-consumo, produção ética certificada.' },
  { id: 'p5', name: 'Detergente Biodegradável', brand: 'BioClean', category: 'Limpeza', emoji: '🧴', score: 'B', breakdown: { carbono: 70, embalagem: 75, reciclabilidade: 78, origem: 65 }, tip: 'Fórmula biodegradável, frasco reutilizável com refil.' },
  { id: 'p6', name: 'Snack Bar Proteico', brand: 'FitNut', category: 'Alimentos', emoji: '🍫', score: 'C', breakdown: { carbono: 55, embalagem: 50, reciclabilidade: 60, origem: 58 }, tip: 'Embalagem mista (plástico+alumínio) dificulta reciclagem.' },
  { id: 'p7', name: 'Shampoo Tradicional', brand: 'HairPlus', category: 'Higiene', emoji: '🧴', score: 'C', breakdown: { carbono: 52, embalagem: 45, reciclabilidade: 55, origem: 50 }, tip: 'Plástico reciclável, porém fórmula contém microplásticos.' },
  { id: 'p8', name: 'Refrigerante Cola Zero', brand: 'Cola Co.', category: 'Bebidas', emoji: '🥤', score: 'D', breakdown: { carbono: 30, embalagem: 25, reciclabilidade: 40, origem: 35 }, tip: 'Produção intensiva em carbono e água. Lata reciclável.' },
  { id: 'p9', name: 'Camiseta Fast Fashion', brand: 'QuickWear', category: 'Moda', emoji: '👚', score: 'D', breakdown: { carbono: 28, embalagem: 20, reciclabilidade: 35, origem: 22 }, tip: 'Poliéster virgem, produção em massa, baixa durabilidade.' },
  { id: 'p10', name: 'Garrafa Água Plástica 500ml', brand: 'AquaPura', category: 'Bebidas', emoji: '💧', score: 'E', breakdown: { carbono: 15, embalagem: 10, reciclabilidade: 30, origem: 20 }, tip: 'PET de uso único, alto impacto ambiental. Prefira reutilizável!' },
];
