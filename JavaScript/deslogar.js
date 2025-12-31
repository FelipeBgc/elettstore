let userLogado = JSON.parse(localStorage.getItem('userLogado'))

let logado = document.querySelector('#logado')

logado.innerHTML = (userLogado.nome)


if(localStorage.getItem('token') == null ){
    alert('Você precisa estar logado(a) para acessar essa página')
    window.location.href = 'login.html'   
}


function sair(){
    localStorage.removeItem('userLogado')
    
    window.location.href = 'login.html'   
}