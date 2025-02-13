import { Schema, model } from "mongoose";

const BillingCalDetailsSchema = new Schema({
    username: { type: String, required: true },
    userID: { type: String, required: true },
    createrID: { type: String, required: true },
    date: { type: String },
    BID: { type: String },
    duration: {type:String},
    timeslot: {type:String},
    basePrice: {type:String},
    platformCharges: {type:String},
    salesTax: {type:String},
    total:{type:String},
    Status:{type:Number},
    amountPaid:{type:String ,default:"No"},
    callJoined:{type:String},
    pricePerDuration: { type: String },
    bookingSlot: { type: String },
    day: { type: String },
    isBookingConfirmed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export const BillingCalDetails = model("BillingCalDetails", BillingCalDetailsSchema);