export default async function handler(req, res) {
  // Apenas aceita requisições POST da Kiwify
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    
    // TODO: Ajustaremos estes campos assim que você enviar o payload real da Kiwify
    // Estamos tentando adivinhar as chaves mais comuns de plataformas de pagamento
    const email = data?.email || data?.Customer?.email || data?.cliente?.email;
    const documentNumber = data?.document || data?.Customer?.cpf || data?.Customer?.cnpj || data?.cliente?.cpf;

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
