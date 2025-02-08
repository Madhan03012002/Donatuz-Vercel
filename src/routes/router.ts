import express from 'express'
export const router = express.Router();

import { testing } from '../service';
console.log(1)
router.get("/testing",testing)