import jwt from 'jsonwebtoken';
import USER from '../model/user.model.js';

export const authenticate = async (req, res, next) => {

  const token = req.cookies.token;

  if (!token)
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized - no token provided"
      });


  try {

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const rootUser = await USER.findOne({
      _id: decode._id,
      "tokens.token": token,
    })

    if (!rootUser) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized - invalid token or user not found",
        });
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;

    next();

  }
  catch (error) {

    console.error("Error in authenticate middleware:", error);

    res
      .status(500)
      .json({
        success: false,
        message: "Server error during authentication",
      });
  }
}