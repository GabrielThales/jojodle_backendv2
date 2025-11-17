import { initializeApp, cert, getApps, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from '../service-account.json' with { type: "json" };
import { assert } from 'console';

console.log("[LOG] firebaseService.ts - Iniciando Firebase...");
//const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

console.log("[LOG] firebaseService.ts - serviceAccount carregado.");

/*if (!getApps.length) {
    if (serviceAccount) {
        // If you store the service account JSON in an env var
        initializeApp({
            credential: cert(serviceAccount as ServiceAccount),
        });
    } else {
        // Use GOOGLE_APPLICATION_CREDENTIALS or ADC otherwise
        initializeApp();
    }
}*/

// --- INICIALIZAÇÃO DO FIREBASE (NOVA LÓGICA) ---
const initializeFirebase = async () => {
  if (getApps().length === 0) {
    
    // 1. Tentar ler a variável de ambiente do Vercel
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    let serviceAccount: ServiceAccount;

    if (b64) {
      // ESTAMOS EM PRODUÇÃO (VERCEL)
      console.log("[LOG] Lendo Service Account a partir da variável Base64...");
      const decodedString = Buffer.from(b64, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decodedString) as ServiceAccount;
    } else {
      // ESTAMOS EM DESENVOLVIMENTO (LOCAL)
      console.log("[LOG] Lendo Service Account do ficheiro local (service-account.json)...");
      // Importa o ficheiro local (só funciona em dev)
      const localAccount = await import('../service-account.json', { with: { type: 'json' } })
      serviceAccount = localAccount.default as ServiceAccount;
    }

    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("[LOG] 2.1. genkit.conf.ts - Firebase getApps() INICIALIZADO.");
  }
};

await initializeFirebase();

export const db = getFirestore()

export const getDb = (): FirebaseFirestore.Firestore => db;

export const getCollection = (name: string) => db.collection(name);

export const addDocument = async (collection: string, data: any) => {
    const ref = await db.collection(collection).add(data);
    return ref.id;
};

export const getDocument = async (collection: string, id: string) => {
    const snap = await db.collection(collection).doc(id).get();
    return snap.exists ? { id: snap.id, ...(snap.data() as object) } : null;
};

export default db;
console.log("[LOG] firebaseService.ts - Firebase inicializado.");