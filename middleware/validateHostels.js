import path from 'path';
//NOTE:
/*Validation logic for deleting the hostel is done by the beforeHostelDelete trigger*/

//Validation logic for adding and updating hostels
import {body, validationResult} from 'express-validator';

const baseChecks = [
    // Hostel name must exist and not be empty
    body('hostel_name')
        .trim().escape().notEmpty().withMessage('Hostel Name is required')
        .isLength({max : 255}).withMessage('Hostel name is too long'),

    // Number of rooms must be an integer greater than 0
    body('number_of_rooms')
        .notEmpty().withMessage('Number of rooms is required')
        .toInt().isInt({min: 1}).withMessage('Number of rooms must be greater than 0'),

    // Hostel status must exist
    body('hostel_status')
        .notEmpty().withMessage('No hostel status provided. Please provide a valid status.')
        .toInt().isInt({min:0, max:1}).withMessage('Invalid hostel status.'),

    //Hostel type must exist
    body('hostel_type')
        .trim().escape().notEmpty().withMessage('Hostel type is required')
        .isIn(['Single', 'Double', 'Triple', 'Quadruple']).withMessage('Invalid Hostel type'),

    // Price per month must be a number > 0
    body('hostel_accommodation_price_per_month')
        .notEmpty().withMessage('Hostel accommodation price per month is required')
        .toInt().isInt({min: 1}).withMessage('Accommodation price per month must be greater than 0.'),

    // Admin ID must be an integer
    body('maya_hostels_admin_id')
        .notEmpty().withMessage('Admin id is required')
        .toInt().isInt().withMessage('Please provide a valid admin ID.'),
];

const validateAddHostels = [
    ...baseChecks,

    /* registers a validation rule for that field and stores the result internally on the req object.*/
    //The semester must be 1 or 2
    body('semester')
        .notEmpty().withMessage('Semester number is required')
        .toInt().isInt({ min: 1, max: 2 }).withMessage('Semester must be either 1 or 2.'),


    (req, res, next) => {
    //collects all the rules’ results for this request. validationResult(req) then:
        /*It checks all the validation chains you defined.It looks for any failed rules. It bundles them into an errors object.*/
         const errors = validationResult(req);
         //If there are any errors, you must return a response as an array (array of all errors)
         if(!errors.isEmpty()){
              return res.status(400).json({errors: errors.array()});
         }
         next();
    },
]

const validateUpdateHostels = [
    ...baseChecks,

    body('hostel_capacity')
        .notEmpty().withMessage('Hostel capacity is required')
        .toInt().isInt({min:1}).withMessage('Hostel capacity must be greater than 0'),

    body('number_of_bedspaces_per_room')
        .notEmpty().withMessage('Number of bedspaces per room is required')
        .toInt().isInt({min:1}).withMessage('Number of bedspaces per room must be greater than 0'),

    body('hostel_accommodation_price_per_semester')
        .notEmpty().withMessage('Hostel accommodation price per semester is required')
        .toInt().isInt({min:1}).withMessage('Hostel capacity must be greater than 0'),

    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        next();
    },
]


export{
    validateAddHostels,
    validateUpdateHostels
};