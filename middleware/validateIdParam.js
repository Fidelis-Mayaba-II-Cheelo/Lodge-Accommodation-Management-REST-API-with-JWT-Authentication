import {param, validationResult} from 'express-validator';

/**
 * Factory that returns a reusable middleware for any `:id` param.
 * @param {string} paramName - Name of the URL param, e.g. 'student_id'
 * @returns express middleware array
 */

const validateIdParam = (paramName) => [
    param(paramName)
        .toInt().isInt().withMessage(`${paramName} must be an integer`),

    (req, res, next) => {
         const errors = validationResult(req);
         if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
         next();
    },
];

export {validateIdParam};