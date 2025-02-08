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