import {param, validationResult} from "express-validator";

const validateStringParam = (paramName) => [
    param(paramName)
        .isString().withMessage(`${paramName} must be a string`)
        .trim()
        .notEmpty().withMessage(`${paramName} cannot be empty`),

    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
        next();
    }
]

const validateUUIDParam = (paramName) => [
    param(paramName)
        .isUUID().withMessage(`${paramName} must be a UUID`)
        .trim(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]
export {validateStringParam, validateUUIDParam};