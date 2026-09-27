
import { model, Schema } from "mongoose";

const sessionSchema = new Schema ({
  userId: {
    type: Schema.Types.ObjectId,
    require: true
  },
  accessToken: {
    type: String,
    require: true
  },
  refreshToken: {
    type: String,
    require: true
  },
  accessTokenValidUntil: {
    type: Date,
    require: true
  },
  refreshTokenValidUntil: {
    type: Date,
    require: true
  },


}, {timestamps: true});

export const Session = model("Session", sessionSchema);
