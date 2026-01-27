async function carregarLimpeza() {
  try {
    const response = await fetch('products.json');
    const produtos = await response.json();

    const limpeza = produtos.filter(produto => {
      const categoria = (produto.categoria || '').toLowerCase();
      const nome = (produto.name || '').toLowerCase();
      return categoria === 'limpeza' || nome.includes('limpeza');
    });

    const lista = limpeza.length > 0 ? limpeza : produtos;

    const container = document.getElementById('limpeza-list');
    if (!container) return;

    container.innerHTML = lista.map(produto => `
      <div class="limpeza-card">
        <img src="${produto.image}" alt="${produto.name}" class="limpeza-img">
        <div class="limpeza-title">${produto.name}</div>
        <div class="limpeza-price">R$ ${Number(produto.price).toFixed(2).replace('.', ',')}</div>
        <a class="limpeza-link" href="produto.html?id=${produto.id}">Ver produto</a>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar limpeza:', error);
  }
}

document.addEventListener('DOMContentLoaded', carregarLimpeza);
