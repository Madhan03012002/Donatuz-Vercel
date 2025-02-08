import { Request, Response } from "express";
import  moment from 'moment';
import { BookingCallModel } from '../models/bookCalls'
import { UserModel } from "../models/userModels";
import { formatTimeWithPeriod } from "../utils/timeFormat";
import { CallBookingOrders } from "../models/myOrders";
// import { create } from "domain";

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


export const user_call_bookings = async (req: any, res: Response,next:any) => {
  try {
    let { username, password, createrName, createrID, rating, profileImage, date, pricePerDuration, timeslots } = req.body;
    const user = await UserModel.findOne({ username, password });
    if (user) {

      let userdata = await BookingCallModel.findOne({ username, createrName, createrID, date })

      if (!userdata) {
        let userData = {
          username,
          createrName,
          createrID,
          rating,
          profileImage,
          pricePerDuration,
          timeslots,
          callAbout: req.body.callAbout || "",
          date: date,
          isUpdated: 1,            //user creates a booking call is 1
          dateTime: moment().format("DD/MM/YYYY HH:mm"),
        };

        let result:any = await BookingCallModel.create(userData);
         if (result) {
          req.booking = result; // Pass booking data to next middleware
           next(); 
        } else {
          res.status(500).send({ StatusCode: 500, Message: "Failed to create booking call!" });
        }
       } else {
        const booking: any = await BookingCallModel.findOne({ username, createrName, createrID, date });

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
            const updatedResult = await BookingCallModel.updateOne({ username, createrID, date }, {
              $set: {
                dateTime: moment().format("DD/MM/YYYY HH:mm"),
                rating,
                isUpdated: 2,  //user updated time slot is 2
                timeslots, // Update the entire timeslots object
              },
            }
            );

            if (updatedResult.modifiedCount > 0) {
              req.booking = await BookingCallModel.findOne({ username, createrID }).sort({ createdAt: -1 });
             next(); 

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
    } else {
      res.status(404).send({ StatusCode: 404, Message: "User not found!" });
    }
  } catch (error: any) {
    res.status(500).send({ StatusCode: 500, Message: `INTERNAL ERROR : ${error}` })
  }
}


export const calculation_billing = async (req: any,res: Response) => {
try {
  const booking:any = req.booking;
  // const booking: any = await BookingCallModel.findOne({ username, createrID }).sort({ createdAt: -1 });

  //             if (!booking) {
  //               res.status(404).send({ StatusCode: 404, Message: "Booking not found!" });
  //             }
              let basePrice = 0;
              let totalDuration = 0;
              let timeslotStart = "";
              let timeslotEnd = "";
              let timeslotStartPeriod = "";
              let timeslotEndPeriod = "";
              booking?.pricePerDuration.forEach((duration: any) => {
                if (duration.isBooked) {
                  basePrice += parseFloat(duration.amount.replace("$", ""));
                }
              });
              console.log(basePrice, "basePrice")

              const periods = ["morning", "afternoon", "evening"];
              for (const period of periods) {
                const timeSlots: any = booking?.timeslots?.[period];
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


              const hours = Math.floor(totalDuration / 60);
              const minutes = totalDuration % 60;
              const Duration = `${hours} hour${hours !== 1 ? "s" : ""}${minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? "s" : ""}` : ""}`;
              const formattedStart = timeslotStart ? formatTimeWithPeriod(timeslotStart, timeslotStartPeriod) : "N/A";
              const formattedEnd = timeslotEnd ? formatTimeWithPeriod(timeslotEnd, timeslotEndPeriod) : "N/A";
              const platformCharges = 12;
              const salesTax = 12;
              const base = basePrice * totalDuration
              const total = base + platformCharges + salesTax;
              console.log(total)
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
  let { createrID, createrName } = req.body;
  try {
    BookingCallModel.findOne({ createrID, createrName }).then(data => {
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
    const { username } = req.body;
    const data = await CallBookingOrders.findOne({ username });
    const bookedDetails: any = await BookingCallModel.find({ username });
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
    res.status(200).send({ StatusCode: 200, Message: "Booked Details Fetched", bookedData })
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



