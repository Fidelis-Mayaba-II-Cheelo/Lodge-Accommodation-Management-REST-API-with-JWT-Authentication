import db from '../models/db.js'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

//Generate the Access Token(Short-lived)
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}

//Generate the Refresh Token(Long-lived)
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}

//@desc register an account
//@route POST /api/accounts/register
const register = async (req, res) => {
    const {role, account_type, account_password, username, email_address, email_type, student_name, student_number,
        national_registration_number, program_of_study, year_of_study, date_of_birth,
        profile_picture, gender, phone_number, phone_number_type,
        guardian_phone_number, guardian_phone_number_type
    } = req.body;

    try{
        if(role === 'admin'){
            //Check if the admin already exists
            const adminExists = await db.query(`SELECT 1 FROM admin_email_addresses WHERE email_address = $1`,[email_address]);

            if(adminExists.rows.length > 0){
                return res.status(400).json({message: `Admin already exists`});
            }

            //Hashing the admin's password
            const adminHashedPassword = await bcrypt.hash(account_password, 10);

            //Creating the admin
            const admin = await db.query(`INSERT INTO admin (username) VALUES ($1) RETURNING maya_hostels_admin_id`, [username]);

            //Getting the maya_hostels_admin_id from the admin variable (We did this by RETURNING maya_hostels_admin_id)
            const adminId = admin.rows[0].maya_hostels_admin_id;

            //Inserting the admin's email in the admin_email_addresses table
            await db.query(`INSERT INTO admin_email_addresses (maya_hostels_admin_id, email_address, email_type) VALUES ($1, $2)`, [adminId, email_address, email_type]);

            //Inserting the admin's password and account details in the account table
            await db.query(`INSERT INTO accounts (account_type, account_password, password_status, hash_algorithm, maya_hostels_admin_id) VALUES ($1, $2, 'Active', 'bcrypt', $3)`, [account_type, adminHashedPassword, adminId]);


            return res.status(201).json({message: `Admin account successfully registered`});

        }

        if(role === 'student'){
            //Check if the student already exists
            const studentExists = await db.query(`SELECT 1 FROM student_email_addresses WHERE email_address = $1`,[email_address]);

            if(studentExists.rows.length > 0){
                return res.status(400).json({message: `Student already exists`});
            }

            //Hash the student's password
            const studentHashedPassword = await bcrypt.hash(account_password, 10);

            //Creating the student
            const student = await db.query(`INSERT INTO students (student_name, student_number, national_registration_number, program_of_study, year_of_study, date_of_birth,profile_picture, gender, accommodation_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'None') RETURNING maya_hostels_student_id`, [student_name, student_number,
                national_registration_number, program_of_study, year_of_study, date_of_birth,
                profile_picture, gender]);

            //Getting the maya_hostels_student_id from the student variable (We did this by RETURNING maya_hostels_student_id)
            const studentId = student.rows[0].maya_hostels_student_id;

            //Inserting the student's email in the student_email_addresses table
            await db.query(`INSERT INTO student_email_addresses (maya_hostels_student_id, email_address, email_type) VALUES ($1, $2, $3)`, [studentId, email_address, email_type]);

            //Inserting the student's phone numbers in the student_phone_number table
            await db.query(`INSERT INTO student_phone_numbers (maya_hostels_student_id, phone_number, phone_number_type) VALUES ($1, $2, $3)`, [studentId, phone_number, phone_number_type]);

            //Inserting the student's guardian phone numbers in the guardian_phone_number table
            await db.query(`INSERT INTO student_guardian_phone_numbers (maya_hostels_student_id, guardian_phone_number, guardian_phone_number_type) VALUES ($1, $2, $3)`, [studentId, guardian_phone_number, guardian_phone_number_type]);

            //Inserting the student's password and account details in the account table
            await db.query(`INSERT INTO accounts (account_type, account_password, password_status, hash_algorithm, maya_hostels_student_id) VALUES ($1,$2, 'Active', 'bcrypt', $3)`, [account_type, studentHashedPassword, studentId]);

            return res.status(201).json({message: `Student account successfully registered`});
        }

        return res.status(400).json({ message: 'Invalid role' });

    }catch(error){
        next(error);
        return res.status(500).json({error: `${error}: Failed to register ${role} account.`});
    }

}

//@desc login
//@route POST /api/accounts/login
const login = async (req, res) => {
    const {role, email_address, password} = req.body;

    try{
        let user;
        let payload;

        if(role === 'admin'){
            //Query the database for the admin's id and password
            const result = await db.query(
                `SELECT a.maya_hostels_admin_id, acc.account_password
                FROM admin_email_addresses ae INNER JOIN accounts acc 
                ON ae.maya_hostels_admin_id = acc.maya_hostels_admin_id
                INNER JOIN admin a ON a.maya_hostels_admin_id = ae.maya_hostels_admin_id
                WHERE ae.email_address = $1`, [email_address]
            );

            //Checking the database to see whether the admin exists
            if(result.rows.length === 0){
                return res.status(400).json({message: `Invalid credentials`});
            }

            //Getting the admin's details from the database query and storing them in a variable called user
            user = result.rows[0];

            //Creating the payload, we'll pass it into our jwt.sign() function
            payload = {adminId: user.maya_hostels_admin_id, role: 'admin'};

        } else if (role === 'student'){
            //Query the database for the student's id and password
            const result = await db.query(
                `SELECT s.maya_hostels_student_id, acc.account_password
                FROM students s INNER JOIN accounts acc ON s.maya_hostels_student_id = acc.maya_hostels_student_id
                INNER JOIN student_email_addresses se ON se.maya_hostels_student_id = s.maya_hostels_student_id
                WHERE se.email_address = $1`, [email_address]
            );

            //Checking the database to see whether the student exists
            if(result.rows.length === 0){
                return res.status(400).json({message: `Invalid credentials`});
            }

            //Getting the student's details from the database query and storing them in a variable called user
            user = result.rows[0];

            //Creating the payload, we'll pass it into our jwt.sign() function
            payload = {studentId: user.maya_hostels_student_id, role: 'student'};
        } else{
            return res.status(400).json({message: `Invalid role`});
        }

        //Check password
        const validPassword = await bcrypt.compare(password, user.account_password);

        if(!validPassword){
            return res.status(400).json({message: `Invalid credentials`});
        }

        //creating our access token
        const accessToken = generateAccessToken(payload);
        //creating our refresh token
        const refreshToken = generateRefreshToken(payload);

        //Storing our refresh token in a cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true, //Storing it in the httpOnly cookie so that it cannot be attacked via javascript
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        //Returning the access token to client-side to be able to access our routes
        res.json({accessToken})

    }catch(error){
        next(error);
        return res.status(500).json({error: `${error}: Server Error`});
    }
}

//@desc refresh token
//@route GET /api/accounts/refresh
const refresh = (req, res) => {
    //Retrieve the cookies and store them in a variable called cookies
    const cookies = req.cookies;

    //Check the cookie to see if the refresh token exists
    if(!cookies?.jwt) return res.status(401).json({message: `No refresh token`});

    //Get the refresh token from the cookies and store them in a variable
    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({message: `Forbidden`});

        //Recreating the payload to create the access token
        const payload = { ...decoded }; //The decoded variable holds the payload we passed into the access and refresh tokens

        //Recreate the access token
        const accessToken = generateAccessToken(payload);

        //Returning the recreated access token to client-side to be able to access our routes
        res.json({accessToken});
    })
}

//@desc logout
//@route POST /api/accounts/logout
const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
    });
    return res.json({message: `Logged out`});
}

export {
    register,
    login,
    refresh,
    logout,
};