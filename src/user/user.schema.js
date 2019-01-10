import mongoose from 'mongoose';
import shortid from 'shortid';

const { Schema } = mongoose;

const TABLENAME = 'Users';

const UserSchema = new Schema({
  sId: {
    type: String,
    default: shortid.generate,
    index: true
  },
  cognitoId: {
    type: String,
    index: true
  }
}, { timestamps: true });

export default mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, UserSchema);
