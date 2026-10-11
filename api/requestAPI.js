import exp from 'express';

import {RequestModel} from "../models/requestModel.js";
import {SkillModel} from "../models/skillModel.js";
import {ReportModel} from "../models/reportModel.js";

import {verifyToken} from "../middleware/authMiddleware.js";

export const requestRouter = exp.Router();


// ================= CREATE REQUEST =================

requestRouter.post('/', verifyToken, async (req, res, next) => {

    try {

        const {
            title,
            description,
            skill
        } = req.body;


        if (!title || !description || !skill) {

            return res.status(400).json({
                success: false,
                message: "Title, description and skill are required"
            });

        }


        const skillExists = await SkillModel.findOne({

            _id: skill,
            active: true

        });


        if (!skillExists) {

            return res.status(404).json({
                success: false,
                message: "Skill not found or inactive"
            });

        }


        const request = await RequestModel.create({

            title,
            description,
            skill,
            requester: req.user.userId

        });


        res.status(201).json({

            success: true,

            message: "Help request created successfully",

            request

        });

    } catch (err) {

        next(err);

    }

});


// ================= GET ALL REQUESTS =================

requestRouter.get('/', async (req, res, next) => {

    try {

        const requests = await RequestModel.find({
            active: true
        })
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


// ================= GET MY REQUESTS =================

requestRouter.get('/my', verifyToken, async (req, res, next) => {

    try {

        const requests = await RequestModel.find({

            requester: req.user.userId

        })
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


// ================= GET ONE REQUEST =================

requestRouter.get('/:id', async (req, res, next) => {

    try {

        const request = await RequestModel.findById(req.params.id)

            .populate('requester', 'name email')

            .populate('skill', 'skillName proficiency');


        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found"
            });

        }


        if (!request.active) {

            return res.status(404).json({
                success: false,
                message: "Request is not available"
            });

        }


        res.status(200).json({

            success: true,
            request

        });

    } catch (err) {

        next(err);

    }

});


// ================= UPDATE OWN REQUEST =================

requestRouter.put('/:id', verifyToken, async (req, res, next) => {

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


        if (
            request.requester.toString()
            !== req.user.userId
        ) {

            return res.status(403).json({
                success: false,
                message: "You can update only your own request"
            });

        }


        if (req.body.title !== undefined) {

            request.title = req.body.title;

        }


        if (req.body.description !== undefined) {

            request.description = req.body.description;

        }


        if (req.body.status !== undefined) {

            request.status = req.body.status;

        }


        await request.save();


        res.status(200).json({

            success: true,

            message: "Request updated successfully",

            request

        });

    } catch (err) {

        next(err);

    }

});


// ================= DELETE OWN REQUEST =================

requestRouter.delete('/:id', verifyToken, async (req, res, next) => {

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


        if (
            request.requester.toString()
            !== req.user.userId
        ) {

            return res.status(403).json({
                success: false,
                message: "You can delete only your own request"
            });

        }


        await request.deleteOne();


        res.status(200).json({

            success: true,
            message: "Request deleted successfully"

        });

    } catch (err) {

        next(err);

    }

});


// ================= REPORT REQUEST =================

requestRouter.post('/:id/report', verifyToken, async (req, res, next) => {

    try {

        const {reason} = req.body;


        if (!reason) {

            return res.status(400).json({
                success: false,
                message: "Report reason is required"
            });

        }


        const request = await RequestModel.findById(
            req.params.id
        );


        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found"
            });

        }


        const report = await ReportModel.create({

            reporter: req.user.userId,

            request: request._id,

            reason

        });


        res.status(201).json({

            success: true,

            message: "Request reported successfully",

            report

        });

    } catch (err) {

        next(err);

    }

});