import mongoose from 'mongoose';

const AllRooms = new mongoose.Schema({
    allrooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ROOM"
        }
    ]
});

const AllROOMS = mongoose.model("ALLROOMS", AllRooms);
export default AllROOMS; 