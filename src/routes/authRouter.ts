import express from 'express'
export const router = express.Router();
import {creater_call_bookings,testing,user_call_bookings1,creater_details_update,billingDetails,huddle,user_call_bookings,calculation_billing,view_creater_details,create_user,orderUpdate,myOrders,view_bookings} from '../services/bookCallService'

// Routes
router.post("/create_user",create_user)
router.post("/creater_call_bookings",creater_call_bookings)
// router.post("/user_call_bookings", user_call_bookings1,calculation_billing)
router.post("/orderUpdate",orderUpdate)
router.get("/view_bookings",view_bookings)
router.get("/myOrders",myOrders)
router.get("/huddle",huddle)
router.get("/billingDetails",billingDetails)
//testing
router.get("/testing",testing)


//creater data insert for initially
router.post("/creater_details_update",creater_details_update)
router.get("/view_creater_details",view_creater_details)
router.post("/user_call_bookings",user_call_bookings,calculation_billing)
