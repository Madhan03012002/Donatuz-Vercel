import { Request, Response } from "express";


export const testing = async (req: Request, res: Response) => {
    console.log("Response Successful")
res.status(200).send({statuscode:200,message:"Response Successful"})
}