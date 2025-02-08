import express from "express"
const app = express();

app.use(express.json());

app.get("/",(req,res)=>{
    res.status(200).send("Hello from the server")
})

const port = process.env.PORT || 8000;
app.listen(port,()=>{
    console.log(`listening the port ${port}`)
})










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
