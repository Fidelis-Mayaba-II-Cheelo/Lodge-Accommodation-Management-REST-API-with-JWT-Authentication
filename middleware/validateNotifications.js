import {body, validationResult} from "express-validator";

const baseChecks = [
    body('notification_message')
        .trim().escape().notEmpty().withMessage('Notification message is required')
        .isLength({min: 5, max: 255}).withMessage('Notification message must be at least 5 characters long but not more than 255 characters'),

    body('maya_hostels_admin_id')
        .toInt().isInt().withMessage('Admin ID must be an integer')
        .notEmpty().withMessage('Admin ID is required')
];

const validateNotificationToSingleStudent = [
    ...baseChecks,
    body('maya_hostels_student_id')
        .toInt().isInt().withMessage('Student ID must be an integer')
        .notEmpty().withMessage('Student ID is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

const validateNotificationToAllStudents = [
    ...baseChecks,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

export {validateNotificationToAllStudents, validateNotificationToSingleStudent};