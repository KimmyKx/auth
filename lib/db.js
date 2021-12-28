const { MongoClient, ObjectId } = require('mongodb')
let uri = "mongodb+srv://Kimmy:QfBPDszoF4oaPDnw@cluster0.htmc3.mongodb.net/Bootcamp?retryWrites=true&w=majority"
const mongo = new MongoClient(uri, {
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
  
  /**
   * @param {string} key
   * @param {string} value
   * @param {boolean} condition - optional param
   */
  async find(key, value, condition){
    const obj = {}
    if(condition) {
      obj[key] = {
        $all: value
      }
    } else {
      obj[key] = value
    }
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

  async update(oldKey, oldValue, objectChanges){
    const obj1 = {}
    obj1[oldKey] = oldValue
    const db = await this.db
    const result = new Promise((resolve) => {
      db.findOneAndUpdate(obj1, { $set: objectChanges }).then(response => resolve(response))
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

  async pushOne(keyID, valueID, newObjValue){
    const obj1 = {}
    obj1[keyID] = valueID
    const db = await this.db
    const result = new Promise((resolve) => {
      db.findOneAndUpdate(obj1,{
        $addToSet: newObjValue
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

  async newField(keyID, valueID, arrNameObj){
    const obj1 = {}
    obj1[keyID] = valueID
    const db = await this.db
    const result = new Promise((resolve) => {
      db.updateMany(obj1,{
        $set: arrNameObj
      },{
        upsert: false,
        multi: true
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