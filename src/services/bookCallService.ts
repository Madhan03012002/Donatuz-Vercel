import { Request, Response } from "express";
import moment from 'moment';
import { BookingCallModel } from '../models/bookCalls'
import { UserModel } from "../models/userModels";
import { formatTimeWithPeriod } from "../utils/timeFormat";
import { CallBookingOrders } from "../models/myOrders";
import { error } from "console";
import { AccessToken, Role } from "@huddle01/server-sdk/auth";
import { generateCustomUuid } from "custom-uuid";
import { BillingCalDetails } from "../models/billingDetails";

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

//Creater Details Insert to Show Creater Details for the initial time
export const creater_details_update = async (req: Request, res: Response) => {
    try {
        const { user, userslotsData } = req.body;

        if (!user || !userslotsData) {
            res.status(400).send({ StatusCode: 400, Message: "Creater Details NOT FOUND" })
        } else {
            const createrDetails = await BookingCallModel.create({ user, userslotsData })
            console.log(createrDetails)
            res.status(200).send({ StatusCode: 200, Message: "Creater Details Created Successfully" })
        }

    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error}` })
    }
}



export const view_creater_details = async (req: Request, res: Response) => {
    let createrID = req.headers.createrid || req.headers.CreaterID; 
 
    console.log(createrID)
    try {
        if (!createrID) {
            res.status(400).send({ StatusCode: 400, Message: "CreaterID Not Found" })
        } else {
            const data = await BookingCallModel.findOne({ createrID }).sort({ _id: -1 });

            if (data) {
                res.status(200).json({ StatusCode: 200, Message: "Data Fetched Successfully", data });
            } else {
                res.status(404).json({ StatusCode: 404, Message: "User Not Found" });
            }
        }
    } catch (error: any) {
        res.status(500).send(`INTERNAL ERROR : ${error}`)
    }
}

export const user_call_bookings = async (req: any, res: Response, next: any) => {
    try {
        const { username, userID, createrID, date, pricePerDuration, bookingSlot, day } = req.body;

        if (!username || !userID || !createrID || !date || !pricePerDuration || !bookingSlot || !day) {
            res.status(400).send({ StatusCode: 400, Message: "booking Details invalid" })
        } else {
            let data = {
                username: username || "",
                userID: userID || "",
                createrID: createrID || "",
                date: date || "",
                pricePerDuration: pricePerDuration || "",
                bookingSlot: bookingSlot || "",
                day: day || ""
            }
            // await BillingCalDetails.create(data)
            req.billingData = data
            next();
            // res.status(200).send({ StatusCode: 200, Message: "User Booking updated successfully" })
        }
    } catch (error: any) {
        res.status(500).send(`INTERNAL ERROR : ${error}`)
    }
}
export const user_call_bookings1 = async (req: any, res: Response, next: any) => {
    try {
        let { username, password, createrName, createrID, rating, profileImage, date, pricePerDuration, timeslots } = req.body;
        const { user1, userslotsData } = req.body;
        // console.log(user1)
        if (!user1?.username && user1?.password || user1?.name) {
            res.status(400).send({ StatusCode: 400, Message: "User Not Found" })
        }
        const user = await UserModel.findOne({ username: user1?.username });
        if (user) {

            let userdata = await BookingCallModel.findOne({ username: user1?.username, createrID: user1?.createrID })
            if (!userdata) {


                const bookingData = {
                    user: {
                        username: user1?.username || "",
                        userID: user1?.userID || "",
                        createrName: user1?.createrName || "",
                        createrID: user1?.createrID || "",

                    },
                    userslotsData: userslotsData,
                    isUpdated: 1,
                };

                console.log("Created Details")
                let result: any = await BookingCallModel.create(bookingData);
                if (result) {
                    req.booking = result;
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
                } else {
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
                    // console.log(updatedTimeslots)
                    if (updatedTimeslots) {

                        const updatedResult = await BookingCallModel.updateOne(
                            {
                                "user.username": user1?.username,
                                "user.createrName": user1?.createrName,
                                "user.createrID": user1?.createrID,
                                "userslotsData.date": { $in: userslotsData.map((slot: { date: any }) => slot.date) }
                            },
                            {
                                $set: {
                                    "userslotsData.$.timeslots": timeslots,
                                    dateTime: moment().format("DD/MM/YYYY HH:mm"),
                                    isUpdated: 2,
                                },
                            }
                        ).sort({ createdAt: -1 });
                        console.log("00000000000000", updatedResult)
                        req.booking = await BookingCallModel.findOne({ "user.username": user1?.username, "user.createrID": user1?.createrID }).sort({ createdAt: -1 });
                        next();

                    }
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
        const billingData: any = req.billingData;

        const priceMatch = billingData.pricePerDuration.match(/(\d+)\s*min\/\$(\d+)/);
        if (!priceMatch) {
            res.status(400).json({ StatusCode: 400, Message: "Invalid price format" });
        }

        const ratePerMinute = parseFloat(priceMatch[2]); // Extract the dollar value

        // Extract booking duration in minutes
        const [start, end] = billingData.bookingSlot.split("-");
        const startTime = new Date(`2025-01-01T${start}:00`);
        const endTime = new Date(`2025-01-01T${end}:00`);
        const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // Convert milliseconds to minutes

        // Calculate total cost
        const totalCost = ratePerMinute * durationInMinutes;
        let BID: any = `B${generateCustomUuid("0123456789DONATUZ", 10)}`

        // Construct billing data
        const billingData1 = {
            username: billingData.username,
            userID: billingData.userID,
            createrID: billingData.createrID,
            date: billingData.date,
            BID: BID,
            duration: `${durationInMinutes} minutes`,
            timeslot: billingData.bookingSlot,
            basePrice: `$${totalCost.toFixed(2)}`,
            platformCharges: "$12.00",
            salesTax: "$12.00",
            total: `$${(totalCost + 24).toFixed(2)}`,
            status: 0,
            day: billingData.day,
            callJoined: false,
        };

        await BillingCalDetails.create(billingData1);

        res.status(201).json({ StatusCode: 201, Message: "Billing Details Created", BID });

    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error}` })
    }
}

