const socket = io()
if(!socket) window.location.reload()
// Taruh chat yang sudah ada
if(msgs){

  msgs.message.forEach(msg => {
    const li = document.createElement('li')
    li.innerHTML = `<img src=${msg.author.picture} alt="" width="45" /> ` 
    li.innerHTML += `<span class="message"><span>${msg.author.name} - ${msg.createdAt}</span> ${msg.content}</span>`
    li.classList.add('msg')
    li.setAttribute('msgid', msg.id)
    if(msg.author.name == username && msg.author.email == email){
      const authors = li.querySelector('.message')
      authors.style.color = 'blueviolet'
      li.innerHTML += `<button type="button" class="subtract">Delete</button>`
    }
    document.querySelector('ul').appendChild(li)
  })

}

document.querySelector('form').onsubmit = (e) => {
  e.preventDefault()
}

// Real-time handling

// Send Message
socket.on('message', (msg) => {
  
    const el = document.createElement('li')
    el.innerHTML = `<img src=${msg.author.picture} alt="" width="45" /> ` 
    el.innerHTML += `<span class="message"><span>${msg.author.name} - ${msg._unreal}</span> ${msg.content}</span>`
    el.classList.add('msg')
    el.setAttribute('msgid', msg.id)
    if(msg.author.name == username && msg.author.email == email){
      const authors = el.querySelector('.message')
      authors.style.color = 'blueviolet'
      el.innerHTML += `<button type="button" class="subtract">Delete</button>`
    }
    document.querySelector('ul').appendChild(el)

})

// Message Delete
socket.on('messageDelete', (messageID) => {
  const btn = document.querySelector(`li[msgid=${messageID}]`)
  btn.style.display = 'none'
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

document.body.addEventListener('click', e => {
  if(e.target.className == 'subtract'){
    const messageID = e.target.parentElement.getAttribute('msgid')
    socket.emit('messageDelete', messageID)
    e.target.parentElement.style.display = 'none'
  }
})

// FUNCTIONS 

function generateID(length){
  let result = ''
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
  for(let i = 0; i < length; i++){
    result += char.charAt(Math.floor(Math.random() * char.length))
  }
  return result
}