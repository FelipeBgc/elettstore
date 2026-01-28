// Sistema robusto de armazenamento com suporte completo para Safari

class StorageManager {
  constructor() {
    this.storageAvailable = this.testStorageAvailable();
    this.fallbackStorage = {}; // Fallback em memória
  }

  // Testar se localStorage está disponível e funcional
  testStorageAvailable() {
    try {
      const test = '__storage_test__';
      const testValue = 'test_value_' + Date.now();
      
      // Tenta escrever
      localStorage.setItem(test, testValue);
      
      // Tenta ler
      const retrieved = localStorage.getItem(test);
      
      // Tenta remover
      localStorage.removeItem(test);
      
      // Se chegou aqui, localStorage funciona
      return retrieved === testValue;
    } catch (e) {
      // localStorage indisponível (modo incógnito do Safari, etc)
      console.warn('localStorage indisponível:', e.message);
      return false;
    }
  }

  // Armazenar dados (com fallback)
  setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (this.storageAvailable) {
        localStorage.setItem(key, stringValue);
      } else {
        this.fallbackStorage[key] = stringValue;
      }
      
      return true;
    } catch (e) {
      console.error('Erro ao armazenar:', key, e.message);
      this.fallbackStorage[key] = typeof value === 'string' ? value : JSON.stringify(value);
      return false;
    }
  }

  // Recuperar dados (com fallback)
  getItem(key) {
    try {
      if (this.storageAvailable) {
        return localStorage.getItem(key);
      } else {
        return this.fallbackStorage[key] || null;
      }
    } catch (e) {
      console.error('Erro ao recuperar:', key, e.message);
      return this.fallbackStorage[key] || null;
    }
  }

  // Remover dados (com fallback)
  removeItem(key) {
    try {
      if (this.storageAvailable) {
        localStorage.removeItem(key);
      }
      delete this.fallbackStorage[key];
      return true;
    } catch (e) {
      console.error('Erro ao remover:', key, e.message);
      delete this.fallbackStorage[key];
      return false;
    }
  }

  // Limpar tudo
  clear() {
    try {
      if (this.storageAvailable) {
        localStorage.clear();
      }
      this.fallbackStorage = {};
      return true;
    } catch (e) {
      console.error('Erro ao limpar storage:', e.message);
      this.fallbackStorage = {};
      return false;
    }
  }

  // Verificar se localStorage está disponível
  isAvailable() {
    return this.storageAvailable;
  }

  // Obter informações de diagnóstico
  getDiagnostics() {
    return {
      localStorageAvailable: this.storageAvailable,
      fallbackStorageSize: Object.keys(this.fallbackStorage).length,
      browserType: this.detectBrowser()
    };
  }

  // Detectar tipo de navegador
  detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      return 'Safari';
    } else if (ua.indexOf('Chrome') > -1) {
      return 'Chrome';
    } else if (ua.indexOf('Firefox') > -1) {
      return 'Firefox';
    } else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) {
      return 'Edge';
    }
    return 'Desconhecido';
  }
}

// Criar instância global
const storage = new StorageManager();

// Função auxiliar para sincronizar dados entre abas (se disponível)
function enableStorageSync() {
  if (storage.isAvailable()) {
    window.addEventListener('storage', function(e) {
      // Este evento dispara quando outro script em outra aba modifica localStorage
      console.log('Storage sincronizado de outra aba:', e.key);
      // Recarregar UI se necessário
      if (e.key === 'userLogado' || e.key === 'token') {
        if (typeof updateAuthUI === 'function') {
          updateAuthUI();
        }
      }
    });
  }
}

// Inicializar sincronização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', enableStorageSync);
