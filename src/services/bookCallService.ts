import { Request, Response } from "express";
import moment from 'moment';
import { BookingCallModel } from '../models/bookCalls'
import { UserModel } from "../models/userModels";
import { formatTimeWithPeriod } from "../utils/timeFormat";
import { CallBookingOrders } from "../models/myOrders";
import { error } from "console";
// import { create } from "domain";

export const testing = async (req: Request, res: Response) => {
    try {
        res.status(200).send("Hello , Your Api call is Success")
    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error.message}` });
    }
}
export const create_user = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).send({ StatusCode: 400, Message: "All fields are required!" });
        }

        const newUser = new UserModel({
            username,
            password: password,
            createdAt: new Date(),
        });

        await newUser.save();

        res.status(201).send({ StatusCode: 201, Message: "User created successfully!", user: { username }, });
    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error.message}` });
    }
};


export const creater_call_bookings = async (req: Request, res: Response) => {
    try {
        let { createrName, createrID, rating, profileImage, date, pricePerDuration, timeslots } = req.body;
        let userdata = await BookingCallModel.findOne({ createrName, createrID, date })

        if (!userdata) {
            let userData = {
                createrName,
                createrID,
                rating,
                profileImage,
                pricePerDuration,
                timeslots,
                callAbout: req.body.callAbout || "",
                date: date,
                dateTime: moment().format("DD/MM/YYYY HH:mm"),
            };

            let result = await BookingCallModel.create(userData);
            if (result) {
                console.log("Creater Booking call created successfully");
                res.status(200).send({ StatusCode: 200, Message: "Creater Booking call created successfully" });
            }
        }
        else {
            const booking: any = await BookingCallModel.findOne({ createrName, createrID, date });

            if (booking) {

                let updatedTimeslots = false;

                for (let partOfDay of ["morning", "afternoon", "evening"]) {

                    const newTimeslot = timeslots[partOfDay];
                    const oldTimeslot = booking.timeslots[partOfDay];

                    for (let i = 0; i < newTimeslot.length; i++) {
                        if (newTimeslot[i].isBooked !== oldTimeslot[i].isBooked) {
                            updatedTimeslots = true;
                            break;
                        }
                    }
                }

                if (updatedTimeslots) {
                    const updatedResult = await BookingCallModel.updateOne({ createrID, date }, {
                        $set: {
                            dateTime: moment().format("DD/MM/YYYY HH:mm"),
                            rating,
                            timeslots, // Update the entire timeslots object
                        },
                    }
                    );

                    if (updatedResult.modifiedCount > 0) {
                        res.status(200).send({ StatusCode: 200, Message: "Timeslots updated successfully!" });
                    } else {
                        res.status(500).send({ StatusCode: 500, Message: "Failed to update timeslots!" });
                    }
                } else {
                    res.status(200).send({ StatusCode: 200, Message: "No changes detected in timeslots." });
                }
            } else {
                res.status(404).send({ StatusCode: 400, Message: "Booking not found!" });
            }
        }
    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error.message}` });
    }
}


type TimeSlot = {
    slot: string;
    isBooked: boolean;
};

type UserSlotData = {
    date: string;
    pricePerDuration: string[];
    timeslots: {
        morning: TimeSlot[];
        afternoon: TimeSlot[];
        evening: TimeSlot[];
    };
};

type User = {
    name: string;
    username: string;
    rating: number;
    profileImage: string;
};

type UserDetails = {
    user: User;
    userSlotsData: UserSlotData[];
};

// user: {
//     name: "Abraham",
//     username: "@abraham6438",
//     rating: 4,
//     profileImage:
//       "https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg?semt=ais_hybrid",
//   },
export const user_call_bookings = async (req: any, res: Response, next: any) => {
    try {
        let { username, password, createrName, createrID, rating, profileImage, date, pricePerDuration, timeslots } = req.body;
        const { user1, userslotsData } = req.body;
        // console.log(user1)
        if (!user1?.username && user1?.password || user1?.name) {
            res.status(400).send({ StatusCode: 400, Message: "User Not Found" })
        }
        const user = await UserModel.findOne({ username: user1?.username });
        // console.log("------------",user)
        if (user) {

            let userdata = await BookingCallModel.findOne({ username: user1?.username, createrID: user1?.createrID })
            // console.log(userdata)
            if (!userdata) {


                const bookingData = {
                    user: {
                        username: user1?.username || "",
                        userID: user1?.userID || "",
                        createrName: user1?.createrName || "",
                        createrID: user1?.createrID || "",
                        rating: user1?.rating || 0,
                        profileImage: user1?.profileImage || "",
                    },
                    userslotsData: userslotsData,
                    isUpdated: 1, // Indicates user has created a booking
                };
                // let userData = {
                //   username,
                //   createrName,
                //   createrID,
                //   rating,
                //   profileImage,
                //   pricePerDuration,
                //   timeslots,
                //   callAbout: req.body.callAbout || "",
                //   date: date,
                //   isUpdated: 1,            //user creates a booking call is 1
                //   dateTime: moment().format("DD/MM/YYYY HH:mm"),
                // };
                console.log("Created Details")
                let result: any = await BookingCallModel.create(bookingData);
                if (result) {
                    req.booking = result; // Pass booking data to next middleware
                    next();
                } else {
                    res.status(500).send({ StatusCode: 500, Message: "Failed to create booking call!" });
                }
            } else {

                const booking: any = await BookingCallModel.findOne({
                    "user.username": user1?.username,
                    "user.createrName": user1?.createrName,
                    "user.createrID": user1?.createrID,
                    "userslotsData.date": { $in: userslotsData.map((slot: { date: any }) => slot.date) }
                });


                if (!booking) {
                     res.status(404).send({ StatusCode: 404, Message: "Booking not found!" });
                }
                const requestDates = userslotsData.map((slot: any) => slot.date);

                let updatedSlotData = booking?.userslotsData?.find((slot: any) => {
                    // console.log("Checking slot date:", slot.date, "vs", requestDates);
                    return requestDates.includes(slot.date);
                });

                // console.log("Updated Slot Data:", updatedSlotData);
                if (!updatedSlotData || !updatedSlotData?.timeslots) {
                     res.status(404).send({ StatusCode: 404, Message: "Booking slot not found for this date!" });
                }

                let updatedTimeslots = false;
                for (let slotData of userslotsData) {  // Loop through each date's slots
                    console.log(`Date: ${slotData.date}`);
                    
                    for (let partOfDay of ["morning", "afternoon", "evening"]) { 
                        const newTimeslot = slotData.timeslots?.[partOfDay] || []; 
                        const oldTimeslot = updatedSlotData?.timeslots?.[partOfDay] || [];
                
                        console.log(`Checking ${partOfDay} timeslots: `, { newTimeslot, oldTimeslot });
                
                        for (let i = 0; i < Math.min(newTimeslot.length, oldTimeslot.length); i++) {
                            if (newTimeslot[i].isBooked !== oldTimeslot[i].isBooked) {
                                updatedTimeslots = true;
                                break;
                            }
                        }
                    }
                }
console.log(updatedTimeslots)
                if (updatedTimeslots) {
                    
                    const updatedResult = await BookingCallModel.updateOne(
                        {
                            "user.username": username,
                            "user.createrID": createrID,
                            "userslotsData.date": date,
                        },
                        {
                            $set: {
                                "userslotsData.$.timeslots": timeslots,
                                dateTime: moment().format("DD/MM/YYYY HH:mm"),
                                rating,
                                isUpdated: 2,
                            },
                        }
                    );

                        req.booking = await BookingCallModel.findOne({ "user.username": username, "user.createrID": createrID }).sort({ createdAt: -1 });
                       next();
                  
                }

            }
        } else {
            res.status(404).send({ StatusCode: 404, Message: "User not found!" });
        }
    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error}` })
    }
}


