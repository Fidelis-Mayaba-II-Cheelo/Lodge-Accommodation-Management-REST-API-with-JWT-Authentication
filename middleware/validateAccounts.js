import {body, validationResult} from 'express-validator';

const validateRegister = [
    // ✅ Always required fields
    body('role')
        .trim().escape().notEmpty().withMessage('User role is required')
        .isIn(['admin', 'student']).withMessage('Role must be admin or student'),

    body('account_type')
        .trim().escape().notEmpty().withMessage('Account type is required')
        .isIn(['Admin', 'Student']).withMessage('Invalid account type'),

    body('account_password')
        .trim().escape().notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

    body('email_address')
        .isEmail().withMessage('Must be a valid email')
        .normalizeEmail(),

    body('email_type')
        .trim().escape().notEmpty().withMessage('Email type is required')
        .isIn(['Work', 'Personal', 'Other']).withMessage('Invalid email type'),

    // ✅ Admin only
    body('username')
        .if(body('role').equals('admin'))
        .trim().escape().notEmpty().withMessage('Username is required')
        .isLength({max:50}).withMessage('Admin username is too long'),

    // ✅ Student only
    body('student_name')
        .if(body('role').equals('student'))
        .trim().escape().notEmpty().withMessage('Student name is required')
        .isLength({max:100}).withMessage('Student name is too long'),

    body('student_number')
        .if(body('role').equals('student'))
        .notEmpty().withMessage('Student number is required')
        .isInt().withMessage('Student number must be numeric'),

    body('national_registration_number')
        .if(body('role').equals('student'))
        .notEmpty().withMessage('National Registration Number is required(Enter the digits only)')
        .isInt().withMessage('National Registration Number must be numeric(Enter the digits only)'),

    body('program_of_study')
        .if(body('role').equals('student'))
        .trim().escape().notEmpty().withMessage('Program of study is required')
        .isLength({ max: 255 }).withMessage('Program of study too long'),

    body('year_of_study')
        .if(body('role').equals('student'))
        .notEmpty().withMessage('Year of study is required')
        .isInt({ min: 1, max: 6 }).withMessage('Year of study must be 1-6'),

    body('date_of_birth')
        .if(body('role').equals('student'))
        .notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Date of birth must be YYYY-MM-DD')
        .toDate()
        .custom(value => {
            const today = new Date();
            if (value > today) throw new Error('DOB cannot be in the future');
            if (value.getFullYear() < 1900) throw new Error('DOB year seems invalid');
            return true;
        }),

    body('gender')
        .if(body('role').equals('student'))
        .trim().escape().notEmpty().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),

    body('phone_number')
        .if(body('role').equals('student'))
        .trim().escape().notEmpty().withMessage('Phone number required')
        .isLength({ max: 20 }).withMessage('Phone number too long')
        .isLength({ min: 9 }).withMessage('Phone number must be at least 9 digits'),

    body('phone_number_type')
        .if(body('role').equals('student'))
        .trim().escape().notEmpty().withMessage('Phone number type is required')
        .isIn(['Work', 'Personal', 'Other']).withMessage('Invalid phone type'),


    body('guardian_phone_number')
        .if(body('role').equals('student'))
        .trim().escape().notEmpty().withMessage('Guardian phone number required')
        .isLength({ max: 20 }).withMessage('Guardian phone number too long')
        .isLength({ min: 9 }).withMessage('Phone number must be at least 9 digits'),

    body('guardian_phone_number_type')
        .if(body('role').equals('student'))
        .trim().escape().notEmpty().withMessage('Guardian phone number type is required')
        .isIn(['Work', 'Personal', 'Other']).withMessage('Invalid guardian phone type'),

    // ✅ Final error check
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    }
];

const validateLogin = [
    body('email_address')
        .isEmail().withMessage('Email address is required')
        .normalizeEmail(),

    body('password')
        .trim().escape().notEmpty().withMessage('Password is required'),

    body('role')
        .trim().escape().notEmpty().withMessage('User role is required')
        .isIn(['admin', 'student']).withMessage('Role must be admin or student'),

    (req, res, next) => {
         const errors = validationResult(req);
         if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
         next();
    }
]


export {validateRegister, validateLogin};