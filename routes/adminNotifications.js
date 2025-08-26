import express from 'express';

import {
    sendNotifications,
    sendNotificationToSingleStudent,
    getAllNotificationsFromStudents,
    getAllSent,
    getAllSentToSingleStudent,
    deleteSentNotification,
    deleteAllSentNotifications,
    editSentNotification,
    editSentNotificationsForAllStudents,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications
} from '../controllers/adminNotificationsController.js';

import {verifyJWT, requireRole} from "../middleware/jwtHandler.js";
import { csrfMiddleware } from '../middleware/csrfHandler.js';
import {validateNotificationToAllStudents, validateNotificationToSingleStudent} from "../middleware/validateNotifications.js";
import {validateIdParam} from "../middleware/validateIdParam.js";
import {validateUUIDParam} from "../middleware/validateStringParam.js";

const router = express.Router();

//Route to send notifications to all students
router.post('/',verifyJWT, requireRole('admin'), csrfMiddleware, validateNotificationToAllStudents, sendNotifications);

//Route to send notifications to a specific student
router.post('/specificStudent', verifyJWT, requireRole('admin'), csrfMiddleware, validateNotificationToSingleStudent, sendNotificationToSingleStudent);

//Route to receive notifications from students
router.get('/', verifyJWT, requireRole('admin'), getAllNotificationsFromStudents);

//Route to see all notifications sent to students
router.get('/sent', verifyJWT, requireRole('admin'), getAllSent);

//Route to see all notifications sent to a particular student
router.get('/sent/:student_id', verifyJWT, requireRole('admin'), validateIdParam('student_id'), getAllSentToSingleStudent);

//Route to delete a notification sent to a student
router.delete('/sent/:id', verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), deleteSentNotification);

//Route to delete all sent notifications to all students
router.delete('/deleteAllSent', verifyJWT, requireRole('admin'), csrfMiddleware, deleteAllSentNotifications);

//Route to edit a particular notification sent to a single student
router.put('/edit/:id/:student_id', verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), validateIdParam('student_id'),validateNotificationToSingleStudent, editSentNotification);

//Route to edit all notifications sent to all students
router.put('/editAllSent/:broadcast_id', verifyJWT, requireRole('admin'), csrfMiddleware, validateUUIDParam('broadcast_id'), validateNotificationToAllStudents, editSentNotificationsForAllStudents);

//Route to mark a specific notification received from a particular student as read
router.put('/:id', verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), markNotificationAsRead);

//Route to mark all notifications received from students as read
router.put('/', verifyJWT, requireRole('admin'), csrfMiddleware, markAllNotificationsAsRead);

//Route to delete a specific notification received from a particular student
router.delete('/:id/:student_id', verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), validateIdParam('student_id'), deleteNotification);

//Route to delete all notifications received from all students
router.delete('/', verifyJWT, requireRole('admin'), csrfMiddleware, deleteAllNotifications);

export default router;