export const calculation_billing = async (req: any, res: Response) => {
    try {
        const booking: any = req.booking;

        let basePrice = 17;
        let totalDuration = 0;
        let timeslotStart = "";
        let timeslotEnd = "";
        let timeslotStartPeriod = "";
        let timeslotEndPeriod = "";
        console.log(booking)
        const periods = ["morning", "afternoon", "evening"];

        booking?.userslotsData?.forEach((slotData: any) => {
            slotData.pricePerDuration.forEach((duration: any) => {
                if (duration.isBooked) {
                    basePrice += parseFloat(duration.amount.replace("$", ""));
                }
            });

            for (const period of periods) {
                const timeSlots: any = slotData.timeslots?.[period];
                if (timeSlots) {
                    timeSlots.forEach((slot: any) => {
                        if (slot.isBooked) {
                            totalDuration += 30; // Each slot is 30 minutes
                            if (!timeslotStart) {
                                timeslotStart = slot.slot.split("-")[0];
                                timeslotStartPeriod = period;
                            }
                            timeslotEnd = slot.slot.split("-")[1];
                            timeslotEndPeriod = period;
                        }
                    });
                }
            }
        });


        const hours = Math.floor(totalDuration / 60);
        const minutes = totalDuration % 60;
        const Duration = `${hours} hour${hours !== 1 ? "s" : ""}${minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? "s" : ""}` : ""}`;
        const formattedStart = timeslotStart ? formatTimeWithPeriod(timeslotStart, timeslotStartPeriod) : "N/A";
        const formattedEnd = timeslotEnd ? formatTimeWithPeriod(timeslotEnd, timeslotEndPeriod) : "N/A";
        const platformCharges = 12;
        const salesTax = 12;
        const base = basePrice * totalDuration
        const total = base + platformCharges + salesTax;
        console.log(total, totalDuration)
        // Format date
        const formattedDate = new Date(booking?.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", });

        let result = {
            Date: formattedDate,
            Duration: Duration,
            Timeslot: `${formattedStart} - ${formattedEnd}`,
            BasePrice: `$${base.toFixed(2)}`,
            PlatformCharges: `$${platformCharges.toFixed(2)}`,
            SalesTax: `$${salesTax.toFixed(2)}`,
            Total: `$${total.toFixed(2)}`,
        }

        console.log("RESULT", result)

        res.status(200).send({ StatusCode: 200, Message: "updated Billing details fetched successfully!", result });

    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error}` })
    }
}

