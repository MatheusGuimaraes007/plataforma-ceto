import { ref, computed } from 'vue';
import { supabase } from './useSupabase';

const STORAGE_KEY = 'pceto:usuario';

const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const persistUser = (user) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

const usuario = ref(getStoredUser());
const carregando = ref(false);
const erro = ref('');

export function useAuth() {
  const login = async (emailEntrada, codigoEntrada) => {
    const email = emailEntrada?.trim();
    const codigo = codigoEntrada?.trim();

    if (!email || !codigo) {
      erro.value = 'Informe email e código.';
      return { success: false, message: erro.value };
    }

    carregando.value = true;
    erro.value = '';

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, ativo')
        .eq('email', email)
        .eq('codigo', codigo)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Email ou código inválidos.');
      }

      if (!data.ativo) {
        throw new Error('Seu acesso ainda não está ativo.');
      }

      usuario.value = {
        id: data.id,
        nome: data.nome,
        email: data.email,
      };
      persistUser(usuario.value);

      return { success: true };
    } catch (authError) {
      erro.value = authError.message || 'Não foi possível autenticar.';
      usuario.value = null;
      persistUser(null);

      return { success: false, message: erro.value };
    } finally {
      carregando.value = false;
    }
  };

  const logout = () => {
    usuario.value = null;
    persistUser(null);
    erro.value = '';
  };

  const isAutenticado = computed(() => Boolean(usuario.value));

  return {
    usuario,
    carregando,
    erro,
    isAutenticado,
    login,
    logout,
  };
}
