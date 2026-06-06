import admin from 'firebase-admin';

// Inicializa o Firebase Admin SDK usando a variável de ambiente
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin inicializado com sucesso.");
  } catch (error) {
    console.error("❌ Falha ao inicializar o Firebase Admin. Certifique-se de que FIREBASE_SERVICE_ACCOUNT está configurada:", error);
  }
}

export default async function handler(req, res) {
  // Apenas aceita requisições POST da Kiwify
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validação do Token de Segurança
  const expectedToken = process.env.VITE_KIWIFY_WEBHOOK_TOKEN || 'xmwe0p3tnj0';
  const providedToken = req.query.token;

  if (providedToken !== expectedToken) {
    console.error("❌ Token de verificação inválido ou ausente.");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Função auxiliar para buscar chaves de forma case-insensitive em objetos aninhados
  function findVal(object, keyName) {
    if (!object || typeof object !== 'object') return undefined;
    for (const key of Object.keys(object)) {
      if (key.toLowerCase() === keyName.toLowerCase()) {
        return object[key];
      }
    }
    for (const key of Object.keys(object)) {
      const val = object[key];
      if (val && typeof val === 'object') {
        const found = findVal(val, keyName);
        if (found !== undefined) {
          return found;
        }
      }
    }
    return undefined;
  }

  try {
    const data = req.body;
    
    // Busca e-mail e documento de forma dinâmica e tolerante a maiúsculas/minúsculas e aninhamentos
    const email = findVal(data, 'email');
    const documentNumber = findVal(data, 'cpf') || findVal(data, 'cnpj') || findVal(data, 'document') || findVal(data, 'documento');
    const eventType = findVal(data, 'webhook_event_type') || findVal(data, 'event_type');
    const orderStatus = findVal(data, 'order_status') || findVal(data, 'status');

    console.log(`🔌 Recebido webhook da Kiwify. Evento: ${eventType || 'N/A'}, Status: ${orderStatus || 'N/A'}, Email: ${email || 'N/A'}`);

    if (!email) {
        console.log("⚠️ Payload incompleto recebido (falta e-mail):", JSON.stringify(data));
        return res.status(200).json({ message: "Webhook recebido, mas e-mail não identificado." });
    }

    // Determina o tipo de ação com base nos gatilhos da Kiwify
    const isActivation = 
      eventType === 'compra_aprovada' || 
      eventType === 'subscription_renewed' || 
      orderStatus === 'paid';

    const isDeactivation = 
      eventType === 'compra_reembolsada' || 
      eventType === 'chargeback' || 
      eventType === 'subscription_canceled' || 
      eventType === 'subscription_late' || 
      orderStatus === 'refunded' || 
      orderStatus === 'chargedback';

    if (isActivation) {
      if (!documentNumber) {
        console.log("⚠️ Payload de ativação recebido sem documento (CPF/CNPJ) para senha.");
        return res.status(200).json({ message: "Webhook de ativação recebido, mas sem documento para gerar a senha." });
      }

      // Limpa o documento para conter apenas os números (ex: 123.456.789-00 -> 12345678900)
      const password = String(documentNumber).replace(/\D/g, '');

      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        // Se o usuário já existe e está desativado, ativa ele de volta
        if (userRecord.disabled) {
          await admin.auth().updateUser(userRecord.uid, { disabled: false });
          console.log(`✅ Conta reativada com sucesso para: ${email}`);
          return res.status(200).json({ message: "Conta reativada com sucesso" });
        } else {
          console.log(`⚠️ A conta ${email} já existe e está ativa.`);
          return res.status(200).json({ message: "A conta já existe e está ativa" });
        }
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Cria o usuário
          await admin.auth().createUser({
            email: email,
            password: password,
            emailVerified: true
          });
          console.log(`✅ Conta criada com sucesso para: ${email}`);
          return res.status(200).json({ message: "Conta criada com sucesso no Firebase" });
        } else {
          throw error;
        }
      }
    } else if (isDeactivation) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        // Desativa o usuário
        await admin.auth().updateUser(userRecord.uid, { disabled: true });
        console.log(`🚫 Conta desativada com sucesso para: ${email} (Evento: ${eventType || orderStatus})`);
        return res.status(200).json({ message: "Conta desativada com sucesso no Firebase" });
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log(`⚠️ Tentou desativar ${email}, mas o usuário não foi encontrado.`);
          return res.status(200).json({ message: "Usuário não encontrado para desativação" });
        } else {
          throw error;
        }
      }
    } else {
      console.log(`ℹ️ Evento ignorado (não é de ativação nem de desativação): ${eventType || orderStatus}`);
      return res.status(200).json({ message: "Evento ignorado" });
    }

  } catch (error) {
    console.error("❌ Erro interno no webhook:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
