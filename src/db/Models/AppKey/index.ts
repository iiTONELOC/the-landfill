import * as bcrypt from 'bcrypt';
import {Schema, model} from 'mongoose';
import {IDeviceKey, IDeviceKeyModel, IDeviceKeyMethods} from '../../types';

// never rely on the hardcoded value!, it isn't secure and it is not even used in testing
const defaultPepper = 'aD*ex5898#!l;';
// istanbul ignore next
const pepper: string = process.env.PEPPER ?? defaultPepper;
// istanbul ignore next
const saltRounds: string = process.env.SALT_FACTOR ?? '10';

const THIRTY_DAYS_IN_MS = 2592000000;

const appKeySchema = new Schema<IDeviceKey, IDeviceKeyModel, IDeviceKeyMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      //must be a valid UUID4
      // regex to match UUID v4 string
      match: [/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/, 'Please enter a valid device key!'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // time in seconds until the API key expires
      // keys should be valid for 30 days
      expires: THIRTY_DAYS_IN_MS / 1000,
    },
  },
  {
    timestamps: false,
    id: false,
  },
);

// hash the key before saving it to the database
// istanbul ignore next
appKeySchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('key')) {
    this.key = `${pepper}${this.key}`;
    this.key = await bcrypt.hash(this.key, parseInt(saltRounds, 10));
  }
  next();
});

// compare the key to the hashed key in the database
appKeySchema.method('isCorrectKey', async function (key: string) {
  const isCorrect: boolean = await bcrypt.compare(`${pepper}${key}`, this.key);
  return isCorrect;
});

// determine if the key is expired
appKeySchema.method('isExpired', function () {
  return this.createdAt.getTime() + THIRTY_DAYS_IN_MS < Date.now();
});

export default model<IDeviceKey, IDeviceKeyModel>('AppKey', appKeySchema);
