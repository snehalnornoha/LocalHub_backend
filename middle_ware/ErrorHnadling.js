

function error_handler (err , req ,res ,next ){
    console.log("iam in eroor handling")
    console.log(err.message)

    if(err.status){
        return res.status(err.status).json( {error : err.message})
    }
    return res.status(500).json( {error : err.message})

    next()
   
}

export default error_handler;