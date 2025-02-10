// import express from "express"
// const app = express();

// app.use(express.json());

// app.get("/",(req,res)=>{
//     res.status(200).send("Hello from the server")
// })

// const port = process.env.PORT || 8000;
// app.listen(port,()=>{
//     console.log(`listening the port ${port}`)
// })



import express from 'express';
import cors from 'cors'
import BodyParser from 'body-parser';
import { initmongo } from './database/mongodb';
import { router } from './routes/authRouter';
const app = express();

const init = () => {
    try {
      initmongo();
  
      const PORT = process.env.PORT || 3000;
      app.use(BodyParser.json());
      app.use(BodyParser.json({ limit: '50mb' }))
      app.use(
        cors({
          origin: "*",
          methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
        })
      );
      app.all("/*", function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, Content-Length, X-Requested-With"
        );
        res.header("Access-Control-Allow-Credentials", "true");
        next();
      });
  
      //api
      app.get("/",(req,res)=>{
        res.status(200).send("Hello from the server")
    })
    
      app.use("/bookcalls/api", cors(), router);
      app.get("/bookcalls", (req, res) => {
        res.send(
          `<h1 style='text-align:center;'>🤞➖Welcome to Booking Calls ➖🤞</h1><br><h2 style='text-align:center;'>${new Date().toLocaleString()}</h2>`
        );
      });
  
      app.listen(PORT, () => {
        console.log(`🚀 Port is running Successfully in ${PORT}`);
      });
    } catch (err) {
      console.error(err);
    }
  };
  init();
 






// {
//   "name": "donatuz-vercel",
//   "version": "1.0.0",
//   "main": "index.ts",
//   "engines": {
//     "node": "22.x"
//   },
//   "scripts": {
//     "start": "ts-node ./src/index.ts",
//     "dev": "nodemon ./src/index.ts",
//     "test": "echo \"Error: no test specified\" && exit 1"
//   },
//   "author": "",
//   "license": "ISC",
//   "description": "",
//   "dependencies": {
//     "@types/express": "^5.0.0",
//     "@types/mongoose": "^5.11.96",
//     "dotenv": "^16.4.7",
//     "express": "^4.21.2",
//     "mongoose": "^8.10.0"
//   },
//   "devDependencies": {
//     "@types/node": "^22.13.1",
//     "nodemon": "^3.1.9",
//     "ts-node": "^10.9.2",
//     "typescript": "^5.7.3"
//   }
// }
