import exp from 'express';

import {SkillModel} from "../models/skillModel.js";
import {ReportModel} from "../models/reportModel.js";

import {verifyToken} from "../middleware/authMiddleware.js";

export const skillRouter = exp.Router();


// ================= CREATE SKILL =================

skillRouter.post('/', verifyToken, async (req, res, next) => {

    try {

        const {
            skillName,
            proficiency,
            description
        } = req.body;

        if (!skillName || !proficiency || !description) {

            return res.status(400).json({
                success: false,
                message: "Skill name, proficiency and description are required"
            });

        }

        const skill = await SkillModel.create({

            skillName,
            proficiency,
            description,
            owner: req.user.userId

        });

        res.status(201).json({

            success: true,

            message: "Skill created successfully",

            skill

        });

    } catch (err) {

        next(err);

    }

});


// ================= GET ALL SKILLS =================

skillRouter.get('/', async (req, res, next) => {

    try {

        const skills = await SkillModel.find({
            active: true
        })
        .populate('owner', 'name email')
        .sort({createdAt: -1});

        res.status(200).json({

            success: true,
            count: skills.length,
            skills

        });

    } catch (err) {

        next(err);

    }

});


// ================= SEARCH / FILTER SKILLS =================

skillRouter.get('/search', async (req, res, next) => {

    try {

        const {
            skillName,
            proficiency
        } = req.query;

        const filter = {
            active: true
        };


        if (skillName) {

            filter.skillName = {
                $regex: skillName,
                $options: 'i'
            };

        }


        if (proficiency) {

            filter.proficiency = proficiency;

        }


        const skills = await SkillModel.find(filter)
            .populate('owner', 'name email')
            .sort({createdAt: -1});


        res.status(200).json({

            success: true,
            count: skills.length,
            skills

        });

    } catch (err) {

        next(err);

    }

});


// ================= GET MY SKILLS =================

skillRouter.get('/my', verifyToken, async (req, res, next) => {

    try {

        const skills = await SkillModel.find({
            owner: req.user.userId
        })
        .sort({createdAt: -1});

        res.status(200).json({

            success: true,
            count: skills.length,
            skills

        });

    } catch (err) {

        next(err);

    }

});


// ================= GET ONE SKILL =================

skillRouter.get('/:id', async (req, res, next) => {

    try {

        const skill = await SkillModel.findById(req.params.id)
            .populate('owner', 'name email');

        if (!skill) {

            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });

        }

        if (!skill.active) {

            return res.status(404).json({
                success: false,
                message: "Skill is not available"
            });

        }

        res.status(200).json({

            success: true,
            skill

        });

    } catch (err) {

        next(err);

    }

});


// ================= UPDATE OWN SKILL =================

skillRouter.put('/:id', verifyToken, async (req, res, next) => {

    try {

        const skill = await SkillModel.findById(req.params.id);

        if (!skill) {

            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });

        }


        if (skill.owner.toString() !== req.user.userId) {

            return res.status(403).json({
                success: false,
                message: "You can update only your own skill"
            });

        }


        if (req.body.skillName !== undefined) {

            skill.skillName = req.body.skillName;

        }


        if (req.body.proficiency !== undefined) {

            skill.proficiency = req.body.proficiency;

        }


        if (req.body.description !== undefined) {

            skill.description = req.body.description;

        }


        await skill.save();


        res.status(200).json({

            success: true,

            message: "Skill updated successfully",

            skill

        });

    } catch (err) {

        next(err);

    }

});


// ================= DELETE OWN SKILL =================

skillRouter.delete('/:id', verifyToken, async (req, res, next) => {

    try {

        const skill = await SkillModel.findById(req.params.id);

        if (!skill) {

            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });

        }


        if (skill.owner.toString() !== req.user.userId) {

            return res.status(403).json({
                success: false,
                message: "You can delete only your own skill"
            });

        }


        await skill.deleteOne();


        res.status(200).json({

            success: true,
            message: "Skill deleted successfully"

        });

    } catch (err) {

        next(err);

    }

});


// ================= REPORT SKILL =================

skillRouter.post('/:id/report', verifyToken, async (req, res, next) => {

    try {

        const {reason} = req.body;

        if (!reason) {

            return res.status(400).json({
                success: false,
                message: "Report reason is required"
            });

        }


        const skill = await SkillModel.findById(req.params.id);

        if (!skill) {

            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });

        }


        const report = await ReportModel.create({

            reporter: req.user.userId,

            skill: skill._id,

            reason

        });


        res.status(201).json({

            success: true,

            message: "Skill reported successfully",

            report

        });

    } catch (err) {

        next(err);

    }

});