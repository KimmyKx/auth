const socket = io()

// Taruh chat yang sudah ada
if(msgs){

  msgs.forEach(msg => {
    const li = document.createElement('li')
    li.innerHTML = `<img src=${msg.author.picture} alt="" width="45" /> ` 
    li.innerHTML += `<span class="message"><span>${msg.author.name} - ${msg.createdAt}</span> ${msg.content}</span>`
    if(msg.author.name == username && msg.author.email == email){
      const authors = li.querySelector('.message')
      authors.style.color = 'blueviolet'
    }
    document.querySelector('ul').appendChild(li)
  })

}

document.querySelector('form').onsubmit = (e) => {
  e.preventDefault()
}

// Real-time handling
socket.on('message', (msg) => {
  
    const el = document.createElement('li')
    el.innerHTML = `<img src=${msg.author.picture} alt="" width="45" /> ` 
    el.innerHTML += `<span class="message"><span>${msg.author.name} - ${msg._unreal}</span> ${msg.content}</span>`
    if(msg.author.name == username && msg.author.email == email){
      const authors = el.querySelector('.message')
      authors.style.color = 'blueviolet'
    }
    document.querySelector('ul').appendChild(el)

})

document.querySelector('button#send').onclick = () => {

    const text = document.querySelector('input#text')
    const messageid = generateID(15)
    const message = {
      content: text.value,
      author: {
        name: username,
        email: email,
        id: id,
        picture: picture
      },
      id: messageid,
      timestamp: Date.now()
    }
    socket.emit('message', message)
    text.value = ''
    

}

// FUNCTIONS 

function generateID(length){
  let result = ''
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
  for(let i = 0; i < length; i++){
    result += char.charAt(Math.floor(Math.random() * char.length))
  }
  return result
}