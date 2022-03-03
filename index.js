const http = require('http')
const fs = require('fs')

const FS = require('./lib/filesys')
const PORT = 5000

const Markets = new FS('./models/markets.json')
const Branches = new FS('./models/marketBranches.json')
const Products = new FS('./models/marketProducts.json')
const Workers = new FS('./models/marketWorkers.json')



const server = http.createServer((req,res) => {
  const url = req.url
  const method = req.method

  let params = url.split('/')
  let endpoint = null
  let param = null

  // params and endpoint

  if(params.length >= 3) {
    console.log(params);
    if(params[1] == 'markets' || params[1] == 'marketInfo') {
      endpoint =params[1]
      if(!isNaN(params[2])) {
        param = params[2]
      }else{
        param =null
      }
    }
  }



/* --------------------- GET METHOD  ---------------------- */


// endpoint ==>  MARKET 
  if(url === '/markets' && method === 'GET') {
    const arrMarkets = Markets.read()
    res.end(JSON.stringify(arrMarkets))
  }


// endpoint ==>  MARKET INFO
  else if( url === '/marketInfo' && method === 'GET') {

    const markets = Markets.read()
    const branches = Branches.read()
    const products = Products.read()
    const workers = Workers.read()

    let marketInfo = []

    markets.map(market => {
      marketInfo.push({
        id:market.id,
        name:market.name,
        branches:  branches.find(branch => branch.marketID == market.id) ? branches.find(branch => branch.marketID == market.id).branches : [] ,
        products:  products.find(product => product.marketID == market.id) ? (products.find(product => product.marketID == market.id)).products : [] ,
        workers:   workers.find(worker => worker.marketID == market.id) ? (workers.find(worker => worker.marketID == market.id)).workers : [] 
      })
    })

    res.end(JSON.stringify(marketInfo))
  }


// endpoint with params  marketInfo/:id  and market/:id
  else if (endpoint && param) {
    if(method === 'GET') {
      if(endpoint ==='markets') {
        let market = Markets.read()
        let uniqMarket = market.find(m => m.id == param)

        res.end(JSON.stringify(uniqMarket))
      }else {
        const markets = Markets.read()
        const branches = Branches.read()
        const products = Products.read()
        const workers = Workers.read()
        let response = {
          id:param,
          name:markets.find(mark => mark.id == param) ? markets.find(mark => mark.id == param).name : [] ,
          branches:branches.find(branch => branch.marketID == param) ? (branches.find(branch => branch.marketID == param)).branches : [],
          products:  products.find(product => product.marketID == param) ? (products.find(product => product.marketID == param)).products : [] ,
          workers:   workers.find(worker => worker.marketID == param) ? (workers.find(worker => worker.marketID == param)).workers : [] 
        }
        res.end(JSON.stringify(response))
      }
    }
  }



/* --------------------- POST METHOD  ---------------------- */



// endpoint newMarket 
  else if(url === '/newMarket' && method == 'POST') {
    let newMarket = null
    req.on('data' , chunk => {
      newMarket =JSON.parse(chunk)
    })



    

    fs.readFile('./models/markets.json' , (err,data) => {
      if(err) throw err
      let arrMarkets = JSON.parse(data)
      arrMarkets.push({
        id:arrMarkets.length + 1 ,
        name:newMarket.name,
        year: newMarket.name ? newMarket.name : null
      })
      let newBranch = Branches.read()
      newBranch.push({
        marketID:arrMarkets.length + 1,
        branches:[]
      })

      Branches.write(newBranch)

      let newWorkers = Workers.read()
      newWorkers.push({
        marketID:arrMarkets.length + 1,
        workers:[]
      })

      Workers.write(newWorkers)
      
      
      fs.writeFile('./models/markets.json',JSON.stringify(arrMarkets , null , 4) , err => {
        if(err) throw err
        res.end(JSON.stringify({message: "Seccess created new Market"}))
      })
    })


  }

  else if(url === '/newBranch' && method === 'POST') {
    let newBranch = null
    req.on('data' , chunk => {
      newBranch = JSON.parse(chunk)
    })

    fs.readFile('./models/marketBranches.json' , (err,data) => {
      if(err) throw err
      let MarketBranches = JSON.parse(data)
      let addBranch = MarketBranches.find(itm => itm.marketID == newBranch.marketID)
      addBranch.branches.push({
        id:addBranch.branches.length + 1 ,
        name : newBranch.name,
      })
      fs.writeFile('./models/marketBranches.json' , JSON.stringify(MarketBranches , null , 4) , err => {
        if(err) throw err
        res.end(JSON.stringify({message: "Added new branch "}))
      })
    })


  }

  else if(url ==='/newProduct' && method === 'POST') {
    let newProduct = null
    req.on('data' , chunk => {
      newProduct = JSON.stringify(chunk)
    })

    fs.readFile('./models/marketProducts.json' , (err,data) =>{
      if(err) throw err
      let arrProducts = JSON.parse(data)

      let addProduct = arrProducts.find(itm => itm.marketID == newProduct.marketID)

      addProduct.products.push({
        id:addProduct.products.length + 1 ,
        name:newProduct.name,
        count:newProduct.count
      })

      fs.writeFile('./models/marketProducts.json' , JSON.stringify(arrProducts , null , 4) , err => {
        if(err) throw err
        res.end(JSON.stringify({message:"Success added new product"}))
      })


    })
  }

  else if(url === '/newWorker' && method === 'POST') {
    let newWorker = null
    req.on('data' , chunk => {
      newWorker = JSON.parse(chunk)
    })
    fs.readFile('./models/marketWorkers.json' , (err,data) => {
      if(err) throw err
      let arrWorkers = JSON.parse(data)
      let addWorker = arrWorkers.find(itm => itm.marketID == newWorker.marketID)
      addWorker.workers.push({
        id:addWorker.workers.length + 1,
        name:newWorker.name,
        workType: newWorker.workType ? newWorker.workType : null,
      })

      fs.writeFile('./models/marketWorkers.json' ,JSON.stringify(arrWorkers , null ,4), err => {
        if(err) throw err
        res.end(JSON.stringify({message:'Succes added new worker'}))
      })
    })

  }
  else{
    res.end('Unknow endpoint!')
  }


})


server.listen(PORT , () => {
  console.log(`Server is ready at ${PORT}`);
})