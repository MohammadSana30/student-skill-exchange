import exp from 'express';

import {UserModel} from "../models/userModel.js";
import {SkillModel} from "../models/skillModel.js";
import {RequestModel} from "../models/requestModel.js";
import {ReportModel} from "../models/reportModel.js";

import {verifyToken} from "../middleware/authMiddleware.js";
import {checkAdmin} from "../middleware/roleMiddleware.js";

export const adminRouter = exp.Router();


// Every route in this file requires login
adminRouter.use(verifyToken);


// Every route in this file requires admin
adminRouter.use(checkAdmin);


// ================= GET ALL USERS =================

adminRouter.get('/users', async (req, res, next) => {

    try {

        const users = await UserModel.find()
            .select('-password')
            .sort({createdAt: -1});


        res.status(200).json({

            success: true,
            count: users.length,
            users

        });

    } catch (err) {

        next(err);

    }

});


// ================= GET ALL SKILLS =================

adminRouter.get('/skills', async (req, res, next) => {

    try {

        const skills = await SkillModel.find()
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


// ================= GET ALL REQUESTS =================

adminRouter.get('/requests', async (req, res, next) => {

    try {

        const requests = await RequestModel.find()
            .populate('requester', 'name email')
            .populate('skill', 'skillName proficiency')
            .sort({createdAt: -1});


        res.status(200).json({

            success: true,
            count: requests.length,
            requests

        });

    } catch (err) {

        next(err);

    }

});


// ================= GET ALL REPORTS =================

adminRouter.get('/reports', async (req, res, next) => {

    try {

        const reports = await ReportModel.find()

            .populate('reporter', 'name email')

            .populate('skill')

            .populate('request')

            .sort({createdAt: -1});


        res.status(200).json({

            success: true,
            count: reports.length,
            reports

        });

    } catch (err) {

        next(err);

    }

});


// ================= DEACTIVATE USER =================

adminRouter.patch('/users/:id/deactivate', async (req, res, next) => {

    try {

        const user = await UserModel.findById(req.params.id);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        user.active = false;

        await user.save();


        res.status(200).json({

            success: true,
            message: "User deactivated successfully"

        });

    } catch (err) {

        next(err);

    }

});


// ================= ACTIVATE USER =================

adminRouter.patch('/users/:id/activate', async (req, res, next) => {

    try {

        const user = await UserModel.findById(req.params.id);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        user.active = true;

        await user.save();


        res.status(200).json({

            success: true,
            message: "User activated successfully"

        });

    } catch (err) {

        next(err);

    }

});


// ================= DEACTIVATE SKILL =================

adminRouter.patch('/skills/:id/deactivate', async (req, res, next) => {

    try {

        const skill = await SkillModel.findById(
            req.params.id
        );


        if (!skill) {

            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });

        }


        skill.active = false;

        await skill.save();


        res.status(200).json({

            success: true,
            message: "Skill deactivated successfully"

        });

    } catch (err) {

        next(err);

    }

});


// ================= ACTIVATE SKILL =================

adminRouter.patch('/skills/:id/activate', async (req, res, next) => {

    try {

        const skill = await SkillModel.findById(
            req.params.id
        );


        if (!skill) {

            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });

        }


        skill.active = true;

        await skill.save();


        res.status(200).json({

            success: true,
            message: "Skill activated successfully"

        });

    } catch (err) {

        next(err);

    }

});


// ================= DELETE SKILL =================

adminRouter.delete('/skills/:id', async (req, res, next) => {

    try {

        const skill = await SkillModel.findById(
            req.params.id
        );


        if (!skill) {

            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });

        }


        await skill.deleteOne();


        res.status(200).json({

            success: true,
            message: "Skill deleted by admin"

        });

    } catch (err) {

        next(err);

    }

});


// ================= DEACTIVATE REQUEST =================

adminRouter.patch('/requests/:id/deactivate', async (req, res, next) => {

    try {

        const request = await RequestModel.findById(
            req.params.id
        );


        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found"
            });

        }


        request.active = false;

        await request.save();


        res.status(200).json({

            success: true,
            message: "Request deactivated successfully"

        });

    } catch (err) {

        next(err);

    }

});


// ================= ACTIVATE REQUEST =================

adminRouter.patch('/requests/:id/activate', async (req, res, next) => {

    try {

        const request = await RequestModel.findById(
            req.params.id
        );


        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found"
            });

        }


        request.active = true;

        await request.save();


        res.status(200).json({

            success: true,
            message: "Request activated successfully"

        });

    } catch (err) {

        next(err);

    }

});


// ================= DELETE REQUEST =================

adminRouter.delete('/requests/:id', async (req, res, next) => {

    try {

        const request = await RequestModel.findById(
            req.params.id
        );


        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found"
            });

        }


        await request.deleteOne();


        res.status(200).json({

            success: true,
            message: "Request deleted by admin"

        });

    } catch (err) {

        next(err);

    }

});


// ================= REVIEW REPORT =================

adminRouter.patch('/reports/:id/review', async (req, res, next) => {

    try {

        const report = await ReportModel.findById(
            req.params.id
        );


        if (!report) {

            return res.status(404).json({
                success: false,
                message: "Report not found"
            });

        }


        report.status = 'Reviewed';

        await report.save();


        res.status(200).json({

            success: true,
            message: "Report marked as reviewed",
            report

        });

    } catch (err) {

        next(err);

    }

});


// ================= REJECT REPORT =================

adminRouter.patch('/reports/:id/reject', async (req, res, next) => {

    try {

        const report = await ReportModel.findById(
            req.params.id
        );


        if (!report) {

            return res.status(404).json({
                success: false,
                message: "Report not found"
            });

        }


        report.status = 'Rejected';

        await report.save();


        res.status(200).json({

            success: true,
            message: "Report rejected",
            report

        });

    } catch (err) {

        next(err);

    }

});