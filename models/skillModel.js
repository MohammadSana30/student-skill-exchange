import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({

    skillName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },

    proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    active: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

export const SkillModel = mongoose.model('skill', skillSchema);