export const showAndBook_call_bookings = async (req: Request, res: Response) => {
    let { createrID} = req.body;
    try {
        BookingCallModel.findOne({ createrID }).sort({ _id: -1 }).then(data => {
            console.log(data)
            if (data) {

                res.status(200).send({ StatusCode: 200, Message: "Data Fetched Successfully", data })
            } else {
                res.status(400).send({ StatusCode: 400, Message: "user not found" })
            }
        })
    } catch (error: any) {
        res.status(500).send(`INTERNAL ERROR : ${error}`)
    }

}



export const myOrders = async (req: Request, res: Response) => {
    try {
        const { username, createrID, date, duration, timeslot, basePrice, platformCharges, salesTax, total } = req.body;

        if (!username || !createrID || !date || !timeslot) {
            res.status(400).json({ StatusCode: 400, Message: "Missing required fields: username, creatorID, Date, or Timeslot.", });
        }
        const data = {
            username: username,
            createrID: createrID,
            date: date,
            duration: duration,
            timeslot: timeslot,
            basePrice: basePrice,
            platformCharges: platformCharges,
            salesTax: salesTax,
            total: total,
            status: true,
            createdAt: new Date(),
        }
        await CallBookingOrders.create(data)
        res.status(200).send({ StatusCode: 200, Message: "Order Successfully Booked" })
    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR: ${error.message}`, });
    }
}

export const view_bookings = async (req: Request, res: Response) => {
    try {
        const { username } = req.query;
        console.log(username)
        if (!username) {
            console.error("❌ Error: Username is undefined or empty.");
        } else {
            const data = await CallBookingOrders.findOne({ username: username });
            const bookedDetails: any = await BookingCallModel.find({ username: username });
            const bookedData: any = [];
            for (let i in bookedDetails) {
                let a = bookedDetails[i].timeslots.morning;
                let b = bookedDetails[i].timeslots.afternoon;
                let c = bookedDetails[i].timeslots.evening;
                const allSlots = [...a, ...b, ...c]; // Combine morning, afternoon, and evening slots
                const currentTime = moment(); // Current time
                allSlots.forEach((slot: any) => {

                    if (slot.isBooked) {
                        let status = 0;
                        let currentTimeSlot = "";
                        const [startTime, endTime] = slot.slot.split('-'); // Split the time range
                        const startDate = moment(startTime.trim() + (startTime.includes("PM") ? "" : " PM"), "hh:mm A");
                        const endDate = moment(endTime.trim() + (endTime.includes("PM") ? "" : " PM"), "hh:mm A");

                        if (currentTime.isBetween(startDate, endDate, null, "[)")) {
                            console.log(`${slot.slot} is Active`);
                            status = 1; // Active
                            currentTimeSlot = slot.slot
                        } else if (currentTime.isBefore(startDate)) {
                            console.log(`${slot.slot} is Upcoming`);
                            status = 2; // Upcoming
                            currentTimeSlot = slot.slot
                        } else {
                            console.log(`${slot.slot} has Passed`);
                            status = 0; // Passed
                            currentTimeSlot = slot.slot
                        }
                        let obj: any = {
                            active: status,
                            currentTimeSlot: currentTimeSlot,
                            createName: bookedDetails[i].createrName,
                            createrID: bookedDetails[i].createrID,
                            date: bookedDetails[i].date,
                            timeslot: data?.timeslot,
                        }
                        bookedData.push(obj);
                    }
                });
            }
            console.log(bookedData)
            res.status(200).send({ StatusCode: 200, Message: "Booked Details Fetched", bookedData })
        }
    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR: ${error.message}`, });
    }
}

