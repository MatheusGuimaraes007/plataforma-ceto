<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const codigo = ref('')
const mensagemLocal = ref('')
const router = useRouter()
const route = useRoute()

const { login, carregando, erro } = useAuth()

const mensagemErro = computed(() => mensagemLocal.value || erro.value)

const fazerLogin = async () => {
  mensagemLocal.value = ''

  if (!email.value || !codigo.value) {
    mensagemLocal.value = 'Informe email e código.'
    return
  }

  const resultado = await login(email.value, codigo.value)

  if (resultado.success) {
    const destino = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.replace(destino)
    return
  }

  mensagemLocal.value = resultado.message || 'Não foi possível autenticar.'
}
</script>

<template>
  <div class="login-container">
    <form class="login-card" @submit.prevent="fazerLogin">
      <h1>Entrar na Plataforma</h1>

      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="seu@email.com"
        autocomplete="email"
      />

      <label for="codigo">Código</label>
      <input
        id="codigo"
        v-model="codigo"
        type="text"
        placeholder="Insira o código"
        autocomplete="one-time-code"
      />

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Validando...' : 'Fazer login' }}
      </button>

      <p v-if="mensagemErro" class="erro">{{ mensagemErro }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #d5f2e3, #f5fbff);
}

.login-card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2.5rem;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.login-card h1 {
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  text-align: center;
  color: #102027;
}

label {
  font-size: 0.9rem;
  color: #4b5d68;
}

input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #d9e3ea;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: border 0.2s ease;
}

input:focus {
  border-color: #1d9a6c;
  outline: none;
}

button {
  margin-top: 0.5rem;
  padding: 0.95rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: #1d9a6c;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:disabled {
  background: #9dcfb8;
  cursor: not-allowed;
}

.erro {
  margin: 0;
  color: #d93025;
  font-size: 0.9rem;
  text-align: center;
}
</style>