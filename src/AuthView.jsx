import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';
import { auth } from './firebase';

function AuthView({ onLoginSuccess, setView }) {
  // 'login' | 'forgot' | 'resetPassword'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [oobCode, setOobCode] = useState(null);
  const [resetEmail, setResetEmail] = useState('');

  // Verifica se a URL tem parâmetros de reset de senha do Firebase
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const code = urlParams.get('oobCode');

    if (modeParam === 'resetPassword' && code) {
      setOobCode(code);
      setMode('resetPassword');
      // Verifica se o código é válido e obtém o e-mail
      verifyPasswordResetCode(auth, code)
        .then((email) => {
          setResetEmail(email);
        })
        .catch(() => {
          setError('O link de recuperação expirou ou é inválido. Solicite um novo.');
          setOobCode(null);
        });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user);
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('O formato do e-mail é inválido.');
          break;
        case 'auth/user-disabled':
          setError('Este usuário foi desativado.');
          break;
        case 'auth/user-not-found':
          setError('Usuário não encontrado.');
          break;
        case 'auth/wrong-password':
          setError('Senha incorreta. Tente novamente.');
          break;
        case 'auth/invalid-credential':
          setError('Credenciais incorretas ou inválidas.');
          break;
        default:
          setError('Ocorreu um erro. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.');
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('O formato do e-mail é inválido.');
          break;
        case 'auth/user-not-found':
          setError('Não existe conta com este e-mail.');
          break;
        default:
          setError('Erro ao enviar e-mail de recuperação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess('Senha alterada com sucesso! Você já pode fazer login.');
      setOobCode(null);
      // Limpa parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Volta para login após 2 segundos
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 2500);
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/expired-action-code':
          setError('O link de recuperação expirou. Solicite um novo.');
          break;
        case 'auth/invalid-action-code':
          setError('O link de recuperação é inválido. Solicite um novo.');
          break;
        case 'auth/weak-password':
          setError('A senha deve ter pelo menos 6 caracteres.');
          break;
        default:
          setError('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    if (setView) {
      setView('landing');
    } else {
      window.location.href = '/';
    }
  };

  // =====================
  // TELA: REDEFINIR SENHA (via link do e-mail)
  // =====================
  if (mode === 'resetPassword') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-green-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

          <div>
            <button 
              onClick={handleGoHome}
              className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 font-semibold mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Voltar para a Home
            </button>
            
            <h2 className="text-center text-3xl font-extrabold text-green-800">
              Nova Senha
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              {resetEmail ? `Redefinindo senha para ${resetEmail}` : 'Defina sua nova senha abaixo'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                ✅ {success}
              </div>
            )}
            
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 shadow-sm text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 shadow-sm text-sm"
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Redefinir Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =====================
  // TELA: ESQUECEU SUA SENHA
  // =====================
  if (mode === 'forgot') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-green-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

          <div>
            <button 
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 font-semibold mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Voltar para o Login
            </button>
            
            <h2 className="text-center text-3xl font-extrabold text-green-800">
              Recuperar Senha
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              Informe seu e-mail e enviaremos um link para redefinir sua senha
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                ✅ {success}
              </div>
            )}
            
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Endereço de E-mail
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 shadow-sm text-sm"
                  placeholder="seu-email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Solicitar'}
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              Lembrou a senha? Faça Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================
  // TELA: LOGIN
  // =====================
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-green-100 relative overflow-hidden">
        
        {/* Decoração sutil */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

        <div>
          <button 
            onClick={handleGoHome}
            className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 font-semibold mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Voltar para a Home
          </button>
          
          <h2 className="text-center text-3xl font-extrabold text-green-800">
            Entre na sua Conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Acesse suas listas de qualquer dispositivo
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700 mb-1">
                Endereço de E-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 shadow-sm text-sm"
                placeholder="seu-email@exemplo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 shadow-sm text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
          >
            Esqueceu sua senha?
          </button>
        </div>

      </div>
    </div>
  );
}

export default AuthView;
