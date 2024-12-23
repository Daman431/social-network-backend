import mongoose from "mongoose";

const connectionString = process.env.DATABASE_STRING;
export const connectToDB = () => {
    mongoose.connect(connectionString).then((value) => {
        console.log(`DB connected successfullly`)
    })
    .catch(err => {
        console.log(err);
    })
}