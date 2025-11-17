import { z } from 'zod';

// Definimos e exportamos o schema central
export const characterSchema = z.object({
  name: z.string().describe("Nome completo do personagem"),
  age: z.number().describe("Idade principal do personagem (número)"),
  part: z.number().describe("Parte principal de Jojo (número)"),
  nationality: z.string().describe("Nacionalidade do personagem"),
  gender: z.string().describe("Gênero do personagem"),
  stand: z.string().describe("Dica referente o Stand (ou 'Nenhum')"),
  imageUrl: z.string().url().describe("URL pública de uma imagem do personagem")
});

// Também exportamos o TIPO TypeScript para usarmos no código
export type Character = z.infer<typeof characterSchema>;