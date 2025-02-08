import express from 'express'
export const router = express.Router();
import {creater_call_bookings,user_call_bookings,calculation_billing,showAndBook_call_bookings,create_user,myOrders,view_bookings} from '../services/bookCallService'

// Routes
router.post("/create_user",create_user)
router.post("/creater_call_bookings",creater_call_bookings)
router.post("/user_call_bookings", user_call_bookings,calculation_billing)
router.post("/showAndBook_call_bookings",showAndBook_call_bookings)
router.post("/myOrders",myOrders)
router.get("/view_bookings",view_bookings)