import { Schema, model } from "mongoose";

const TimeSlotSchema = new Schema(
  {
    slot: { type: String, required: true },
    isBooked: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const BookingSchema = new Schema(
  {
    date: { type: String, required: true },
    pricePerDuration: [{ type: String, required: true }],
    timeslots: {
      morning: [TimeSlotSchema],
      afternoon: [TimeSlotSchema],
      evening: [TimeSlotSchema],
    },
  },
  { _id: false }
);

// Updated user schema as a nested object
const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    userID: { type: String, required: true },
    createrName: { type: String, required: true },
    createrID: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    profileImage: { type: String, required: true },
  },
  { _id: false }
);

const BookingCallSchema = new Schema({
  user: { type: UserSchema, required: true }, // Nested user object
  userslotsData: [BookingSchema],
  createdAt: { type: Date, default: Date.now },
  isUpdated: { type: Number, default: 0 },
});

export const BookingCallModel = model("Booking_Calls_Details", BookingCallSchema);
