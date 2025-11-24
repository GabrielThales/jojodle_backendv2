import express from 'express';
import cors from 'cors';
import { db } from './firebaseService.js';
import { z } from 'zod';
// Importamos nosso banco de dados
import { type Character } from './schemas.js'; // Importamos o TIPO
import { getJojoTipLogic } from './index.js';
import type { CorsOptions } from 'cors';
import { apiLimiter } from './middlewares/rateLimiter.js';

console.log("[LOG API] Ficheiro api.ts CARREGADO.");

let lastKnownDay = new Date().getDate();
let character_of_the_day: Character | null = null;

getRandomCharacter(); // Inicializa o personagem do dia na carga inicial

// Verifica a mudança de dia a cada hora
setInterval(() => {
  const currentDay = new Date().getDate();
  if (currentDay !== lastKnownDay) {
    console.log('Novo dia detectado! Atualizando personagem do dia... Personagem anterior:', character_of_the_day);
    getRandomCharacter();
    console.log('Personagem do dia atualizado para:', character_of_the_day);
    lastKnownDay = currentDay; // Update the last known day
  }
}, 60 * 60 * 1000); // Check every hour (adjust as needed for precision)

// 1. Criar a app Express
 // Permite que a app entenda JSON

 const app = express();

 app.set('trust proxy', 1);

// Lista de domínios permitidos // 'http://127.0.0.1:5500' LOCAL
const whitelist = ['https://jojodle-blond.vercel.app'];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Verificação detalhada:
    // 1. !origin: Permite requisições sem 'Origin' (como Postman, Apps Mobile, ou backend-to-backend).
    //    Se quiseres bloquear tudo que não seja navegador, remove o "!origin ||".
    // 2. whitelist.indexOf(origin) !== -1: Verifica se a origem está na lista.
    
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true); // Permite o acesso
    } else {
      callback(new Error('Acesso negado por CORS: Origem não permitida.')); // Bloqueia
    }
  }
};

// Aplica o middleware CORS antes das rotas
app.use(cors(corsOptions));

app.use(express.json());
app.use(apiLimiter);

app.use((req, res, next) => {
  console.log(`[LOG API] Pedido recebido: ${req.method} ${req.originalUrl}`);
  next(); // Continua para as rotas
});

// --- ENDPOINT 1: Retorna toda a coleção ---
app.get('/jojo_characters', async (req, res) => {
  try {
    const collectionRef = db.collection('jojo_characters');
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Nenhum personagem encontrado." });
    }

    const characters = snapshot.docs.map(doc => doc.data() as Character);
    return res.status(200).json(characters);

  } catch (error) {
    console.error("Erro ao buscar personagens:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});


// Função para buscar um personagem aleatório
async function getRandomCharacter() {
  const collectionRef = db.collection('jojo_characters');
  const snapshot = await collectionRef.get();
  const characters = snapshot.docs.map(doc => doc.data() as Character);
  const randomIndex = Math.floor(Math.random() * characters.length);
  character_of_the_day = characters[randomIndex];
} 
 

// --- ENDPOINT 2: Retorna o personagem do dia ---
app.get('/character_of_the_day', async (req, res) => {
  try {
    if (!character_of_the_day) {
      return res.status(404).json({ error: "Personagem do dia não está disponível." });
    }
    return res.status(200).json(character_of_the_day);

  } catch (error) {
    console.error("Erro ao buscar personagem do dia:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// --- ENDPOINT 3: Usar a Lógica de IA para obter uma dica ---
const characterInputSchema = z.object({
  nomeDoPersonagem: z.string(),
});

app.post('/getJojoTip', async (req, res) => {
  try {
    // 1. Validar a entrada (input)
    //const input = characterInputSchema.parse(req.body);

    if (!character_of_the_day) {
      return res.status(404).json({ error: "Personagem do dia não está disponível." });
    }
    
    // 2. Chamar a nossa lógica de IA importada
    const tipResult = await getJojoTipLogic(character_of_the_day.name);
    
    // 3. Retornar a resposta
    return res.status(200).json(tipResult); 

  } catch (error) {
    console.error("Erro no endpoint /getJojoTip:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

//const PORT = 3000;

// Mandar o Express "ouvir" nessa porta
//app.listen(PORT, () => {
//  console.log(`[LOG API] Servidor Express (Dados) a rodar na porta ${PORT}`);
//});

const PORT = process.env.PORT || 3000;

// Só iniciamos o servidor se NÃO estivermos na Vercel
// A Vercel define process.env.VERCEL como '1' ou true
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

export default app;
