// src/middlewares/rateLimiter.ts

import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';

/**
 * Configuração Padrão de Rate Limiting (Proteção Básica contra Abuso)
 * * Limita cada endereço IP a um máximo de 100 requisições
 * dentro de um período de 15 minutos (a "janela").
 */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos em milissegundos
  max: 100, // Limite de 100 requisições por IP na janela de 15 minutos
  
  // Define os cabeçalhos HTTP que informam o limite (padronização Draft 7)
  standardHeaders: 'draft-7', 
  
  // Desativa cabeçalhos antigos para maior conformidade
  legacyHeaders: false, 

  // Mensagem de erro e Status HTTP quando o limite é excedido
  message: {
    status: 429,
    message: 'Demasiadas requisições deste IP. Tente novamente após 15 minutos para restaurar o acesso.'
  },
  
  statusCode: 429 // Too Many Requests (Status HTTP padrão para Rate Limiting)
});