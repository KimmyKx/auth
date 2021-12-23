const { MongoClient, ObjectId } = require('mongodb')
const mongo = new MongoClient(process.env['mongo'], {
  useNewUrlParser: true,
  useUnifiedTopology: true
})


class Database {

  constructor(){
    this.db = new Promise(this.#connect)
  }
  #connect(resolve){
    mongo.connect((error, client) => {
      if(error) return console.log(error)
      console.log("Connected to Database")
      resolve(client.db().collection("Bootcamp"))
    })  
  }

  async find(key, value){
    const obj = {}
    obj[key] = value
    const db = await this.db
    const result = new Promise((resolve) => {
      db.find(obj).toArray((err, response) => {
        resolve(response)
      })
    })
    const has = new Promise(async (resolve) => {
      const rslt = await result
      if(!rslt[0]) resolve(false)
      else resolve(rslt[0])
    })
    return has
  }

  async insert(obj){
    const db = await this.db
    const result = new Promise((resolve) => {
      db.insertOne(obj, (error, response) => {
        if(error) resolve(false)
        else resolve(true)
      })
    })
    return result
  }

  async update(oldKey, oldValue, newKey, newValue){
    const obj1 = {}
    obj1[oldKey] = oldValue
    const obj2 = {}
    obj2[newKey] = newValue
    const db = await this.db
    const result = new Promise((resolve) => {
      db.updateOne(obj1, { $set: obj2 }).then(response => resolve(response))
    })
    return result
  }

  async insertMore(obj){
    const db = await this.db
    const result = new Promise((resolve) => {
      db.insertMany([obj], (error, response) => {
        resolve(response)
      })
    })
    return result
  }

  async remove(key, value){
    const obj = {}
    obj[key] = value
    const db = await this.db
    const result = new Promise((resolve) => {
      db.deleteOne(obj).then(response => resolve(response)).catch(err => console.log(err))
    })
      return result
  }

  async push(keyID, valueID, newObjValue){
    const obj1 = {}
    obj1[keyID] = valueID
    const db = await this.db
    const result = new Promise((resolve) => {
      db.findOneAndUpdate(obj1,{
        $push: newObjValue
      }).then(response => resolve(response))
    })
    return result
  }

  async pull(keyID, valueID, arrNameObj){
    const obj1 = {}
    obj1[keyID] = valueID
    const db = await this.db
    const result = new Promise((resolve) => {
      db.findOneAndUpdate(obj1,{
        $pull: arrNameObj
      }).then(response => resolve(response))
    })
    return result
  }

}

// Read
function findMore(key, value){
  const obj = {}
  obj[key] = value
  db.find({nama: 'test'}).toArray((err, result) => {
    console.log(result)
  })
}


// Delete

function removeMore(db, value){
  const obj = {}
  obj[key] = value
  db.deleteMany({
    nama: "Orang2"
  }).then(result => console.log(result)).catch(err => console.log(err))
}

module.exports = {
  Database
}