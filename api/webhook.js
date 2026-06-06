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

    if (!email || !documentNumber) {
        console.log("⚠️ Payload incompleto recebido:", JSON.stringify(data));
        // Retornamos 200 para a Kiwify parar de tentar reenviar em caso de teste/payload sem cliente
        return res.status(200).json({ message: "Webhook recebido, mas sem dados suficientes para criar conta." });
    }

    // Limpa o documento para conter apenas os números (ex: 123.456.789-00 -> 12345678900)
    const password = String(documentNumber).replace(/\D/g, '');

    // Utiliza a chave do Firebase que já está configurada na Vercel
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Erro interno: VITE_FIREBASE_API_KEY ausente.");
      return res.status(500).json({ error: "Erro de configuração no servidor." });
    }

    // Faz a chamada para a API REST do Firebase Authentication
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: false
        })
    });

    const result = await response.json();

    if (response.ok) {
        console.log(`✅ Conta criada com sucesso para: ${email}`);
        return res.status(200).json({ message: "Conta criada com sucesso no Firebase" });
    } else if (result.error && result.error.message === 'EMAIL_EXISTS') {
        console.log(`⚠️ A conta ${email} já existe.`);
        // Conta já existia, então consideramos sucesso para a plataforma de pagamentos
        return res.status(200).json({ message: "A conta já existia no sistema" });
    } else {
        console.error(`❌ Erro do Firebase ao criar ${email}:`, result.error.message);
        return res.status(400).json({ error: result.error.message });
    }

  } catch (error) {
    console.error("❌ Erro interno no webhook:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
