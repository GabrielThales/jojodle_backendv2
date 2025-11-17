import { z } from 'zod';
import { ai } from './genkit.conf.js'; // Importamos 'ai' (para a lógica de IA)

console.log("[LOG IA] index.ts - Ficheiro INICIADO (Biblioteca de IA).");

// --- Definições da Lógica de Dica ---
const outputSchemaTip = z.object({
    tip: z.string().describe("Uma dica curta e sutil sobre o personagem.")
});

const promptJojoTip = (nomeDoPersonagem: string) => `
    Você é um especialista em Jojo's Bizarre Adventure. O personagem secreto é ${nomeDoPersonagem}.
    O jogador precisa de uma dica.
    Pense sobre a personalidade, habilidades e impacto na trama deste personagem.
    Gere UMA (1) única dica de string curta.
    REGRAS DA DICA:
    1. Em Português do Brasil.
    2. NÃO deve conter o nome do personagem (${nomeDoPersonagem}) ou o nome do seu Stand.
    3. Deve ser sutil, mas útil.
`;

// -----------------------------------------------------------------
// A LÓGICA DA IA (Exportada como uma função normal)
// -----------------------------------------------------------------
export async function getJojoTipLogic(nomeDoPersonagem: string) {
    console.log(`[LOG IA] Lógica 'getJojoTipLogic' executada para: ${nomeDoPersonagem}`);
    
    const response = await ai.generate({
        prompt: promptJojoTip(nomeDoPersonagem), 
        output: {
            schema: outputSchemaTip
        },
        config: { temperature: 0.7 }
    });

    if (!response.output) {
        throw new Error("Falha ao gerar a dica. A resposta do modelo foi nula.");
    }
    
    return response.output; // Retorna o objeto { tip: "..." }
}

console.log("[LOG IA] index.ts - Função 'getJojoTipLogic' FOI DEFINIDA.");