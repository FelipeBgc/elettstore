// Configuração dos Correios
const SENDER_CEP = '37160-000'; // CEP do remetente (37160-000)
const CORREIOS_SERVICES = {
  'pac': '04014', // Correios PAC
  'sedex': '04162' // Correios SEDEX
};

// Recuperar carrinho do localStorage
function loadCartFromStorage() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

// Recuperar produtos do JSON
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    return [];
  }
}

// Calcular peso total do carrinho
function getTotalWeight() {
  const carts = loadCartFromStorage();
  let totalWeight = 0;
  
  // Peso padrão por produto em kg
  const defaultWeight = 0.5;
  
  carts.forEach(item => {
    totalWeight += (item.quantity || 1) * defaultWeight;
  });
  
  // Peso mínimo é 300g para a API dos Correios
  return Math.max(totalWeight * 1000, 300); // retorna em gramas
}

// Calcular frete via Correios
async function calculateShippingCorreios(destCep) {
  try {
    const weight = getTotalWeight();
    const destCepClean = destCep.replace('-', '').replace(/\D/g, '');
    
    if (destCepClean.length < 8) {
      showShippingMessage('CEP inválido', false);
      return null;
    }

    // Usando a API pública dos Correios (sem autenticação)
    const url = `https://viacep.com.br/ws/${destCepClean}/json/`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.erro) {
      showShippingMessage('CEP não encontrado', false);
      return null;
    }

    // Retornar dados do CEP
    return {
      city: data.localidade,
      state: data.uf,
      cep: destCepClean
    };
  } catch (error) {
    console.error('Erro ao consultar frete:', error);
    showShippingMessage('Erro ao calcular frete. Tente novamente.', false);
    return null;
  }
}

// Inicializar checkout
async function initCheckout() {
  const carts = loadCartFromStorage();
  const products = await loadProducts();

  if (carts.length === 0) {
    document.getElementById('checkout-content').style.display = 'none';
    document.getElementById('empty-message').style.display = 'block';
    return;
  }

  let subtotal = 0;
  let orderItemsHTML = '';

  carts.forEach(cartItem => {
    const product = products.find(p => p.id == cartItem.product_id);
    if (product) {
      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItemsHTML += `
        <div class="order-item">
          <div class="item-details">
            <div class="item-name">${product.name}</div>
            <div class="item-qty">Qtd: ${cartItem.quantity}</div>
          </div>
          <div class="item-price">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
        </div>
      `;
    }
  });

  document.getElementById('order-items').innerHTML = orderItemsHTML;
  updateTotals(subtotal);
}

