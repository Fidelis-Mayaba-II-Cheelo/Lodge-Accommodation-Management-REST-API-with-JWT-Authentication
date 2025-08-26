import db from '../models/db.js';
import {v4 as uuidv4} from 'uuid';

//@desc Route to send notifications to all students
//@route POST /api/adminNotifications
const sendNotifications = async (req, res, next) => {
    const { notification_message } = req.body;
    const maya_hostels_admin_id = req.user.adminId;
    const broadcastId = uuidv4();

    try {
        const studentsResult = await db.query(`SELECT maya_hostels_student_id FROM students`);
        const students = studentsResult.rows;

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        /*We take all students, prepare one big insert with placeholders and values, and run it at once to be fast and safe*/
        //The values array will hold all parameters for all students, in order.
        // [[1,1, 'System will be down', true, fhfjhf], [2,1, 'System will be down', true, fhfjhf]]
        const values = [];

        // looping through each student using map() to build a corresponding placeholder string for each row of values.
        //($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ...
        const placeholders = students.map((student, index) => {
            //Each student contributes 5 values to the values array.
            //So for index = 0, i = 0 and For index = 1, i = 5 and For index = 2, i = 10, etc.
            const i = index * 5; // ← Now 5 params per student
            values.push(
                student.maya_hostels_student_id,
                maya_hostels_admin_id,
                notification_message,
                true,
                broadcastId // ← Push UUID as value, not inline
            );
            return `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5})`;
        });

        await db.query(
            `INSERT INTO notifications (maya_hostels_student_id, maya_hostels_admin_id, notification_message, is_broadcast, broadcast_id) 
             VALUES ${placeholders.join(",")}`
            , values);

        return res.status(201).json({ message: `Notifications sent to ${students.length} students` });

    } catch (error) {
        error.customMessage = `Error sending notification to all students`;
        next(error);
    }
};

//@desc Route to send notifications to a specific student
//@route POST /api/adminNotifications/specificStudent
const sendNotificationToSingleStudent = async (req, res, next) => {
    const {maya_hostels_student_id, notification_message} = req.body;
    const maya_hostels_admin_id = req.user.adminId;

    try{
        const studentCheck = await db.query(
            `SELECT 1 FROM students WHERE maya_hostels_student_id = $1`,
            [maya_hostels_student_id]
        );

        if (studentCheck.rowCount === 0) {
            return res.status(404).json({ message: "Student not found." });
        }

        await db.query(`INSERT INTO notifications (maya_hostels_student_id, maya_hostels_admin_id, notification_message) VALUES ($1, $2, $3)`, [maya_hostels_student_id, maya_hostels_admin_id, notification_message]);

        return res.status(201).json({message: `Successfully sent notifications to student with id of ${maya_hostels_student_id}` });
    }catch(error){
        error.customMessage = `Error sending notification to student with the student id of ${maya_hostels_student_id}`;
        next(error);
    }
}

//@desc Route to receive notifications from students
//@route GET /api/adminNotifications
const getAllNotificationsFromStudents = async (req, res, next) => {
    try{
        const notifications = await db.query('SELECT * FROM admin_notifications');

        if(notifications.rows.length === 0){
            return res.status(404).json({message: "No notifications found"});
        }

        return res.status(200).json({notifications: notifications.rows});
    }catch(error){
        error.customMessage = `Error getting all notifications from students`;
        next(error);
    }
}


//@desc Route to see all notifications sent to students
//@route GET /api/adminNotifications/sent
const getAllSent = async (req, res, next) => {
    const maya_hostels_admin_id = req.user.adminId;
    try{
        const sentNotifications = await db.query(`SELECT * FROM notifications WHERE maya_hostels_admin_id = $1`, [maya_hostels_admin_id]);

        if(sentNotifications.rows.length === 0){
            return res.status(404).json({message: "No sent notifications found"});
        }

        return res.status(200).json({sentNotifications: sentNotifications.rows});
    }catch(error){
        error.customMessage = `Error retrieving all sent notifications`;
        next(error);
    }
}

