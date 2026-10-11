import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {

    try {

        const token = req.cookies.token;

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Please login first"
            });

        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }

}