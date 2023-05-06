import * as bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import { IUser, UserRoles } from '../../types';


// never rely on the hardcoded value!, it isn't secure and it is not even used in testing
const defaultPepper = 'aD*ex5898#!l;';
// istanbul ignore next
const pepper: string = process.env.PEPPER || defaultPepper;

// don't rely on the default salt rounds, use the environment variable
const defaultSaltRounds = '10';
// istanbul ignore next
const saltRounds: string = process.env.SALT_FACTOR || '10';
// istanbul ignore next
if (pepper === defaultPepper) {
    // istanbul ignore next
    console.warn('Using default pepper!\nSet the PEPPER environment variable to a different value to increase security!'); //NOSONAR
}
// istanbul ignore next
if (saltRounds === defaultSaltRounds) {
    // istanbul ignore next
    console.warn('Using default salt rounds!\nSet the SALT_FACTOR environment variable to a different value to increase security!');//NOSONAR
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 20,
        validate: {
            validator: function (username: string) {
                return /^[a-zA-Z0-9]+$/.test(username);
            },
            message: 'Username must only contain letters and numbers!'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid e-mail address!']
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        maxLength: 20
    },
    role: {
        type: String,
        default: UserRoles.BASIC,
        enum: UserRoles
    }
    // When the model is created we need to reference the user's lists
}, {
    id: false,
    timestamps: true
});


// hash the password before saving it to the database
// istanbul ignore next
UserSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        // validate that the password has at least one of the following:
        // uppercase letter, lowercase letter, number, special character
        // if not, throw a validation error
        if (!/[A-Z]/.test(this.password) ||
            !/[a-z]/.test(this.password) ||
            !/\d/.test(this.password) ||
            !/[!@#$%^&*]/.test(this.password)) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!');
        }

        this.password = `${pepper}${this.password}`;
        this.password = await bcrypt.hash(this.password, parseInt(saltRounds, 10));
    }
    next();
});

// compare the password to the hashed password in the database
UserSchema.methods.isCorrectPassword = async function (password: string) {
    const isCorrect = await bcrypt.compare(`${pepper}${password}`, this.password);
    return isCorrect;
};

export default model<IUser>('User', UserSchema);
