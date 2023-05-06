import { Schema, model } from 'mongoose';
import { ISource, AvailableSources } from '../../types';

const SourceSchema = new Schema<ISource>({
    name: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        enum: AvailableSources
    },
    urlToSearchResult: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        validate: {
            validator: function (url: string) {
                return /^(https?:\/\/)?[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*$/.test(url);
            },
            message: 'Please provide a valid url!'
        }
    }
}, {
    id: false,
    timestamps: true
});

SourceSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('urlToSearchResult')) {
        // if there is a urlToSearchResult, enforce https if it is not already
        // if http add an s, if no protocol add https://
        if (this.urlToSearchResult) {
            if (this.urlToSearchResult.startsWith('http://')) {
                this.urlToSearchResult = this.urlToSearchResult.replace('http://', 'https://');
            }

            // if there is no protocol, add https://
            if (!this.urlToSearchResult.startsWith('https://')) {
                this.urlToSearchResult = `https://${this.urlToSearchResult}`;
            }
        }

        this.urlToSearchResult = this.urlToSearchResult || undefined;
    }

    next();
});

export default model<ISource>('Source', SourceSchema);
