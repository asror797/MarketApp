const fs = require('fs')

class FS {
  constructor(dir) {
    this.dir = dir
  }

  read() {
    return JSON.parse(fs.readFileSync(this.dir ,{encoding:'utf-8' , flag:'r'}))
  }

  write(data) {
    fs.writeFile(this.dir , JSON.stringify(data , null , 4) , err => {
      if(err) throw err
      console.log('Seccess wrote data')
    })
  }
}

module.exports = FS