import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({

    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'skill'
    },

    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'request'
    },

    reason: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 300
    },

    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Rejected'],
        default: 'Pending'
    }

}, {
    timestamps: true
});

export const ReportModel = mongoose.model('report', reportSchema);
