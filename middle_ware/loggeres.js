import color from 'colors'

const methodColors = {
  GET: "green",
  POST: "blue",
  PUT: "yellow",
  PATCH: "magenta",
  DELETE: "red",
 
};


function logger(req, res , next){
  
     const col = methodColors[req.method] || "white"
       console.log("ima in loggers ",col)

    console.log(color[col] (`${req.method} :: ${req.protocol} \n host: ${req.get('host')} url :${req.originalUrl }`))
    next()
}

export default logger;