let btn = document.querySelector('.fa-eye')

btn.addEventListener('click', ()=>{
    let inputSenha = document.querySelector('#senha');

    if(inputSenha.getAttribute('type') == 'password'){
        inputSenha.setAttribute('type', 'text');
    } else {
        inputSenha.setAttribute('type', 'password');
    }
})


function entrar(){
    let email = document.querySelector('#email')
    let emailLabel = document.querySelector('#emailLabel')

    let senha = document.querySelector('#senha')
    let senhaLabel = document.querySelector('#senhaLabel')

    let msgError = document.querySelector('#msgError')
    let listaUser = []

    let uservalid = {
        nome: '',
        email: '',
        senha:''
    }

    listaUser = JSON.parse(localStorage.getItem('listaUser'))

    listaUser.forEach((item) => {
        if(email.value == item.emailCad && senha.value == item.senhaCad){
            uservalid = {
                nome: item.nomeCad,
                email: item.emailCad,
                senha: item.senhaCad
            }
        }
    })

        if(email.value == uservalid.email && senha.value == uservalid.senha){
    window.location.href = 'https://felipebgc.github.io/elettstore/'
    
    let mathRandom = Math.random().toString(16).substring(2)
    let token = mathRandom + mathRandom
    
    localStorage.setItem('token', token)
    localStorage.setItem('userLogado', JSON.stringify(uservalid))
  } else {
    emailLabel.setAttribute('style', 'color: red')
    email.setAttribute('style', 'border-color: red')
    senhaLabel.setAttribute('style', 'color: red')
    senha.setAttribute('style', 'border-color: red')
    msgError.setAttribute('style', 'display: block')
    msgError.innerHTML = 'Email ou senha incorretos'
    email.focus()
  }
}