//@desc Route to see all notifications sent to a particular student
//@route GET /api/adminNotifications/sent/:student_id
const getAllSentToSingleStudent = async (req, res, next) => {
    const adminId = req.user.adminId;
    const studentId = parseInt(req.params.student_id);
    try{
        const notifications = await db.query(`SELECT * FROM notifications WHERE maya_hostels_student_id = $1 AND maya_hostels_admin_id = $2`, [studentId, adminId]);

        if(notifications.rows.length === 0){
            return res.status(404).json({message: "No students found"});
        }

        return res.status(200).json({notifications: notifications.rows})
    }catch(error){
        error.customMessage = `Error retrieving all sent notifications to student of id ${studentId}`;
        next(error);
    }
}

//@desc Route to delete a notification sent to a student
//@route DELETE /api/adminNotifications/sent/:id
const deleteSentNotification = async (req, res, next) => {
    const notification_id = parseInt(req.params.id);

    try{
        const notification = await db.query(`SELECT maya_hostels_student_id FROM notifications WHERE maya_hostels_notifications_id = $1`, [notification_id]);

        if(notification.rows.length === 0){
            return res.status(404).json({message: `No notification with id ${notification_id} found`});
        }

        const student_id = notification.rows[0].maya_hostels_student_id;

        await db.query(`DELETE FROM notifications WHERE maya_hostels_notifications_id = $1 AND maya_hostels_student_id = $2`, [notification_id, student_id]);

        return res.status(200).json({message: `Successfully deleted notification sent to student of id ${student_id}`});
    }catch(error){
        error.customMessage = `Error deleting notification sent to a student`;
        next(error);
    }
}

//@desc Route to delete all sent notifications to all students
//@route DELETE /api/adminNotifications/deleteAllSent
const deleteAllSentNotifications = async (req, res, next) => {
    const adminId = req.user.adminId;
    try{
        const notificationsSent = await db.query(`SELECT COUNT(*) FROM notifications WHERE maya_hostels_admin_id = $1`, [adminId]);

        if(parseInt(notificationsSent.rows[0].count) === 0){
            return res.status(404).json({message: `No notifications found`});
        }

        await db.query(`DELETE FROM notifications WHERE maya_hostels_admin_id = $1`, [adminId]);

        return res.status(200).json({message: `All notifications sent to all students by admin with the id of ${adminId} have been successfully deleted`});

    }catch(error){
        error.customMessage = `Failed to delete all notifications sent to all students`;
        next(error);
    }
}

//@desc Route to edit a particular notification sent to a single student
//@route PUT /api/adminNotifications/edit/:id/:student_id
const editSentNotification = async (req, res, next) => {
    const {notification_message} = req.body;
    const studentId = parseInt(req.params.student_id);
    const notification_id = parseInt(req.params.id);
    const adminId = req.user.adminId;

    try{
        const notification = await db.query(`SELECT * FROM notifications WHERE maya_hostels_notifications_id = $1 AND maya_hostels_student_id = $2 AND maya_hostels_admin_id = $3`, [notification_id, studentId, adminId]);

        if(notification.rows.length === 0){
            return res.status(404).json({message: `No notifications found`});
        }

        await db.query(`UPDATE notifications SET notification_message = $1 WHERE maya_hostels_notifications_id = $2 AND maya_hostels_student_id = $3 AND maya_hostels_admin_id = $4`, [notification_message, notification_id, studentId, adminId]);

        return res.status(200).json({message: `Notification sent to student of id ${studentId} was edited successfully`});
    }catch(error){
        error.customMessage = `Error editing notification sent to student of id ${studentId}`;
        next(error);
    }
}

