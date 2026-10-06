const express = require('express')
const app = express()
const port = 3000

const fs = require("fs").promises;
const crypto = require("crypto");

class Jaja {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        await this.#saveFile([]); 
        return [];
      }
      throw error; 
    }
  }

  async #saveFile(products) {
    await fs.writeFile(this.filePath, JSON.stringify(products, null, 2), "utf8");
  }

  #generateId() {
    return crypto.randomUUID();
  }

  async pepe(req, res){
    try{

    }catch{

    }
  }
  async juan(){}
}

const huhneat= new Jaja("Products.json")

app.get('/pepe', huhneat.pepe())

app.post('/juan', huhneat.juan())

app.get('/mia', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