// Atualizar totais
function updateTotals(subtotal, cepShipping = 0) {
  const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
  const deliveryFees = {
    normal: 0.00,
    sedex: 0.00
  };
  
  const totalShipping = cepShipping + (deliveryFees[deliveryType] || 0);
  const total = subtotal + totalShipping;

  document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  document.getElementById('shipping').textContent = `R$ ${totalShipping.toFixed(2).replace('.', ',')}`;
  document.getElementById('total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Calcular frete por CEP (usando Correios)
async function calculateShipping() {
  const cepInput = document.getElementById('checkout-cep');
  let cep = cepInput.value.trim();
  
  if (!cep || cep.length < 8) {
    showShippingMessage('Digite um CEP válido', false);
    return;
  }

  const msgDiv = document.getElementById('shipping-msg');
  msgDiv.textContent = '⏳ Calculando frete...';
  msgDiv.classList.remove('error', 'success');
  msgDiv.style.display = 'block';

  const cepInfo = await calculateShippingCorreios(cep);
  
  if (cepInfo) {
    const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
    
    // Tabela de fretes estimados por região (em reais)
    const freteEstimado = calculateEstimatedShipping(cepInfo.state, deliveryType);
    
    msgDiv.textContent = `✓ ${cepInfo.city} - ${cepInfo.state} | Frete: R$ ${freteEstimado.toFixed(2).replace('.', ',')}`;
    msgDiv.classList.add('success');
    msgDiv.classList.remove('error');
    msgDiv.style.display = 'block';
    
    localStorage.setItem('checkout-shipping-cost', freteEstimado);
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('R$ ', '').replace(',', '.'));
    updateTotals(subtotal, freteEstimado);
  }
}

// Calcular frete estimado por região
function calculateEstimatedShipping(state, deliveryType) {
  // Tabela de fretes regionais baseada nos Correios
  const fretesPorRegiao = {
    'MG': { pac: 21.00, sedex: 65.00 },
    'SP': { pac: 22.00, sedex: 65.00 },
    'RJ': { pac: 21.00, sedex: 65.00 },
    'BA': { pac: 28.00, sedex: 65.00 },
    'PE': { pac: 31.00, sedex: 65.00 },
    'CE': { pac: 32.00, sedex: 65.00 },
    'PA': { pac: 38.00, sedex: 65.00 },
    'AM': { pac: 42.00, sedex: 65.00 },
    'MT': { pac: 29.00, sedex: 65.00 },
    'GO': { pac: 25.00, sedex: 65.00 },
    'DF': { pac: 24.00, sedex: 65.00 },
    'ES': { pac: 20.00, sedex: 65.00 },
    'PR': { pac: 23.00, sedex: 65.00 },
    'SC': { pac: 24.00, sedex: 65.00 },
    'RS': { pac: 25.00, sedex: 65.00 }
  };

  const tipoEntrega = deliveryType === 'normal' ? 'pac' : 'sedex';
  const fretes = fretesPorRegiao[state] || { pac: 35.00, sedex: 65.00 }; // Padrão para outras regiões
  
  return fretes[tipoEntrega] || 35.00;
}

function showShippingMessage(message, isSuccess) {
  const msgDiv = document.getElementById('shipping-msg');
  msgDiv.textContent = `✕ ${message}`;
  msgDiv.classList.add('error');
  msgDiv.classList.remove('success');
  msgDiv.style.display = 'block';
}

// Formatar CEP
document.getElementById('checkout-cep').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length <= 5) {
    e.target.value = value;
  } else {
    e.target.value = value.substring(0, 5) + '-' + value.substring(5, 8);
  }
});

// Botão calcular frete
document.getElementById('calc-shipping-btn').addEventListener('click', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('calc-shipping-btn');
  btn.disabled = true;
  btn.textContent = 'Calculando...';
  await calculateShipping();
  btn.disabled = false;
  btn.textContent = 'Calcular Frete';
  
  // Verificar se foi calculado com sucesso
  const shippingCost = localStorage.getItem('checkout-shipping-cost');
  if (shippingCost) {
    btn.style.background = '#4CAF50';
    btn.style.color = 'white';
    btn.textContent = '✓ Frete Calculado';
  }
});

// Enter para calcular
document.getElementById('checkout-cep').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const btn = document.getElementById('calc-shipping-btn');
    btn.disabled = true;
    btn.textContent = 'Calculando...';
    await calculateShipping();
    btn.disabled = false;
    btn.textContent = 'Calcular Frete';
  }
});

// Evento de entrega
document.querySelectorAll('input[name="delivery"]').forEach(radio => {
  radio.addEventListener('change', () => {
    updateDeliveryToggle(radio.value);
    document.getElementById('checkout-cep').value = '';
    document.getElementById('shipping-msg').style.display = 'none';
    closeDeliveryDropdown();
  });
});

// Controlar dropdown de entrega
const deliveryToggle = document.getElementById('delivery-toggle');
const deliveryOptions = document.getElementById('delivery-options');

deliveryToggle.addEventListener('click', (e) => {
  e.preventDefault();
  if (deliveryOptions.style.display === 'none') {
    deliveryOptions.style.display = 'block';
    deliveryToggle.classList.add('active');
  } else {
    closeDeliveryDropdown();
  }
});

// Fechar dropdown quando clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.delivery-selector')) {
    closeDeliveryDropdown();
  }
});

function closeDeliveryDropdown() {
  deliveryOptions.style.display = 'none';
  deliveryToggle.classList.remove('active');
}

function updateDeliveryToggle(value) {
  const deliveryData = {
    'normal': { icon: '📦', name: 'Normal', time: '7-15 dias' },
    'sedex': { icon: '🚚', name: 'SEDEX', time: '2-5 dias' },
    'motoboy': { icon: '🏍️', name: 'Motoboy', time: 'Mesmo dia' }
  };

  const data = deliveryData[value];
  if (data) {
    document.querySelector('.delivery-icon').textContent = data.icon;
    document.querySelector('.delivery-name').textContent = data.name;
    document.querySelector('.delivery-time').textContent = data.time;
  }
}

