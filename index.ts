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
import BodyParser from 'body-parser';
import { initmongo } from './database/mongodb';

const app = express();

const init = () => {
    try {
        initmongo();

      const PORT = process.env.PORT || 3000;
      app.use(BodyParser.json());
    //   app.use(BodyParser.json({ limit: '50mb' }))
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
 