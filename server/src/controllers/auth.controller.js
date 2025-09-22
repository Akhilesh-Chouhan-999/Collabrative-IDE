import bcrypt from "bcryptjs";
import USER from "../model/user.model.js";

export const authRegister = async (req, res) => {

  try {

    const { username, email, password } = req.body;

    if (!username || !email || !password)
       {
      return res
        .status(422)
        .json({
          success: false,
          message: "Please fill all required fields",
        });
    }

    const userExists = await USER.findOne({ email });

    if (userExists) {
      return res
        .status(422)
        .json({
          success: false,
          message: "User with same email already exists",
        });
    }

    const user = new USER({ username, email, password });


    await user.save();

    console.log("User Registered Successfully ");


    return res.
      status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },

      });


  }

  catch (error) {
    console.error("Error in authRegister:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error during registration",
      });
  }
};

export const authLogin = async (req, res) => {

  try {

    const { username , password } = req.body;

    if (!username || !password) {
      return res
        .status(422)
        .json({ message: "Please fill the required fields" });
    }

    const userExists = await USER.findOne({ username });

    if (!userExists) {
      return res
        .status(422)
        .json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({
          error: "Invalid credentials"
        });
    }

    const token = await userExists.generateAuthToken();

    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true
      });

    res
      .status(200)
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          id: userExists._id,
          username: userExists.username,
          email: userExists.email
        },
        token
      });

  }
  catch (error) {
    console.error("Error in authLogin: ", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error during login"
      });
  }
};

export const authLogout = async (req , res) => {
    
  try {
    res.clearCookie("token", {
      httpOnly: true,
      path : '/' ,
      sameSite: "strict"
    });

    return res
               .status(200)
               .json({ 
                 success: true, 
                 message: "Logged out successfully" 
                 });


  } 
  
  catch (error) 
  {
    console.error("Error in logout: ", error);

    res
       .status(500)
       .json({ 
        success: false, 
        message: "Server error during logout" 
    });
  }
}

