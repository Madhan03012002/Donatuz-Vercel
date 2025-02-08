import { Schema, model } from "mongoose";

const CallBookOrderSchema = new Schema({
         username: { type: String, required: true },
        createrID: { type: String, required: true },
        date: { type: String, required: true },
        duration: { type: String, required: true },
        timeslot: { type: String, required: true },
        basePrice: { type: String, required: true },
        platformCharges: { type: String, required: true },
        salesTax: { type: String, required: true },
        total: { type: String, required: true },
        status: { type: Boolean, default: false }, // Default to active
        timeLeft: { type: String, default: "" }, // Calculated when needed
        createdAt: {type: Date }, 
           });

export const CallBookingOrders = model("MyOrders", CallBookOrderSchema);