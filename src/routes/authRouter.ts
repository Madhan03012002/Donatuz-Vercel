import express from 'express'
export const router = express.Router();
import {creater_call_bookings,testing,user_call_bookings,calculation_billing,showAndBook_call_bookings,create_user,orderUpdate,myOrders,view_bookings} from '../services/bookCallService'

// Routes
router.post("/create_user",create_user)
router.post("/creater_call_bookings",creater_call_bookings)
router.post("/user_call_bookings", user_call_bookings,calculation_billing)
router.post("/showAndBook_call_bookings",showAndBook_call_bookings)
router.post("/orderUpdate",orderUpdate)
router.get("/view_bookings",view_bookings)
router.get("/myOrders",myOrders)

//testing
router.get("/testing",testing)