//@desc Route to edit all notifications sent to all students
//@route PUT /api/adminNotifications/editAllSent/:broadcast_id
const editSentNotificationsForAllStudents = async (req, res, next) => {
    const { notification_message } = req.body;
    const adminId = req.user.adminId;
    const broadcastId = req.params.broadcast_id;

    try {
        const result = await db.query(
            `UPDATE notifications 
             SET notification_message = $1 
             WHERE maya_hostels_admin_id = $2 
             AND is_broadcast = true AND broadcast_id = $3`,
            [notification_message, adminId, broadcastId]
        );

        return res.status(200).json({
            message: `Updated ${result.rowCount} broadcast notifications`
        });

    } catch (error) {
        error.customMessage = `Failed to update notification for all students`;
        next(error);
    }
};

//@desc Route to mark a specific notification received from a particular student as read
//@route PUT /api/adminNotifications/:id
const markNotificationAsRead = async (req, res, next) => {
    const adminId = req.user.adminId;
    const notificationId = parseInt(req.params.id);

    try{
        const notification = await db.query(`SELECT maya_hostels_student_id FROM admin_notifications WHERE maya_hostels_admin_id = $1 AND maya_hostels_admin_notifications_id = $2`, [adminId, notificationId]);

        if(notification.rows.length === 0){
            return res.status(404).json({message: `No notification with the id of ${notificationId} was found`});
        }

        const studentId = notification.rows[0].maya_hostels_student_id;

        const notification_status = 1;

        await db.query(`UPDATE admin_notifications SET notification_status = $1 WHERE maya_hostels_admin_id = $2 AND maya_hostels_admin_notifications_id = $3 AND maya_hostels_student_id = $4`, [notification_status, adminId, notificationId, studentId]);

        return res.status(200).json({message: `Notification marked as read`});
    }catch(error){
        error.customMessage = `Failed to mark notification as read`;
        next(error);
    }
}


//@desc Route to mark all notifications received from students as read
//@route PUT /api/adminNotifications
const markAllNotificationsAsRead = async (req, res, next) => {
    const adminId = req.user.adminId;
    const unread = 0;
    const read = 1;

    try{
        //Get all the notification ids
        const unreadNotifications = await db.query(`SELECT COUNT(*) FROM admin_notifications WHERE notification_status = $1 AND maya_hostels_admin_id = $2`, [unread, adminId]);

        if(parseInt(unreadNotifications.rows[0].count) === 0){
            return res.status(404).json({message: `No unread notifications found`});
        }


        await db.query(`UPDATE admin_notifications SET notification_status = $1 WHERE maya_hostels_admin_id = $2`, [read, adminId]);

        return res.status(200).json({message: `All notifications marked as read`});

    }catch(error){
        error.customMessage = `Error marking all notifications received as read`;
        next(error);
    }
}

//@desc Route to delete a specific notification received from a particular student
//@route DELETE /api/adminNotifications/:id/:student_id
const deleteNotification = async (req, res, next) => {
    const adminId = req.user.adminId;
    const notificationId = parseInt(req.params.id);
    const studentId = parseInt(req.params.student_id);

    try{

        const result = await db.query(`DELETE FROM admin_notifications WHERE maya_hostels_admin_notifications_id = $1 AND maya_hostels_admin_id = $2 AND maya_hostels_student_id = $3`, [notificationId, adminId, studentId]);

        if(result.rowCount === 0){
            return res.status(404).json({message: `No notification with the id of ${notificationId} was found`});
        }

        return res.status(200).json({message: `Notification deleted successfully`});
    }catch(error){
        error.customMessage = `Failed to delete notification received from student with id ${studentId}`;
        next(error);
    }
}

//@desc Route to delete all notifications received from all students
//@route DELETE /api/adminNotifications
const deleteAllNotifications = async (req, res, next) => {
    const adminId = req.user.adminId;
    try{

        const deleted = await db.query(`DELETE FROM admin_notifications WHERE maya_hostels_admin_id = $1 RETURNING *`, [adminId]);

        if(deleted.rowCount === 0){
            return res.status(404).json({message: `No notifications found`});
        }

        return res.status(200).json({message: `${deleted.rowCount} notifications have been deleted`});
    }catch(error){
        error.customMessage = `Failed to delete all notifications`;
        next(error);
    }
}

export {
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
};