// 1. A CORREÇÃO: Carregar o .env no ficheiro que é lido PRIMEIRO
import * as dotenv from 'dotenv';
dotenv.config();

console.log("\n[LOG] 1. genkit.conf.ts - Ficheiro INICIADO. Carregando .env...");

// 2. Importar as ferramentas
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";

// 3. Criar e EXPORTAR a instância 'ai'
// O 'genkit start' vai ler isto, e o googleAI() vai encontrar a API key.
export const ai = genkit({ 
  plugins: [
    googleAI(), 
  ],
  model: gemini20Flash
});


console.log("[LOG] 2. genkit.conf.ts - Instância 'ai' criada. Importando flows...");
