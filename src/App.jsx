import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';

import { auth, db } from './firebase';
import LandingPage from './LandingPage';
import AuthView from './AuthView';

const CATEGORIES = [
  { id: 'hortifruti', label: 'Hortifruti', emoji: '🥬', bg: 'bg-green-100 text-green-800' },
  { id: 'carnes', label: 'Carnes', emoji: '🥩', bg: 'bg-red-100 text-red-800' },
  { id: 'laticinios', label: 'Laticínios', emoji: '🥛', bg: 'bg-blue-100 text-blue-800' },
  { id: 'padaria', label: 'Padaria', emoji: '🥖', bg: 'bg-yellow-100 text-yellow-800' },
  { id: 'limpeza', label: 'Limpeza', emoji: '🧴', bg: 'bg-teal-100 text-teal-800' },
  { id: 'enlatados', label: 'Enlatados', emoji: '🥫', bg: 'bg-orange-100 text-orange-800' },
  { id: 'bebidas', label: 'Bebidas', emoji: '🧃', bg: 'bg-purple-100 text-purple-800' },
  { id: 'outros', label: 'Outros', emoji: '📦', bg: 'bg-gray-100 text-gray-800' },
];

const SUGGESTIONS_DB = [
  { name: 'arroz', category: 'outros' }, { name: 'feijão', category: 'outros' },
  { name: 'macarrão', category: 'outros' }, { name: 'azeite', category: 'outros' },
  { name: 'sal', category: 'outros' }, { name: 'açúcar', category: 'outros' },
  { name: 'farinha de trigo', category: 'outros' }, { name: 'café', category: 'outros' },
  { name: 'leite', category: 'laticinios' }, { name: 'manteiga', category: 'laticinios' },
  { name: 'queijo', category: 'laticinios' }, { name: 'iogurte', category: 'laticinios' },
  { name: 'ovos', category: 'laticinios' }, { name: 'frango', category: 'carnes' },
  { name: 'carne moída', category: 'carnes' }, { name: 'linguiça', category: 'carnes' },
  { name: 'presunto', category: 'carnes' }, { name: 'pão de forma', category: 'padaria' },
  { name: 'biscoito', category: 'padaria' }, { name: 'maizena', category: 'outros' },
  { name: 'vinagre', category: 'outros' }, { name: 'molho de tomate', category: 'enlatados' },
  { name: 'caldo de galinha', category: 'outros' }, { name: 'atum enlatado', category: 'enlatados' },
  { name: 'sardinha', category: 'enlatados' }, { name: 'milho verde', category: 'enlatados' },
  { name: 'ervilha', category: 'enlatados' }, { name: 'óleo de soja', category: 'outros' },
  { name: 'shampoo', category: 'limpeza' }, { name: 'condicionador', category: 'limpeza' },
  { name: 'sabonete', category: 'limpeza' }, { name: 'detergente', category: 'limpeza' },
  { name: 'sabão em pó', category: 'limpeza' }, { name: 'amaciante', category: 'limpeza' },
  { name: 'papel higiênico', category: 'limpeza' }, { name: 'esponja', category: 'limpeza' },
  { name: 'água sanitária', category: 'limpeza' }, { name: 'desinfetante', category: 'limpeza' },
  { name: 'tomate', category: 'hortifruti' }, { name: 'alface', category: 'hortifruti' },
  { name: 'cebola', category: 'hortifruti' }, { name: 'alho', category: 'hortifruti' },
  { name: 'batata', category: 'hortifruti' }, { name: 'cenoura', category: 'hortifruti' },
  { name: 'limão', category: 'hortifruti' }, { name: 'laranja', category: 'hortifruti' },
  { name: 'banana', category: 'hortifruti' }, { name: 'maçã', category: 'hortifruti' },
  { name: 'uva', category: 'hortifruti' }, { name: 'mamão', category: 'hortifruti' },
  { name: 'abacate', category: 'hortifruti' }, { name: 'pepino', category: 'hortifruti' },
  { name: 'pimentão', category: 'hortifruti' }, { name: 'brócolis', category: 'hortifruti' },
  { name: 'espinafre', category: 'hortifruti' }, { name: 'macarrão parafuso', category: 'outros' },
  { name: 'refrigerante', category: 'bebidas' }, { name: 'suco', category: 'bebidas' },
  { name: 'água mineral', category: 'bebidas' }, { name: 'cerveja', category: 'bebidas' },
  { name: 'vinho', category: 'bebidas' }, { name: 'energético', category: 'bebidas' },
  { name: 'leite condensado', category: 'laticinios' }, { name: 'creme de leite', category: 'laticinios' },
  { name: 'achocolatado', category: 'outros' }, { name: 'granola', category: 'outros' },
  { name: 'aveia', category: 'outros' }, { name: 'mel', category: 'outros' },
  { name: 'geleia', category: 'outros' }, { name: 'margarina', category: 'laticinios' },
  { name: 'requeijão', category: 'laticinios' }, { name: 'cream cheese', category: 'laticinios' },
  { name: 'presunto fatiado', category: 'carnes' }, { name: 'peito de peru', category: 'carnes' },
  { name: 'mussarela', category: 'laticinios' }, { name: 'parmesão', category: 'laticinios' }
];

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'app'
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  
  const [inputValue, setInputValue] = useState('');
  const [categoryValue, setCategoryValue] = useState('outros');
  const [quantityValue, setQuantityValue] = useState(1);
  const [priceValue, setPriceValue] = useState('');
  const [noteValue, setNoteValue] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'bought'
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const inputRef = useRef(null);

  // 1. Escutar estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setView('app');
      } else {
        setUser(null);
        setView('landing');
        setItems([]);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // 2. Sincronizar listas em tempo real do Firestore
  useEffect(() => {
    if (!user) return;

    const itemsRef = collection(db, "users", user.uid, "items");
    const q = query(itemsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreItems = [];
      snapshot.forEach((doc) => {
        firestoreItems.push({ id: doc.id, ...doc.data() });
      });
      setItems(firestoreItems);
    }, (err) => {
      console.error("Erro na escuta do Firestore:", err);
    });

    return unsubscribe;
  }, [user]);

  // 3. Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sucesso no Login / Cadastro
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setView('app');
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  // Funções CRUD do app
  const addItem = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    
    let parsedPrice = null;
    if (priceValue.trim()) {
      const p = parseFloat(priceValue.replace(',', '.'));
      if (!isNaN(p)) {
        parsedPrice = p;
      }
    }
    
    const itemId = crypto.randomUUID();
    const newItem = {
      text: inputValue.trim(),
      category: categoryValue,
      quantity: Math.max(1, parseInt(quantityValue) || 1),
      price: parsedPrice,
      note: noteValue.trim(),
      bought: false,
      createdAt: Date.now()
    };
    
    try {
      await setDoc(doc(db, "users", user.uid, "items", itemId), newItem);
    } catch (err) {
      console.error("Erro ao adicionar item no Firestore:", err);
    }
    
    setInputValue('');
    setQuantityValue(1);
    setPriceValue('');
    setNoteValue('');
    setShowSuggestions(false);
    setActiveTab('pending');
  };

  const selectSuggestion = (sug) => {
    setInputValue(sug.name);
    setCategoryValue(sug.category);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const toggleItem = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "items", id), {
        bought: !item.bought
      });
    } catch (err) {
      console.error("Erro ao atualizar item no Firestore:", err);
    }
  };

  const deleteItem = async (e, id) => {
    e.stopPropagation();
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "items", id));
    } catch (err) {
      console.error("Erro ao deletar item no Firestore:", err);
    }
  };

  const updateQuantity = async (e, id, delta) => {
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, (item.quantity || 1) + delta);

    try {
      await updateDoc(doc(db, "users", user.uid, "items", id), {
        quantity: newQty
      });
    } catch (err) {
      console.error("Erro ao atualizar quantidade no Firestore:", err);
    }
  };

  const clearBoughtItems = async () => {
    if (window.confirm(`Remover ${boughtItems.length} itens comprados?`)) {
      try {
        const batch = writeBatch(db);
        boughtItems.forEach((i) => {
          batch.delete(doc(db, "users", user.uid, "items", i.id));
        });
        await batch.commit();
      } catch (err) {
        console.error("Erro ao deletar itens comprados:", err);
      }
    }
  };

  const clearAllItems = async () => {
    if (window.confirm("Atenção! Deseja remover todos os itens da lista completamente?")) {
      try {
        const batch = writeBatch(db);
        items.forEach((i) => {
          batch.delete(doc(db, "users", user.uid, "items", i.id));
        });
        await batch.commit();
      } catch (err) {
        console.error("Erro ao limpar lista:", err);
      }
    }
  };

  // Processamento de dados
  const pendingItems = items.filter(item => !item.bought);
  const boughtItems = items.filter(item => item.bought);

  const groupedPendingItems = CATEGORIES.map(cat => ({
    ...cat,
    items: pendingItems.filter(item => (item.category || 'outros') === cat.id)
  })).filter(cat => cat.items.length > 0);

  const getCategoryDetails = (catId) => {
    return CATEGORIES.find(c => c.id === (catId || 'outros')) || CATEGORIES.find(c => c.id === 'outros');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const estimatedCost = pendingItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const alreadySpent = boughtItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const totalItemsCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const filteredSuggestions = inputValue.trim() === '' 
    ? [] 
    : SUGGESTIONS_DB.filter(s => 
        s.name.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 6);

  // 4. Renderizações com base na tela
  if (authLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-800 font-bold mt-4">Carregando SuperLista...</span>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage setView={setView} />;
  }

  if (view === 'login') {
    return <AuthView setView={setView} onLoginSuccess={handleLoginSuccess} />;
  }

  // Visual da Lista de Compras Principal
  return (
    <div className={`min-h-screen ${isShoppingMode ? 'bg-green-100' : 'bg-green-50'} py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500`}>
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
        
        {/* Header do Usuário Logado */}
        <div className="bg-green-50/50 px-6 py-3 border-b border-green-100 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-green-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="truncate max-w-[150px]">{user?.email}</span>
  
          </div>
          <button 
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 font-bold transition-colors"
          >
            Sair da Conta
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-green-800 tracking-tight">
              Lista de Compras
            </h1>
            <button
              onClick={() => setIsShoppingMode(!isShoppingMode)}
              className={`p-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                isShoppingMode 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              title={isShoppingMode ? 'Sair do Modo Compra' : 'Iniciar Modo Compra'}
            >
              {isShoppingMode ? (
                <>
                  <span>Sair</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </>
              ) : (
                <>
                  <span>Ir às Compras</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </>
              )}
            </button>
          </div>

          {/* Card de Resumo (sempre visível) */}
          <div className={`${isShoppingMode ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-green-500 to-green-600'} rounded-xl p-4 mb-6 shadow-md text-white transition-colors duration-500`}>
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-green-400/50">
              <div className="flex flex-col">
                <span className="text-green-100 text-xs font-medium uppercase tracking-wider mb-1">Itens</span>
                <span className="text-xl font-bold">{totalItemsCount}</span>
              </div>
              <div className="flex flex-col pl-4">
                <span className="text-green-100 text-xs font-medium uppercase tracking-wider mb-1">A Gastar</span>
                <span className="text-xl font-bold leading-tight">{formatCurrency(estimatedCost)}</span>
              </div>
              <div className="flex flex-col pl-4">
                <span className="text-green-100 text-xs font-medium uppercase tracking-wider mb-1">Já Gasto</span>
                <span className="text-xl font-bold leading-tight">{formatCurrency(alreadySpent)}</span>
              </div>
            </div>
          </div>

          {/* Formulário (Oculto no Modo Compra) */}
          {!isShoppingMode && (
            <form onSubmit={addItem} className="mb-8 flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-fade-in">
              <div className="relative" ref={inputRef}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="O que você precisa comprar?"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm text-gray-700"
                />
                
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {filteredSuggestions.map((sug) => {
                      const cat = getCategoryDetails(sug.category);
                      const isAlreadyInList = items.some(i => i.text.toLowerCase() === sug.name.toLowerCase());
                      return (
                        <li
                          key={sug.name}
                          onClick={() => selectSuggestion(sug)}
                          className="px-4 py-2 hover:bg-green-50 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-800 capitalize">{sug.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${cat.bg}`}>
                              {cat.emoji}
                            </span>
                          </div>
                          {isAlreadyInList && (
                            <span className="text-green-500 font-bold text-sm" title="Já está na lista">✓</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              
              {/* Nota Rápida */}
              <input
                type="text"
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Nota opcional (ex: sem lactose, marca X...)"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm text-sm text-gray-600"
              />

              <div className="flex gap-2">
                <div className="flex flex-col flex-1">
                  <select
                    value={categoryValue}
                    onChange={(e) => setCategoryValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 shadow-sm text-sm"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col w-20">
                  <input
                    type="number"
                    min="1"
                    value={quantityValue}
                    onChange={(e) => setQuantityValue(e.target.value)}
                    placeholder="Qtd"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 shadow-sm text-sm"
                  />
                </div>
                <div className="flex flex-col w-28">
                  <input
                    type="text"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 shadow-sm text-sm"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-2.5 mt-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Adicionar Item
              </button>
            </form>
          )}

          {/* Abas */}
          <div className="flex mb-6 bg-gray-50 rounded-xl p-1 shadow-inner border border-gray-100">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              A Comprar
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'pending' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {pendingItems.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('bought')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'bought'
                  ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Já Comprados
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'bought' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {boughtItems.length}
              </span>
            </button>
          </div>

          <div className="min-h-[250px] mb-8">
            {/* Conteúdo: A Comprar */}
            {activeTab === 'pending' && (
              <section className="animate-fade-in">
                {pendingItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Tudo comprado! 🎉</p>
                    <p className="text-gray-400 text-sm mt-1">Sua lista está vazia</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedPendingItems.map(group => (
                      <div key={group.id} className="space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${group.bg}`}>
                            {group.emoji} {group.label}
                          </span>
                          <div className="h-px bg-gray-100 flex-1"></div>
                        </div>
                        <ul className="space-y-2">
                          {group.items.map(item => {
                            const qty = item.quantity || 1;
                            const hasPrice = item.price != null && item.price > 0;
                            return (
                              <li 
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={`group flex flex-col p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:border-green-300 hover:shadow-md cursor-pointer transition-all duration-300 animate-fade-in ${
                                  isShoppingMode ? 'shadow-sm active:scale-[0.98]' : ''
                                }`}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                                    <div className="w-5 h-5 mt-0.5 rounded border-2 border-green-400 flex items-center justify-center group-hover:bg-green-50 transition-colors shrink-0"></div>
                                    <div className="flex flex-col truncate">
                                      <span className="text-gray-700 font-bold text-base truncate capitalize">{item.text}</span>
                                      {item.note && (
                                        <span className="text-sm italic text-gray-500 mb-0.5 truncate">{item.note}</span>
                                      )}
                                      <span className="text-xs text-gray-500 mt-0.5 font-medium">
                                        Qtd: {qty}
                                        {hasPrice && ` — ${formatCurrency(item.price)} un. ${qty > 1 ? `(Total: ${formatCurrency(item.price * qty)})` : ''}`}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {!isShoppingMode && (
                                    <div className="flex items-center gap-2 shrink-0">
                                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200" onClick={e => e.stopPropagation()}>
                                        <button 
                                          type="button"
                                          onClick={(e) => updateQuantity(e, item.id, -1)}
                                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-l-lg transition-colors"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                          </svg>
                                        </button>
                                        <span className="w-6 text-center text-sm font-medium text-gray-700">{qty}</span>
                                        <button 
                                          type="button"
                                          onClick={(e) => updateQuantity(e, item.id, 1)}
                                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-r-lg transition-colors"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                          </svg>
                                        </button>
                                      </div>

                                      <button
                                        onClick={(e) => deleteItem(e, item.id)}
                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors focus:outline-none"
                                        title="Remover item"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Conteúdo: Já Comprados */}
            {activeTab === 'bought' && (
              <section className="animate-fade-in flex flex-col">
                {boughtItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-400 font-medium">Nenhum item comprado ainda.</p>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-2 mb-4">
                      {boughtItems.map(item => {
                        const cat = getCategoryDetails(item.category);
                        const qty = item.quantity || 1;
                        const hasPrice = item.price != null && item.price > 0;
                        return (
                          <li 
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`group flex flex-col p-3 sm:p-4 bg-gray-50 border border-transparent rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-300 animate-fade-in ${
                              isShoppingMode ? 'active:scale-[0.98]' : ''
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-start gap-3 opacity-60 overflow-hidden flex-1">
                                <div className="w-5 h-5 mt-0.5 rounded bg-green-500 border-2 border-green-500 flex items-center justify-center transition-colors shrink-0">
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </div>
                                <div className="flex flex-col truncate">
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="text-gray-500 line-through font-bold text-base truncate capitalize">{item.text}</span>
                                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded-full w-max ${cat.bg}`}>
                                      {cat.emoji}
                                    </span>
                                  </div>
                                  {item.note && (
                                    <span className="text-sm italic text-gray-400 line-through mb-0.5 truncate">{item.note}</span>
                                  )}
                                  <span className="text-xs text-gray-500 mt-0.5 font-medium">
                                    Qtd: {qty} {hasPrice && `— ${formatCurrency(item.price * qty)}`}
                                  </span>
                                </div>
                              </div>
                              
                              {!isShoppingMode && (
                                <button
                                  onClick={(e) => deleteItem(e, item.id)}
                                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors focus:outline-none shrink-0"
                                  title="Remover item"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    
                    {!isShoppingMode && (
                      <button 
                        onClick={clearBoughtItems}
                        className="mt-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm self-center transition-colors shadow-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Limpar Comprados
                      </button>
                    )}
                  </>
                )}
              </section>
            )}
          </div>

          {/* Rodapé / Limpar Tudo (Oculto no Modo Compra) */}
          {!isShoppingMode && items.length > 0 && (
            <div className="pt-6 border-t border-gray-100 flex justify-center">
              <button 
                onClick={clearAllItems}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Zerar Lista Completa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