export const billingDetails = async (req: Request, res: Response) => {
    try {
        // const { BID, userID } = req.body;
        const BID = req.headers.BID || req.headers.bid;
        const userID = req.headers.userID || req.headers.userid;

        if (!BID && !userID) {
            res.status(400).send({ StatusCode: 400, Message: "Invalid BID or userID" })
        } else {

            const billingData = await BillingCalDetails.findOne({ BID: BID, userID: userID }).sort({ createdAt: -1 })
            if (billingData) {
                res.status(200).send({ StatusCode: 200, Message: "Billing Data Fetched Successfully", billingData })
            } else {
                res.status(404).send({ StatusCode: 404, Message: "Billing Data Not Found" })
            }
        }


    } catch (error: any) {
        res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error}` })
    }
}




export const orderUpdate = async (req: Request, res: Response) => {
    try {
        const { isBookingConfirmed, BID, userID,createrID } = req.body;

        if (!isBookingConfirmed) {
            res.status(400).json({ StatusCode: 400, Message: "Missing required isBookingConfirmed" });
        } else {
            let OID = `O${generateCustomUuid("0123456789DONATUZ", 10)}`;

             const billingData = await BillingCalDetails.findOne({ BID, userID,createrID }).sort({ createdAt: -1 }).lean();
console.log(billingData)
            if (!billingData) {
                res.status(400).json({ StatusCode: 400, Message: "Invalid Billing Details" });
            } else {

                const { date, timeslot, day } = billingData;

                if (!userID || !date || !timeslot || !day) {
                    res.status(400).json({ StatusCode: 400, Message: "Missing required fields" });
                } else {
 
                    const bookingUpdate = await BookingCallModel.updateOne(
                        {
                            "user.userID": userID,
                            "user.createrID": createrID,
                            "userslotsData.date": date
                        },
                        {
                            $set: {
                                [`userslotsData.$[outer].timeslots.${day}.$[inner].isBooked`]: true,
                                [`userslotsData.$[outer].timeslots.${day}.$[inner].isPaymentPaid`]: true
                            }
                        },
                        {
                            arrayFilters: [
                                { "outer.date": date },  // Match correct date inside userslotsData
                                { "inner.slot": timeslot }  // Match correct slot inside timeslots[day]
                            ]
                        }
                    );                    

                    if (bookingUpdate.matchedCount === 0) {
                        res.status(404).json({ StatusCode: 404, Message: "Time slot not found." });
                    } else {
                         await Promise.all([
                            CallBookingOrders.updateOne({ BID, userID }, { $set: { OID, isBooked: true } }),
                            BillingCalDetails.updateOne({ BID, userID }, { $set: { isBookingConfirmed: true } })
                        ]);

                        res.status(200).json({ StatusCode: 200, Message: "Slot successfully booked!", OID });
                    }
                }
            }
        }
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ StatusCode: 500, Message: "Internal Server Error" });
    }

}


export const myOrders = async (req: Request, res: Response) => {
    try {
        const { userID, OID } = req.body;
        if (!userID && OID) {
            res.status(400).send({ StatusCode: 400, Message: "UserID Invalid" });
        }
        const orderdetails = await CallBookingOrders.find({ userID: userID, OID: OID, isBooked: true }).sort({ createdAt: -1 })
        console.log(orderdetails)
        res.status(200).send({ StatusCode: 200, Message: "MyOrder Fetched Successfully", orderdetails })
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



export const dynamic = "force-dynamic";
export const huddle = async (req: Request, res: Response) => {
    const searchParams: any = new URL(req.url);
    console.log(searchParams)
    const roomId = searchParams.get("roomId");

    if (!roomId) {
        new Response("Missing roomId", { status: 400 });
    }

    const accessToken = new AccessToken({
        apiKey: "ak_iNM53RyFmEbyUcg9",
        roomId: roomId as string,
        role: Role.HOST,
        permissions: {
            admin: true,
            canConsume: true,
            canProduce: true,
            canProduceSources: {
                cam: true,
                mic: true,
                screen: true,
            },
            canRecvData: true,
            canSendData: true,
            canUpdateMetadata: true,
        },
    });

    const token = await accessToken.toJwt();
    console.log("------------", token)
    new Response(token, { status: 200 });
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