// Ocultar campos de cartão se não for crédito/débito
// Mostrar PIX se for PIX
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', function() {
    const cardSection = document.getElementById('card-section');
    const pixSection = document.getElementById('pix-section');
    
    if (this.value === 'credit' || this.value === 'debit') {
      cardSection.style.display = 'block';
      pixSection.style.display = 'none';
    } else if (this.value === 'pix') {
      cardSection.style.display = 'none';
      pixSection.style.display = 'block';
    } else {
      cardSection.style.display = 'none';
      pixSection.style.display = 'none';
    }
  });
});

// Formatar cartão
document.getElementById('card-number').addEventListener('input', function() {
  this.value = this.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
});

document.getElementById('card-expiry').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
});

document.getElementById('card-cvv').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '');
});

// Submeter formulário
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Validação de campos obrigatórios de endereço
  const fullname = document.getElementById('fullname').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const number = document.getElementById('number').value.trim();
  const neighborhood = document.getElementById('neighborhood').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();

  // Validação de CEP de frete calculado
  const checkoutCep = document.getElementById('checkout-cep').value.trim();
  const shippingCost = localStorage.getItem('checkout-shipping-cost');

  // Validação de método de entrega
  const deliverySelected = document.querySelector('input[name="delivery"]:checked');

  // Validação de método de pagamento
  const paymentSelected = document.querySelector('input[name="payment"]:checked');

  // Validação de cartão (se crédito ou débito)
  const cardNumber = document.getElementById('card-number').value.trim();
  const cardHolder = document.getElementById('card-holder').value.trim();
  const cardExpiry = document.getElementById('card-expiry').value.trim();
  const cardCvv = document.getElementById('card-cvv').value.trim();

  // Validações
  if (!fullname) {
    alert('Por favor, preencha o nome completo');
    return;
  }

  if (!email) {
    alert('Por favor, preencha o e-mail');
    return;
  }

  if (!phone) {
    alert('Por favor, preencha o telefone');
    return;
  }

  if (!address) {
    alert('Por favor, preencha a rua/avenida');
    return;
  }

  if (!number) {
    alert('Por favor, preencha o número');
    return;
  }

  if (!neighborhood) {
    alert('Por favor, preencha o bairro');
    return;
  }

  if (!city) {
    alert('Por favor, preencha a cidade');
    return;
  }

  if (!state) {
    alert('Por favor, selecione um estado');
    return;
  }

  if (!checkoutCep) {
    alert('Por favor, preencha o CEP para cálculo de frete');
    return;
  }

  if (!shippingCost) {
    alert('⚠️ FRETE OBRIGATÓRIO!\n\nClique em "Calcular Frete" para continuar com o pedido.');
    return;
  }

  if (!deliverySelected) {
    alert('Por favor, selecione um método de entrega');
    return;
  }

  if (!paymentSelected) {
    alert('Por favor, selecione um método de pagamento');
    return;
  }

  // Validar campos de cartão se for crédito ou débito
  if (paymentSelected.value === 'credit' || paymentSelected.value === 'debit') {
    if (!cardNumber) {
      alert('Por favor, preencha o número do cartão');
      return;
    }

    if (!cardHolder) {
      alert('Por favor, preencha o titular do cartão');
      return;
    }

    if (!cardExpiry) {
      alert('Por favor, preencha o vencimento do cartão');
      return;
    }

    if (!cardCvv) {
      alert('Por favor, preencha o CVV do cartão');
      return;
    }

    // Validar formato do cartão (19 caracteres com espaços)
    if (cardNumber.length < 19) {
      alert('Por favor, preencha o cartão completo');
      return;
    }

    // Validar formato da validade (5 caracteres MM/AA)
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      alert('Por favor, use o formato MM/AA para o vencimento');
      return;
    }

    // Validar CVV (3 ou 4 dígitos)
    if (cardCvv.length < 3) {
      alert('Por favor, preencha o CVV completo');
      return;
    }
  }

  // Gerar número do pedido
  const orderNumber = Math.floor(Math.random() * 1000000);
  
  // Salvar endereço do usuário se estiver logado
  saveCheckoutAddressIfLogged();
  
  // Criar mensagem do WhatsApp com resumo completo
  await sendWhatsAppMessage(orderNumber);
});

