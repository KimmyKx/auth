const socket = io()

socket.on('newgroup', info => {

  // Success
   document.querySelector('.newGroup').style.display = 'none'
   const el = document.createElement('div')
   el.classList.add('contactBar')
   el.innerHTML = `
      <input type="hidden" value="${info.id}">
      <div class="card-contact">
          <a style="text-decoration: none; color: #000;">
              <img src="${info.picture == '' ? '/images/profil-1.jpg' : info.picture}" alt="backgrond" class="profil-contact-chat">
              <p>${info.name}</p>
              <p>Halo Semuanya, Nama Saya Wahyudi Umar</p>
          </a>
      </div>
   `
   document.querySelector('.body-contact').appendChild(el)
})

socket.on('message', message => {
  const el = document.createElement('div')
  if(message.author.id == userid){
    el.innerHTML = `
    <li><div class="me">
        <p class="chat-me">${message.content}</p>
        <p class="date-chat">${message._unreal}</p>
    </div></li>`
  } else {
    el.innerHTML = `
    <li><div class="you">
        <p>${message.author.name}<p>
        <p class="chat-you">${message.content}</p>
        <p class="date-chat">${message._unreal}</p>
    </div></li>`
  }
  document.querySelector('.chattingan ul').appendChild(el)
})

// Show group
document.getElementById('grouping').addEventListener('click', e => {
  document.querySelector('.newGroup').style.display = 'flex'
})

// Close group
document.getElementById('cancel').addEventListener('click', e => {
  document.querySelector('.newGroup').style.display = 'none'
})

// Create group
document.getElementById('newGroup').addEventListener('click', e => {
  const gbName = document.getElementById('groupName').value
  if(!gbName) return
  socket.emit('newgroup', gbName)
})

let groupid = ""
document.querySelector('.body-contact').addEventListener('click', e => {
  if(e.target.parentElement.parentElement.parentElement.className == 'contactBar'){
    const id = e.target.parentElement.parentElement.parentElement.querySelector('input').value
    document.querySelector('.tampilan-welcome').innerHTML = '<h2>Loading..<h2>'
    posted(id)
  }
})


// Kirim id chat ke node
function posted(id){
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/dashboard")
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {

      document.querySelector('.tampilan-welcome').style.display = 'none'
      const chattingan = document.querySelector('.chattingan ul')
      chattingan.innerHTML = ''
      const chatContainer = document.querySelector('.container-chat')
      chatContainer.style.display = 'block'

      const group = JSON.parse(xhr.responseText)
      const _prof = document.querySelector('.profil-chat')
      _prof.querySelector('img').src = group.picture == '' ? '/images/profil-1.jpg' : group.picture
      _prof.querySelector('span').innerText = group.name
      groupid = group.id
      

      addNewText(group.messages)
    };
    xhr.send(JSON.stringify({ id: id }));
  
}

const send = document.getElementById('send').onclick = () => {
    const text = document.getElementById('message')
    const message = {
      content: text.value,
      reciever: groupid,
      author: {
        name: _username,
        email: _email,
        id: userid,
        picture: _picture
      }
    }
    socket.emit('message', message)
    text.value = ''
}

function addNewText(message){
    message.forEach(message => {
      const el = document.createElement('div')
      if(message.author.id == userid){

        el.innerHTML = `
        <li><div class="me">
            <p class="chat-me">${message.content}</p>
            <p class="date-chat">${message.createdAt}</p>
        </div></li>`

      } else {
        
        el.innerHTML = `
        <li><div class="you">

            <p >${message.author.name}<p>
            <p class="chat-you">${message.content}</p>
            <p class="date-chat">${message.createdAt}</p>
            
        </div></li>`

      }
      document.querySelector('.chattingan ul').appendChild(el)
    })
}