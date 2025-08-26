import express from 'express';
import { register, login, logout, refresh } from '../controllers/accountsController.js';
import {validateRegister, validateLogin} from "../middleware/validateAccounts.js";
import {authenticationLimiter} from "../middleware/authenticationLimiter.js";

const router = express.Router();

/*
Where else authenticationLimiter should apply:
   /forgot-password — yes, definitely!
   /contact-us or send-email — good idea.
*/

//register routes
router.post('/register', authenticationLimiter, validateRegister, register);

//login routes
router.post('/login', authenticationLimiter, validateLogin, login);

//logout route
router.post('/logout', logout);

//refresh token route
router.get('/refresh', refresh);


export default router;