// Inicializar
initCheckout();

// Função para enviar mensagem do WhatsApp
async function sendWhatsAppMessage(orderNumber) {
  const carts = loadCartFromStorage();
  const products = await loadProducts();
  
  // Coletar dados do formulário
  const fullname = document.getElementById('fullname').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const number = document.getElementById('number').value.trim();
  const complement = document.getElementById('complement').value.trim();
  const neighborhood = document.getElementById('neighborhood').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const checkoutCep = document.getElementById('checkout-cep').value.trim();
  
  // Método de entrega e pagamento
  const deliverySelected = document.querySelector('input[name="delivery"]:checked');
  const paymentSelected = document.querySelector('input[name="payment"]:checked');
  
  const deliveryNames = {
    'normal': '📦 Normal (7-15 dias)',
    'sedex': '🚚 SEDEX (2-5 dias)'
  };
  
  const paymentNames = {
    'credit': '💳 Crédito',
    'debit': '🏦 Débito',
    'pix': '📱 PIX'
  };
  
  // Valores
  const subtotalText = document.getElementById('subtotal').textContent;
  const shippingText = document.getElementById('shipping').textContent;
  const totalText = document.getElementById('total').textContent;
  
  // Construir lista de produtos
  let productsList = '';
  carts.forEach(cartItem => {
    const product = products.find(p => p.id == cartItem.product_id);
    if (product) {
      const itemTotal = product.price * cartItem.quantity;
      productsList += `\nCód.:${product.id}\n • ${product.name}\n  Qtd: ${cartItem.quantity} x R$ ${product.price.toFixed(2).replace('.', ',')} = R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
    }
  });
  
  // Montar mensagem completa
  let message = `🛍️ *NOVO PEDIDO - Élett Store*\n`;
  message += `━━━━━━━━━━━━━━\n\n`;
  message += `*Pedido:* #${orderNumber}\n\n`;
  
  message += `*👤 DADOS DO CLIENTE*\n`;
  message += `Nome: ${fullname}\n`;
  message += `E-mail: ${email}\n`;
  message += `Telefone: ${phone}\n\n`;
  
  message += `*📦 PRODUTOS*${productsList}\n`;
  
  message += `*💰 VALORES*\n`;
  message += `Subtotal: ${subtotalText}\n`;
  message += `Frete: ${shippingText}\n`;
  message += `*Total: ${totalText}*\n\n`;
  
  message += `*📍 ENDEREÇO DE ENTREGA*\n`;
  message += `${address}, ${number}`;
  if (complement) message += ` - ${complement}`;
  message += `\n${neighborhood}\n`;
  message += `${city} - ${state}\n`;
  message += `CEP: ${checkoutCep}\n\n`;
  
  message += `*🚚 MÉTODO DE ENTREGA*\n`;
  message += `${deliveryNames[deliverySelected.value]}\n\n`;
  
  message += `*💳 FORMA DE PAGAMENTO*\n`;
  message += `${paymentNames[paymentSelected.value]}\n`;
  
  // Se for PIX, adicionar observação
  if (paymentSelected.value === 'pix') {
    message += `\n_Aguardando confirmação do pagamento via PIX_\n`;
    message += `Chave PIX: (35)98839-7718\n`;
  }
  
  message += `\n━━━━━━━━━━━━━━\n`;
  message += `_Pedido enviado via site Élett Store_`;
  
  // Codificar mensagem para URL
  const encodedMessage = encodeURIComponent(message);
  
  // Número do WhatsApp (remover caracteres especiais)
  const whatsappNumber = '5535988397718';
  
  // URL do WhatsApp (usar api.whatsapp.com para melhor compatibilidade mobile)
  const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
  
  // Limpar carrinho antes de redirecionar
  localStorage.removeItem('cart');
  localStorage.removeItem('checkout-shipping-cost');
  
  // Redirecionar para WhatsApp
  window.location.href = whatsappURL;
}
