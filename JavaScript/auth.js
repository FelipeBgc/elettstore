// Sistema de Autenticação Centralizado com Storage Adaptável

// Objeto para armazenar dados em memória como fallback
const memoryStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// Detectar qual storage usar
function getStorage() {
  try {
    // Tentar localStorage
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return localStorage;
  } catch (e) {
    try {
      // Se localStorage falhar, tentar sessionStorage
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return sessionStorage;
    } catch (e) {
      // Se ambos falharem, usar memória
      console.warn('Storage indisponível. Usando armazenamento em memória. Dados serão perdidos ao fechar a aba.');
      return memoryStorage;
    }
  }
}

// Usar o storage detectado
const storage = getStorage();

// Verificar se o usuário está logado
function checkUserLogin() {
  const token = storage.getItem('token');
  const userLogado = storage.getItem('userLogado');
  
  if (token && userLogado) {
    return JSON.parse(userLogado);
  }
  return null;
}

// Atualizar interface baseado no status de login
function updateAuthUI() {
  const user = checkUserLogin();
  const authOptions = document.getElementById('authOptions');
  
  if (!authOptions) return;
  
  if (user) {
    // Usuário logado
    authOptions.innerHTML = `
      <li id="userGreeting" style="font: bold 16px Poppins, sans-serif; padding: 8px 10px; cursor: pointer;" onclick="window.location.href='perfil.html'">
        👤 ${user.nome}
      </li>
      <a href="" onclick="logout(event)">
        <li><ion-icon name="log-out-outline"></ion-icon> Sair</li>
      </a>
    `;
  } else {
    // Usuário não logado
    authOptions.innerHTML = `
      <a href="login.html">
        <li><ion-icon name="log-in-outline"></ion-icon> Entrar</li>
      </a>
      <a href="signup.html">
        <li><ion-icon name="log-in-outline"></ion-icon> Inscrever-se</li>
      </a>
    `;
  }
}

// Fazer logout
function logout(e) {
  e.preventDefault();
  
  if (confirm('Deseja realmente sair?')) {
    storage.removeItem('token');
    storage.removeItem('userLogado');
    updateAuthUI();
    window.location.href = 'index.html';
  }
}

// Preencher dados do checkout automaticamente se usuário está logado
function autofillCheckoutForm() {
  const user = checkUserLogin();
  
  if (!user) return;
  
  // Preencher nome no checkout
  const fullnameInput = document.getElementById('fullname');
  if (fullnameInput) {
    fullnameInput.value = user.nome || '';
  }
  
  // Preencher email no checkout
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.value = user.email || '';
  }
  
  // Se houver telefone salvo no usuário, preencher
  if (user.telefone) {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.value = user.telefone || '';
    }
  }
  
  // Se houver endereço salvo, preencher
  if (user.endereco) {
    const addressInput = document.getElementById('address');
    if (addressInput) {
      addressInput.value = user.endereco || '';
    }
  }
  
  if (user.numero) {
    const numberInput = document.getElementById('number');
    if (numberInput) {
      numberInput.value = user.numero || '';
    }
  }
  
  if (user.bairro) {
    const neighborhoodInput = document.getElementById('neighborhood');
    if (neighborhoodInput) {
      neighborhoodInput.value = user.bairro || '';
    }
  }
  
  if (user.cidade) {
    const cityInput = document.getElementById('city');
    if (cityInput) {
      cityInput.value = user.cidade || '';
    }
  }
  
  if (user.estado) {
    const stateInput = document.getElementById('state');
    if (stateInput) {
      stateInput.value = user.estado || '';
    }
  }
  
  if (user.cep) {
    const cepInput = document.getElementById('checkout-cep');
    if (cepInput) {
      cepInput.value = user.cep || '';
    }
  }
}

// Salvar dados do endereço do usuário no storage
function saveUserAddress(fullname, email, phone, address, number, complement, neighborhood, city, state, cep) {
  let user = checkUserLogin();
  
  if (user) {
    user.nome = fullname || user.nome;
    user.email = email || user.email;
    user.telefone = phone || user.telefone;
    user.endereco = address || user.endereco;
    user.numero = number || user.numero;
    user.complemento = complement || user.complemento;
    user.bairro = neighborhood || user.bairro;
    user.cidade = city || user.cidade;
    user.estado = state || user.estado;
    user.cep = cep || user.cep;
    
    storage.setItem('userLogado', JSON.stringify(user));
  }
}

// Inicializar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
  
  // Se estiver no checkout, preencher automaticamente
  if (document.getElementById('fullname')) {
    autofillCheckoutForm();
  }
});

// Salvar endereço quando submeter checkout (se usuário estiver logado)
function saveCheckoutAddressIfLogged() {
  const user = checkUserLogin();
  
  if (user) {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const number = document.getElementById('number').value;
    const complement = document.getElementById('complement').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const cep = document.getElementById('checkout-cep').value;
    
    saveUserAddress(fullname, email, phone, address, number, complement, neighborhood, city, state, cep);
  }
}
