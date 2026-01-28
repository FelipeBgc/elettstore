// Script da página de perfil

// Usar o storage detectado do auth.js
let storage = typeof getStorage !== 'undefined' ? getStorage() : localStorage;

document.addEventListener('DOMContentLoaded', () => {
  carregarDadosPerfil();
  
  // Botão de logout
  const btnSair = document.querySelector('.btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      storage.removeItem('token');
      storage.removeItem('userLogado');
      window.location.href = 'index.html';
    });
  }
});

function carregarDadosPerfil() {
  const userLogado = JSON.parse(storage.getItem('userLogado'));
  
  if (!userLogado) {
    // Se não há usuário logado, redireciona para login
    window.location.href = 'login.html';
    return;
  }
  
  // Atualiza nome no header
  const nomeHeader = document.querySelector('.perfil-header h2');
  if (nomeHeader) {
    nomeHeader.textContent = userLogado.nome || 'Usuário';
  }
  
  // Dados pessoais
  document.getElementById('perfil-nome').textContent = userLogado.nome || 'Não informado';
  document.getElementById('perfil-email').textContent = userLogado.email || 'Não informado';
  document.getElementById('perfil-telefone').textContent = userLogado.telefone || 'Não informado';

}
