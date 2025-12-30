let userLogado = JSON.parse(localStorage.getItem('userLogado'))

let logado = document.querySelector('#logado')

logado.innerHTML = (userLogado.nome)


if(localStorage.getItem('token') == null ){
    alert('Você precisa estar logado(a) para acessar essa página')
    window.location.href = 'http://127.0.0.1:5500/login.html'   
}


function sair(){
    localStorage.removeItem('userLogado')
    localStorage.removeItem('token')
    window.location.href = 'http://127.0.0.1:5500/login.html'   
}