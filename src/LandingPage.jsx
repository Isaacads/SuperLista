import { useState } from 'react';

function LandingPage({ setView }) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = info/form, 2 = success

  const handleStartSimulatedPayment = () => {
    setShowCheckoutModal(true);
    setCheckoutStep(1);
  };

  const handleConfirmPayment = () => {
    setCheckoutStep(2);
  };

  const handleFinishCheckout = () => {
    setShowCheckoutModal(false);
    setView('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-800 font-sans">
      
      {/* Header / Navbar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center border-b border-green-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-green-700 tracking-tight flex items-center gap-1.5">
            🛒 SuperLista
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <button 
            onClick={() => setView('login')}
            className="text-sm font-bold text-green-700 hover:text-green-950 transition-colors"
          >
            Entrar
          </button>
          <button 
            onClick={handleStartSimulatedPayment}
            className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Começar Agora
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4">
          ✨ Organização Inteligente
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-green-900 leading-tight tracking-tight max-w-4xl mx-auto mb-6">
          Sua lista de compras simplificada, organizada e em qualquer lugar
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Monte suas listas rapidamente com autocomplete, calcule seus gastos em tempo real, separe por categorias e compartilhe entre seus dispositivos de forma instantânea.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={handleStartSimulatedPayment}
            className="px-8 py-4 text-base font-extrabold text-white bg-green-600 hover:bg-green-700 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-102"
          >
            Assinar Plano Anual — R$ 9,90
          </button>
          <button 
            onClick={() => setView('login')}
            className="px-8 py-4 text-base font-extrabold text-green-700 bg-green-100 hover:bg-green-200 rounded-2xl transition-all"
          >
            Já sou assinante
          </button>
        </div>

        {/* Mockup da Interface */}
        <div className="mt-16 max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-green-100 p-2 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl overflow-hidden shadow-inner p-4 sm:p-6 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-black text-green-800">Preview da Lista de Compras</h3>
              <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Modo Compra Disponível</span>
            </div>
            {/* Dashboard stats layout */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 mb-4 text-white">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="opacity-75">Itens</div>
                  <div className="text-base font-bold">5</div>
                </div>
                <div>
                  <div className="opacity-75">A Gastar</div>
                  <div className="text-base font-bold">R$ 42,90</div>
                </div>
                <div>
                  <div className="opacity-75">Já Gasto</div>
                  <div className="text-base font-bold">R$ 18,50</div>
                </div>
              </div>
            </div>
            {/* List items visual mockup */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm">
                <span className="text-base">🥩</span>
                <span className="font-bold text-gray-700">Carne Moída</span>
                <span className="text-gray-400 text-xs ml-auto">1 kg — R$ 29,90</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm">
                <span className="text-base">🥛</span>
                <span className="font-bold text-gray-700">Leite Integral</span>
                <span className="text-gray-400 text-xs ml-auto">2 un — R$ 10,00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-green-50/50 py-20 border-y border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-green-950">Recursos feitos para facilitar suas compras</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Tudo que você precisa para ir ao supermercado e economizar de forma descomplicada.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-700 flex items-center justify-center rounded-xl text-2xl font-bold mb-5">☁️</div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Sincronização em Nuvem</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Escreva a lista no computador e ela aparecerá instantaneamente no seu celular quando você estiver no supermercado. Nunca mais perca dados.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-700 flex items-center justify-center rounded-xl text-2xl font-bold mb-5">🛒</div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Modo Compra Focado</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Ative o modo focado para ocultar menus e botões de edição desnecessários, facilitando o toque nos itens para marcá-los enquanto empurra o carrinho.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-700 flex items-center justify-center rounded-xl text-2xl font-bold mb-5">🔍</div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Sugestão Inteligente</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Autocomplete integrado com mais de 80 produtos mais comuns do Brasil. Autopreencha a categoria correta ao digitar!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Card Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-black text-green-950 mb-3">Preço Simples e Transparente</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-10">Tudo incluso por um preço menor que o de uma barra de chocolate.</p>
        
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl border-2 border-green-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-green-500 text-white font-bold text-xs py-1.5 px-4 rounded-bl-2xl">
            MELHOR VALOR
          </div>
          <span className="text-gray-400 font-bold uppercase tracking-wider text-xs block mb-2">Acesso Total</span>
          <h3 className="text-2xl font-black text-green-900 mb-4">Plano SuperLista Anual</h3>
          <div className="flex justify-center items-baseline mb-6">
            <span className="text-3xl font-extrabold text-green-800">R$</span>
            <span className="text-6xl font-black text-green-700 tracking-tight mx-1">9,90</span>
            <span className="text-gray-400 text-sm font-bold">/ ano</span>
          </div>
          <ul className="text-left text-sm text-gray-600 space-y-3 mb-8">
            <li className="flex items-center gap-2">
              <span className="text-green-500 text-base">✓</span> Listas ilimitadas sincronizadas na nuvem
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 text-base">✓</span> Estatísticas e estimativas de custos em tempo real
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 text-base">✓</span> Filtro inteligente por categorias com cores
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 text-base">✓</span> Modo compra otimizado para celulares
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 text-base">✓</span> Autocomplete de produtos brasileiros
            </li>
          </ul>
          <button 
            onClick={handleStartSimulatedPayment}
            className="w-full py-4 text-base font-extrabold text-white bg-green-600 hover:bg-green-700 rounded-2xl transition-all shadow-md hover:shadow-lg"
          >
            Assinar Agora
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-green-950 text-center mb-8">Dúvidas Frequentes</h2>
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-bold text-green-900 mb-1">Como funciona a assinatura de R$ 9,90/ano?</h4>
              <p className="text-gray-500 text-sm">O pagamento é processado anualmente. Dá acesso total ao aplicativo em todos os seus celulares, tablets e computadores.</p>
            </div>
            <div>
              <h4 className="text-base font-bold text-green-900 mb-1">Os meus dados ficam salvos se eu desinstalar?</h4>
              <p className="text-gray-500 text-sm">Sim. Todas as suas listas ficam salvas em nosso banco de dados em nuvem seguro e serão carregadas assim que você fizer login novamente.</p>
            </div>
            <div>
              <h4 className="text-base font-bold text-green-900 mb-1">Posso acessar sem internet?</h4>
              <p className="text-gray-500 text-sm">Sim! O app funciona em modo offline para você marcar os itens que comprou no mercado, e envia as atualizações para a nuvem assim que você recuperar a conexão.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-green-100 text-center text-xs text-gray-400">
        <p>© 2026 SuperLista. Todos os direitos reservados.</p>
      </footer>

      {/* Checkout Simulator Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            
            {checkoutStep === 1 ? (
              <div className="p-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                  <h3 className="text-lg font-black text-green-800">Checkout Simulado</h3>
                  <button 
                    onClick={() => setShowCheckoutModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                  >
                    Fechar
                  </button>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-green-950 mb-5 text-sm">
                  <p className="font-bold">🛒 Compra de Licença Anual</p>
                  <p className="text-xs text-green-700 mt-0.5">Acesso ilimitado ao SuperLista por 1 ano.</p>
                  <div className="mt-3 font-bold text-lg text-green-800">R$ 9,90</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Forma de Pagamento Simulada</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700">
                      <option>Pix (Aprovação Instantânea)</option>
                      <option>Cartão de Crédito</option>
                    </select>
                  </div>
                  <div className="pt-2 text-xs text-gray-400 italic">
                    *Esta é uma simulação de vendas. Nenhum valor real será cobrado de você neste teste comercial.
                  </div>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  className="w-full mt-6 py-3 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md"
                >
                  Confirmar Pagamento Simulado
                </button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-black text-green-800 mb-2">Pagamento Aprovado!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Sua licença anual do SuperLista foi ativada com sucesso. Agora vamos criar sua conta para sincronizar seus dados.
                </p>
                <button
                  onClick={handleFinishCheckout}
                  className="w-full py-3 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md"
                >
                  Criar Minha Conta / Fazer Login
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;
