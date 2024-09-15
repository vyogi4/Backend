import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";



const connectDB = async () => {
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    //    Object.keys.array.forEach(element => {
        
    //    });
    } catch (error) {
        console.log("MONGODB connnection Failed:",error)
        process.exit(1)
    }
}



export default connectDB


// const functionProvider = (func) =>()=> {
//     // this is higher order funciton in which one then one function is taken as a parameter and return a function
// }

