let btn = document.querySelector('#verSenha')
let btnConfirm = document.querySelector('#verConfirmSenha')


let nome = document.querySelector('#nome')
let labelNome = document.querySelector('#labelNome')
let validNome = false

let sbnome = document.querySelector('#sbnome')
let labelSbNome = document.querySelector('#labelSbNome')
let validSbNome = false

let email = document.querySelector('#email')
let labelEmail = document.querySelector('#labelEmail')
let validEmail = false

let telefone = document.querySelector('#telefone')
let labelTelefone = document.querySelector('#labelTelefone')
let validTelefone = false

let senha = document.querySelector('#senha')
let labelSenha = document.querySelector('#labelSenha')
let validSenha = false

let confirmSenha = document.querySelector('#confirmSenha')
let labelConfirmSenha = document.querySelector('#labelConfirmSenha')
let validConfirmSenha = false

let msgError = document.querySelector('#msgError')
let msgSuccess = document.querySelector('#msgSuccess')



nome.addEventListener('keyup', () => {
  if(nome.value.length <= 0){
    labelNome.setAttribute('style', 'color: red')
    labelNome.innerHTML = 'Nome *Insira seu nome'
    nome.setAttribute('style', 'border-color: red')
    validNome = false
  } else {
    labelNome.setAttribute('style', 'color: green')
    labelNome.innerHTML = 'Primeiro nome'
    nome.setAttribute('style', 'border-color: green')
    validNome = true
  }
})

sbnome.addEventListener('keyup', () => {
  if(sbnome.value.length <= 0){
    labelSbNome.setAttribute('style', 'color: red')
    labelSbNome.innerHTML = 'Sobrenome *Insira seu sobrenome'
    sbnome.setAttribute('style', 'border-color: red')
    validSbNome = false
  } else {
    labelSbNome.setAttribute('style', 'color: green')
    labelSbNome.innerHTML = 'Sobrenome'
    sbnome.setAttribute('style', 'border-color: green')
    validSbNome = true
  }
})

email.addEventListener('keyup', () => {
  if(email.value.length <= 0){
    labelEmail.setAttribute('style', 'color: red')
    labelEmail.innerHTML = 'Email *Insira seu email'
    usuario.setAttribute('style', 'border-color: red')
    validEmail = false
  } else {
    labelEmail.setAttribute('style', 'color: green')
    labelEmail.innerHTML = 'Email'
    usuario.setAttribute('style', 'border-color: green')
    validEmail = true
  }
})

telefone.addEventListener('keyup', () => {
  if(telefone.value.length < 11){
    labelTelefone.setAttribute('style', 'color: red')
    labelTelefone.innerHTML = 'Telefone *Insira um telefone válido (mínimo 11 dígitos)'
    telefone.setAttribute('style', 'border-color: red')
    validTelefone = false
  } else {
    labelTelefone.setAttribute('style', 'color: green')
    labelTelefone.innerHTML = 'Telefone'
    telefone.setAttribute('style', 'border-color: green')
    validTelefone = true
  }
})

senha.addEventListener('keyup', () => {
  if(senha.value.length <= 7){
    labelSenha.setAttribute('style', 'color: red')
    labelSenha.innerHTML = 'Senha *Insira no minimo 8 caracteres'
    senha.setAttribute('style', 'border-color: red')
    validSenha = false
  } else {
    labelSenha.setAttribute('style', 'color: green')
    labelSenha.innerHTML = 'Senha'
    senha.setAttribute('style', 'border-color: green')
    validSenha = true
  }
})

confirmSenha.addEventListener('keyup', () => {
  if(senha.value != confirmSenha.value){
    labelConfirmSenha.setAttribute('style', 'color: red')
    labelConfirmSenha.innerHTML = '*As senhas não conferem'
    confirmSenha.setAttribute('style', 'border-color: red')
    validConfirmSenha = false
  } else {
    labelConfirmSenha.setAttribute('style', 'color: green')
    labelConfirmSenha.innerHTML = 'Confirmar Senha'
    confirmSenha.setAttribute('style', 'border-color: green')
    validConfirmSenha = true
  }
})



function cadastrar(){
    if(validNome & validEmail & validTelefone & validSenha || validConfirmSenha ){ 
        let listaUser = JSON.parse(localStorage.getItem('listaUser') || '[]')

        listaUser.push(
        {
            nomeCad: nome.value,
            emailCad: email.value,
            telefoneCad: telefone.value,
            senhaCad: senha.value,
            telefone: telefone.value,
            endereco: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
        }
        )
        
        localStorage.setItem('listaUser', JSON.stringify(listaUser))
        

        msgSuccess.setAttribute('style', 'display: block')
        msgSuccess.innerHTML = '<strong>Cadastrando usuário...</strong>'
        msgError.innerHTML = ''
        msgError.setAttribute('style', 'display: none')

        setTimeout (() => {
        
            window.location.href = 'login.html'
        }, 1000)


    } else {
        msgError.setAttribute('style', 'display: block')
        msgError.innerHTML = '<strong>Preencha todos os campos corretamente</strong>'
        msgSuccess.innerHTML = ''
        msgSuccess.setAttribute('style', 'display: none')
    }
}



btn.addEventListener('click', ()=>{
    let inputSenha = document.querySelector('#senha')   

    if(inputSenha.getAttribute('type') == 'password'){
        inputSenha.setAttribute('type', 'text');
    } else {
        inputSenha.setAttribute('type', 'password');
    }
})

btnConfirm.addEventListener('click', ()=>{
    let inputConfirmSenha = document.querySelector('#confirmSenha')   

    if(inputConfirmSenha.getAttribute('type') == 'password'){
        inputConfirmSenha.setAttribute('type', 'text');
    } else {
        inputConfirmSenha.setAttribute('type', 'password');
    }
})

// Formatar telefone (apenas números)
telefone.addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length <= 11) {
    e.target.value = value;
  } else {
    e.target.value = value.substring(0, 11);
  }
})