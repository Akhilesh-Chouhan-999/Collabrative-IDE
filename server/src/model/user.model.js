import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
const { Schema } = mongoose;

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    roomJoinedByMe: [
        {
            type: Schema.Types.ObjectId,
            ref: "ROOM",
        }
    ],

    roomCreatedByMe: [
        {
            type: Schema.Types.ObjectId,
            ref: "ROOM",
        }
    ],

    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]

},
    {
        timestamps: true
    });



userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

userSchema.methods.generateAuthToken = async function () {
    try {
        let currToken = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
        this.tokens = this.tokens.concat({ token: currToken });
        await this.save();
        return currToken;
    }
    catch (error) {
        console.log(error);
    }
}


const USER = mongoose.model("USER", userSchema);
export default USER;