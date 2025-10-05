import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const roomSchema = new mongoose.Schema(
  {

    language: 
    {
      type: String,
      required: true,
    },

     roomName:
      {
      type: String,
      required: true,
    },

    roomCode:
     {
      type: String,
      unique: true,
      default: () => uuidv4(),   
    },

    admin: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
      },
      userName: {
        type: String,
        required: true,
      },
    },

    time1: {
      type: Date,
      default: Date.now,
    },

    participants: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "USER" },
        userName: String,
      },
    ],

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MESSAGE",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ROOM = mongoose.model("ROOM", roomSchema);
export default ROOM;
