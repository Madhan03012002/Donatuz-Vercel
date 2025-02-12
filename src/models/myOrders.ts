import { Schema, model } from "mongoose";

const CallBookOrderSchema = new Schema({
    username: { type: String },
    BID: {type: String, required:true},
    OID: {type: String},
    userID: { type: String, required: true },
    createrID: { type: String },
    date: { type: String },
    duration: { type: String },
    timeslot: { type: String},
    basePrice: { type: String },
    platformCharges: { type: String },
    salesTax: { type: String},
    total: { type: String },
    status: { type: Number, default: 0 }, 
    timeLeft: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    occasion: {type: String},
    amountPaid: { type: String},
    paymentMethod: { type: String },
    expectedDate: {type: String },
    isBooked: { type: Boolean , default: false},
    callJoined: { type: Boolean, default: false }
});

export const CallBookingOrders = model("MyOrders", CallBookOrderSchema);