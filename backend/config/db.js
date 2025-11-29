import mongoose from 'mongoose'
import colors from 'colors'
const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.mongo_url)
        console.log(`connected to mongodb database ${conn.connection.host}`.bgMagenta.white);
    }
    catch(error){
        console.log('error in mongodb'.bgRed.white)
        console.log(error)
    }
}

export default connectDB