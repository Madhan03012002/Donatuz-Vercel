import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING ? process.env.DB_CONNECTION_STRING : "DB_CONNTION_STRING"

// // export const initmongo = async () => {
// //     try {
// //         mongoose.set('strictQuery', true);
// //         await mongoose.connect(DB_CONNTION_STRING);
// //         let db = mongoose.connection;
// //         db.on('error', err => console.log(err));
// //         db.once('open', () => console.log('\n📝 Connected'));

// //     } catch (err) {
// //         console.log(err);
// //     }
// // }

 
 
export const initmongo = async () => {
    try {
        if (!DB_CONNECTION_STRING) {
            throw new Error("❌ Missing DB_CONNECTION_STRING in .env file");
        }
        mongoose.set("strictQuery", true);
        await mongoose.connect(DB_CONNECTION_STRING, {
            tls: true,  // Ensure TLS is enabled
            tlsInsecure: false,  // Prevent insecure SSL
            connectTimeoutMS: 10000,  // Timeout to prevent hanging
        });

        // await mongoose.connect(DB_CONNECTION_STRING, {
        //     serverSelectionTimeoutMS: 5000, // Timeout if no response in 5 sec
        // });
        let db = mongoose.connection;

        db.on("error", (err) => console.log("❌ MongoDB Error:", err));
        db.on("disconnected", () => console.log("⚠️ MongoDB Disconnected"));
        db.once("open", () => console.log("\n✅ Fully Connected to MongoDB"));

    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
    }
};

initmongo();

