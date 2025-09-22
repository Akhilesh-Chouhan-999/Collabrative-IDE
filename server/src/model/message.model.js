import mongoose from "mongoose";


const messageSchema = mongoose.Schema({
    text:
    {
        type: String,
        required: true,
    },

    time1: {
        type: Date,
        default: new Date().toISOString().slice(0, 10)
    },

    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER"
        },
        userName: String
    },

});


const MESSAGE = mongoose.model("MESSAGE", messageSchema);
export default MESSAGE; 