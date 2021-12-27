const socket = io()
let _date = []

socket.on('newgroup', info => {

  // Success
  if(info.creator.id == userid){
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
  }
})

socket.on('joingroup', (info, _userid) => {
  if(userid == _userid){
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
  }
})

let groupid = ""
socket.on('message', (message, reciever) => {
  if(reciever != groupid) return
  const el = document.createElement('li')
  let who = ''
  const _dated = message._unreal.split(' at ')
  const dated = _dated[0]
  if(!_date.includes(dated)){
    _date.push(dated)
    const elDate = document.createElement('li')
    elDate.classList.add('chat-date')
    elDate.innerHTML = `
    <div class="chat-first">
        <p id="date">${dated}</p>
    </div>
    `
    document.querySelector('.chattingan ul').appendChild(elDate)
  }
  if(message.author.id == userid){
    who = 'me'
    el.innerHTML = `
    <div class="me">
        <p class="chat-me"></p>
        <p class="date-chat"></p>
    </div>`
    
  } else {
    who = 'you'
    el.innerHTML = `
    <div class="you">
        <p class="someone" style="cursor: pointer;" author="${message.author.id}"></p>
        <p class="chat-you"></p>
        <p class="date-chat"></p>
    </div>`
    el.querySelector('.you p').textContent = `${message.author.name}`
  }
  el.querySelector(`.chat-${who}`).textContent = `${message.content}`
  el.querySelector('.date-chat').textContent = `${message._unreal}`
  document.querySelector('.chattingan ul').appendChild(el)
})

// Show group
document.getElementById('grouping').addEventListener('click', e => {
  document.querySelector('.newGroup').style.display = 'flex'
})


// Show Join
document.getElementById('join').addEventListener('click', e => {
  document.querySelector('.joinGroup').style.display = 'flex'
})

// Close Join
document.getElementById('cancel-j').addEventListener('click', e => {
  document.querySelector('.joinGroup').style.display = 'none'
})

// Close group
document.getElementById('cancel').addEventListener('click', e => {
  document.querySelector('.newGroup').style.display = 'none'
})

// Join group
document.getElementById('joinGroup').addEventListener('click', e => {
  const gbLink = document.getElementById('linkid').value
  document.querySelector('.joinGroup').style.display = 'none'
  socket.emit('joingroup', gbLink, userid)
})

// Create group
document.getElementById('newGroup').addEventListener('click', e => {
  const gbName = document.getElementById('groupName').value
  const obj = {
    gbName: gbName,
    username: _username,
    email: _email,
    picture: _picture,
    userid: userid
  }
  if(!gbName) return
  socket.emit('newgroup', obj)
})

// Edit profile
document.getElementById('profile-btn').addEventListener('click', e => {
  document.querySelector('.tampilan-welcome').style.display = 'none'
  document.querySelector('.container-chat').style.display = 'none'
  document.querySelector('.container-profile').style.display = 'block'
})


