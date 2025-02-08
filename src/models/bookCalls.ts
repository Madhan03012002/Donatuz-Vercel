import { Schema, model } from "mongoose";

const BookingCallSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
   },
  createrName: {
    type: String,
    required: true
  },
  createrID: {
    type: String,
    required: true
  },
  rating: { 
    type: Number, 
    required: true 
  },
  profileImage: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  pricePerDuration: [
    {
      _id: false,
      time: { type: String, required: true },
      amount: { type: String, required: true },
      isBooked: { type: Boolean, required: true,default:false }
    },
  ],
  timeslots: {
    morning: [
      { _id: false, slot: { type: String, required: true }, isBooked: { type: Boolean, required: true } },
    ],
    afternoon: [
      {_id: false, slot: { type: String, required: true }, isBooked: { type: Boolean, required: true } },
    ],
    evening: [
      { _id: false, slot: { type: String, required: true }, isBooked: { type: Boolean, required: true } },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
   dateTime: {
    type: String,
    required: true,
  },
  isUpdated: {
    type: Number,
    default:0
  }
});

export const BookingCallModel = model("Booking_Calls_Details", BookingCallSchema);



 