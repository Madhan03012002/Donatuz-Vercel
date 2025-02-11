import { Schema, model } from "mongoose";

const CallBookOrderSchema = new Schema({
    username: { type: String, required: true },
    userID: { type: String, required: true },
    createrID: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: String, required: true },
    timeslot: { type: String, required: true },
    basePrice: { type: String, required: true },
    platformCharges: { type: String, required: true },
    salesTax: { type: String, required: true },
    total: { type: String },
    status: { type: Number, default: 0 }, 
    timeLeft: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    occasion: {type: String},
    amountPaid: { type: String, required: true },
    paymentMethod: { type: String ,required: true},
    expectedDate: {type: String },
    callJoined: { type: Boolean, default: false }
});

export const CallBookingOrders = model("MyOrders", CallBookOrderSchema);