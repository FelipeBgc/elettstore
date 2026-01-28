// Script da página de perfil

document.addEventListener('DOMContentLoaded', () => {
  carregarDadosPerfil();
  
  // Botão de logout
  const btnSair = document.querySelector('.btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userLogado');
      window.location.href = 'index.html';
    });
  }
});

function carregarDadosPerfil() {
  const userLogado = JSON.parse(localStorage.getItem('userLogado'));
  
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