// router.post("/register", async (req, res) => {

//   try {
//       let emailExit = await user.findOne({ email: req.body.email })
//       if (emailExit) {
//           return res.status(400).json("Email already taken");npm
//       }
//       let psHash = await bcrypt.hash(req.body.password, 10);
//       let CpsHash = await bcrypt.hash(req.body.confirmpassword, 10);
//       const data = new user({
//           name: req.body.name,
//           email: req.body.email,
//           password: psHash,
//           confirmpassword: CpsHash,
//       });
//       let result = await data.save();
//       res.json(result);

//   } catch (error) {
//       res.status(500).send({ message: "Internal Server Error" });
//   }

// });


// //login

// router.post("/login", async (req, res) => {
//   try {
//       let userExit = await user.findOne({ email: req.body.email })
//       if (!userExit) {
//           return res.status(400).json("Your Email Wrong");
//       }
//       let passwordValidation = await bcrypt.compare(req.body.password, userExit.password);
//       if (!passwordValidation) {
//           return res.status(400).json("Your Password Wrong");
//       }
//       const userToken = jwt.sign({ email: userExit.email, name: userExit.name,id:userExit._id }, "userinfoSecretId",{expiresIn:"2d"});
//       res.header("auth",userToken).send(userToken);

//   } catch (error) {
//       res.status(500).send({ message: "Internal Server Error" });

//   }
// })

// //user get

// router.get("/userdetails/id", validation, async (req,res)=>{
//   try {
//       const userInfo = await user.findById(req.user.id);
//       const {password,...details }= userInfo._doc;
//       res.status(200).json({...details});

//   } catch (error) {
//       res.status(500).send({ message: "Internal Server Error" });
//   }
// })

// //userUpdate

// router.put("/userdetails", validation, async (req,res)=>{
//   try {
//       const userInfo = await user.findByIdAndUpdate(req.user.id,{$set:req.body},{new:true});
//       res.status(200).json(userInfo);

//   } catch (error) {
//       res.status(500).send({ message: "Internal Server Error" });
//   }
// })















// {
//     "username": "Sudheer",
//     "password":"Sudheer123$",
//     "createrName":"Behindwoods",
//     "createrID": "Behindwoods0001",
//     "rating":3,
//     "profileImage":"https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg?semt=ais_hybrid",
//      "date": "06th July",
//      "pricePerDuration": [
//       {"time":"1","amount":"17$","isBooked": false},
//       {"time":"2","amount":"17$","isBooked": true},
//       {"time":"15","amount":"17$","isBooked": false},
//       {"time":"30","amount":"17$","isBooked": false},
//       {"time":"60","amount":"17$","isBooked": false}
//     ],
//     "timeslots": {
//       "morning": [
//         { "slot": "08:00-08:30", "isBooked": false},
//         { "slot": "09:00-09:30", "isBooked": false },
//         { "slot": "09:30-10:00", "isBooked": true },
//         { "slot": "10:00-10:30", "isBooked": false }
//       ],
//       "afternoon": [
//         { "slot": "12:00-12:30", "isBooked": true },
//         { "slot": "12:30-01:00", "isBooked": false },
//         { "slot": "01:00-01:30", "isBooked": false },
//         { "slot": "01:30-02:00", "isBooked": true }
//       ],
//       "evening": [
//         { "slot": "05:00-05:30", "isBooked": false },
//         { "slot": "05:30-06:00", "isBooked": false },
//         { "slot": "06:00-06:30", "isBooked": false },
//         { "slot": "06:30-07:00", "isBooked": true },
//         { "slot": "07:00-07:30", "isBooked": false }
//       ]
//     }
//   }