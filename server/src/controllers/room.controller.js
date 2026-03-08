import USER from "../model/user.model.js";
import ROOM from "../model/room.model.js";
import MESSAGE from "../model/message.model.js";


export const getRoomforUser = async (req, res) => {

  try {

    const userId = req.userId;

    console.log(userId);

    const user = await USER.findById(userId)
      .populate("roomCreatedByMe")
      .populate("roomJoinedByMe");



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

    console.error("Error in getRoomsForUser:", error);

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

    if (!language || !roomName) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Language and roomName are required",
        });
    }

    const user = await USER.findById(userId);

    if (!user) {
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


export const joinRoom = async (req, res) => {
  try {

    const { roomCode } = req.params;

    if (!roomCode) {
      return res
        .status(400)
        .json({
          success: false,
          message: "RoomCode is required ..."
        })
    }

    const userId = req.userId;

    const user = await USER.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Room not found",
        });
    }

    const room = await ROOM.findOne({ roomCode });

    if (!room) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Room not found"
        })
    }


    const isAlreadyJoined = room.participants.some(
      (p) => p.id.toString() === user._id.toString()
    )

    if (!isAlreadyJoined) {
      room.participants.push({
        id: user._id,
        userName: user.username
      })


      user.roomJoinedByMe.push(room._id);

      await room.save();
      await user.save();

    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Joined room successfully",
        room,
      });


  }

  catch (error) {
    console.error("Error in joinRoom:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while joining room",
      });
  }
};


export const leaveRoom = async (req, res) => {

  try {

    const { roomCode } = req.params;

    const room = await ROOM.findOne({ roomCode });

    if (!room) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Room not found "
        })

    }

    room.participants = room.participants.filter(p => p.id.toString() !== req.userId);
    await room.save();

    const user = await USER.findById(req.userId);
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
};

export const getRoomById = async (req, res) => {

  try {

    const { roomId } = req.params;

    if (!roomId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Room ID is required",
        });
    }

    const room = await ROOM.findById(roomId)
      .populate("participants.id", "username email")


    if (!room) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Room not found"
        })
    }


    res
      .status(200)
      .json({
        success: "true",
        message: "Room fetched successfully",
        room
      })


  }
  catch (error) {
    console.error("Error in getRoomById:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching room",
      });
  }
};

// Delete a room (admin only)
export const deleteRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.userId;

    const room = await ROOM.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Only admin can delete
    if (room.admin.id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the room admin can delete this room",
      });
    }

    // Remove room reference from all participants
    const participantIds = room.participants.map((p) => p.id);
    await USER.updateMany(
      { _id: { $in: participantIds } },
      {
        $pull: {
          roomCreatedByMe: room._id,
          roomJoinedByMe: room._id,
        },
      }
    );

    // Delete all messages in the room
    await MESSAGE.deleteMany({ _id: { $in: room.messages } });

    // Delete the room
    await ROOM.findByIdAndDelete(room._id);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteRoom:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting room",
    });
  }
};

// Save a message to a room
export const saveMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    const user = await USER.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const room = await ROOM.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const message = new MESSAGE({
      text,
      author: {
        id: user._id,
        userName: user.username,
      },
    });

    await message.save();
    room.messages.push(message._id);
    await room.save();

    res.status(201).json({
      success: true,
      message: message,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ success: false, message: "Server error saving message" });
  }
};

// Get messages for a room
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ROOM.findById(roomId).populate("messages");

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      messages: room.messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error fetching messages" });
  }
};