document.querySelector('.body-contact').addEventListener('click', e => {
  if(e.target.parentElement.parentElement.parentElement.className == 'contactBar'){
    const id = e.target.parentElement.parentElement.parentElement.querySelector('input').value
    document.querySelector('.preloader').style.display = 'block'
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
      document.querySelector('.container-profile').style.display = 'none'
      const chattingan = document.querySelector('.chattingan ul')
      chattingan.innerHTML = ''
      const chatContainer = document.querySelector('.container-chat')
      chatContainer.style.display = 'block'

      const group = JSON.parse(xhr.responseText)
      const _prof = document.querySelector('.profil-chat')
      _prof.querySelector('img').src = group.picture == '' ? '/images/profil-1.jpg' : group.picture
      _prof.querySelector('span').innerText = group.name
      groupid = group.id

      const gbInfo = document.querySelector('.image-data-user')
      gbInfo.querySelector('h4').innerText = group.name
      gbInfo.querySelector('img').src = group.picture == '' ? '/images/profil-1.jpg' : group.picture
      gbInfo.querySelector('p').innerText = `Group invite key: ${group.id}`
      gbInfo.nextElementSibling.querySelector('p').innerHTML = '<i>No group description</i>'
      document.querySelector('.head h2').innerText = 'Group Info'
      addNewText(group.messages)
      $(".preloader").fadeOut();
    };
    xhr.send(JSON.stringify({ id: id }));
  
}

let partner = ""
// Private msg
document.querySelector('.private').addEventListener('click', e => {
  document.querySelector('.view-profile').style.display = 'none'
  document.querySelector('.view-profile .loaded').style.display = 'none'
  document.querySelector('.view-profile .loading').style.display = 'flex'
  privateMessage(userid, partner)
})

function privateMessage(id, partner){
  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/privatemessage')
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onload = () => {
    groupid = partner
    const response = JSON.parse(xhr.responseText)
    // document.querySelector('.chattingan ul').innerHTML = ''
    if(!response.notInList) {
      const el = document.createElement('div')
      el.classList.add('contactBar')
    }
    console.log(response)
    response.message.forEach(message => {

    })
  }
  xhr.send(JSON.stringify({ id, partner }))
}

document.querySelector('.chattingan ul').addEventListener('click', e => {
  if(e.target.className == 'someone') {
    document.querySelector('.view-profile').style.display = 'flex'
    partner = e.target.getAttribute('author')
    viewProfile(partner)
  }
})

function viewProfile(id){
  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/viewprofile')
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onload = () => {
    const info = JSON.parse(xhr.responseText)
    const profile = document.querySelector('.view-profile')
    profile.querySelector('img').src = info.picture
    profile.querySelector('.info strong').textContent = info.name
    profile.querySelector('.info .viewbio').textContent = info.description
    profile.querySelector('.info .age').textContent = !info.timestamp ? 'Account age: few seconds ago' : `Account age: ${info.timestamp}`
    profile.querySelector('.loading').style.display = 'none'
    profile.querySelector('.loaded').style.display = 'block'
  }
  xhr.send(JSON.stringify({ id }))
}

const send = document.getElementById('send').onclick = () => {
    const text = document.getElementById('message')
    if(!text.value) return
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


/**
 * @param {Array} message
 */
function addNewText(message){
    let who = ''
    _date = []
    message.forEach(message => {
      const el = document.createElement('li')
      const _dated = message.createdAt.split(' at ')
      const dated = _dated[0]
      if(!_date.includes(dated)){
        _date.push(dated)
        const elDate = document.createElement('li')
        elDate.classList.add('chat-date')
        elDate.innerHTML = `
        <div class="chat-first">
            <p id="date">${dated}</p>
        </div>
        `
        document.querySelector('.chattingan ul').appendChild(elDate)
      }
      if(message.author.id == userid){

        who = 'me'
        el.innerHTML = `
        <div class="me">
            <p class="chat-me"></p>
            <p class="date-chat"></p>
        </div>`
      } else {
        
        who = 'you'
        el.innerHTML = `
        <div class="you">

            <p class="someone" style="cursor: pointer" author="${message.author.id}"></p>
            <p class="chat-you"></p>
            <p class="date-chat"></p>
            
        </div>`
        el.querySelector('.you p').textContent = `${message.author.name}`
      }
      el.querySelector('.date-chat').textContent = `${message.createdAt}`
      el.querySelector(`.chat-${who}`).textContent = `${message.content}`
      document.querySelector('.chattingan ul').appendChild(el)
    })
}

document.getElementById('image').onchange = () => {
  document.querySelector('#edit').submit()
}

document.querySelector('#edit').onsubmit = (e) =>{ 
  e.preventDefault()
  const userChange = document.getElementById('username').value
  const bio = document.getElementById('Bio').value
  const obj = {
    userChange,
    bio,
    userid
  }
  socket.emit('userchange', obj)
  window.location.href = ""
}

document.querySelector('i.fas.fa-times').onclick = () => {
  document.querySelector('.view-profile').style.display = 'none'
  document.querySelector('.view-profile .loaded').style.display = 'none'
  document.querySelector('.view-profile .loading').style.display = 'flex'
}