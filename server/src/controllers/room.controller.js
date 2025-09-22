import USER from "../model/user.model.js";
import ROOM from "../model/room.model.js";
import "../model/room.model.js"


export const getRoomforUser = async (req , res ) => {
     
    try {
        
        const userId = req.userId ; 
           
        console.log(userId) ; 

        const user = await USER.findById(userId)
                                               .populate("roomCreatedByMe") 
                                               .populate("roomJoinedByMe") ;



      return res
                 .status(200)
                 .json({
                  success: true,
                  message: "Rooms fetched successfully",
                  rooms: {
                     created: user.roomCreatedByMe,
                     joined: user.roomJoinedByMe,
                      },
    });
  
    }
    
    catch (error) {
  
         console.error( "Error in getRoomsForUser:", error);
         
         res
            .status(500)
            .json({
             success: false,
             message: "Server error while fetching rooms",
             });
  }
}

export const createRoom = async (req, res) => {
 
 
  try {
    const { language, roomName } = req.body;
    const userId = req.userId;

    if (!language || !roomName)
       {
        return res
                  .status(400)
                  .json({
                   success: false,
                  message: "Language and roomName are required",
      });
    }

    const user = await USER.findById(userId);
   
    if (!user)
       {
      return res
              .status(404)
              .json({
           success: false,
          message: "User not found",
      });
    }

    const newRoom = new ROOM({
      language,
      roomName,
      admin: {
        id: user._id,
        userName: user.username,
      },
      participants: [
        {
          id: user._id,
          userName: user.username,
        },
      ],
    });

    user.roomCreatedByMe.push(newRoom._id);

    await newRoom.save();
    await user.save();

    res
       .status(201)
       .json({
      success: true,
      message: "Room created successfully",
      room: newRoom,
    });


  } 
  
  catch (error) {
    
    console.error("Error creating room:", error);
 
    res
       .status(500)
       .json({
      success: false,
      message: "Server error while creating room",
     });
  }
};


export const joinRoom = async (req , res ) => {
    try {
       
       const {roomCode} = req.params ; 

       if(!roomCode)
       {
        return res 
                  .status(400)
                  .json({
                     success : false , 
                     message : "RoomCode is required ..."
                  })
       }

       const userId = req.userId;  
     
       const user = await USER.findById(userId); 

       if(!user)
       {
        return res
                  .status(404)
                  .json({
                      success: false,
                    message: "Room not found",
                    });
       }
       
         const room = await ROOM.findOne({ roomCode });

         if(!room)
         {
           return res
                     .status(404)
                     .json({
                      success : false ,
                      message : "Room not found" 
                      })
         }


         const isAlreadyJoined = room.participants.some(
          (p) => p.id.toString() === user._id.toString() 
         )

         if(!isAlreadyJoined)
         {
           room.participants.push({
              id : user._id ,
              userName : user.username  
            })


            user.roomJoinedByMe.push(room._id) ; 
            
            await room.save() ; 
            await user.save() ; 
          
          }

           return res
                     .status(200)
                     .json({
                         success: true,
                          message: "Joined room successfully",
                           room,
    });

  
    } 
    
  catch (error)
   {
    console.error("Error in joinRoom:", error);
    res 
        .status(500)
         .json({
             success: false,
              message: "Server error while joining room",
              });
  }
};


export const leaveRoom = async (req , res ) => {
              
  try {
     
     const {roomCode} = req.params ; 

     const room = await ROOM.findOne({roomCode}) ; 

     if(!room)
     {
      return res
                 .status(404)
                 .json({
                  success : false , 
                  message : "Room not found "
                 })
                
     }

     room.participants = room.participants.filter( p => p.id.toString() !== req.userId) ; 
     await room.save();

       const user = await USER.findById(req.userId) ; 
       user.roomJoinedByMe = user.roomJoinedByMe.filter(r => r.toString() !== room._id.toString());
       await user.save();


       res
          .status(200)
          .json({ 
            success: true,
             message: "Left the room successfully" 
            });


  } 
  
  catch (error) {
     console.error("Error in LeaveRoom :", error);
        res 
          .status(500)
         .json({
             success: false,
              message: "Server error while leaving room",
             });
  }
} ;

export const getRoomById = async (req , res) => {
        
  try {
    
     const {roomId} = req.params ; 

     if(!roomId)
      {
      return res
                .status(400)
                .json({
                  success: false,
                 message: "Room ID is required",
                 });
      }
       
      const room = await ROOM.findById(roomId) 
                                              .populate("participants.id", "username email")   
                                                              

        if(!room)
          {
            return res
                      .status(400)
                      .json({
                       success : false , 
                       message : "Room not found"
                      })
          }


          res
             .status(200)
             .json({
               success : "true" ,
               message : "Room fetched successfully" ,
               room 
             })


  } 
  catch (error)
  {
    console.error("Error in getRoomById:", error);
         res
            .status(500)
            .json({
              success: false,
              message: "Server error while fetching room",
    });
  }
} ;