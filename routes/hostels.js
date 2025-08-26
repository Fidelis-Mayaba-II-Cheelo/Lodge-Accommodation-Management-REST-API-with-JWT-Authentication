import express from 'express';
import {validateAddHostels, validateUpdateHostels} from '../middleware/validateHostels.js';
import {validateIdParam} from "../middleware/validateIdParam.js";
import {addHostel, updateHostel, getHostels, getHostel, deleteHostel, getRooms, getBedspaces, getFullHostels, getNotFullHostels, getFullRooms, getNotFullRooms, evictAllHostelOccupants, addHostelImages, getHostelImages, deleteHostelImage, deleteAllHostelImages} from '../controllers/hostelsController.js';
import {upload} from '../middleware/hostel_images_multer.js';
import {verifyJWT, requireRole} from "../middleware/jwtHandler.js";
import { csrfMiddleware } from '../middleware/csrfHandler.js';

const router = express.Router();

//NOTE:
/*Route to add rooms/bedspaces to a hostel is already handles by the updateRoomsAndBedspaces trigger*/
/*Route to update rooms/bedspaces of a hostel is already handles when we update the hostel(specifically the capacity) by the beforeHostelCapacityUpdate trigger*/
/*No Route to delete rooms because the rooms and bedspaces tables are tightly coupled to the hostels table*/

// ✅ Static + specific routes first
//Route to get all fully filled hostels
router.get('/fullyFilled', verifyJWT, requireRole('admin'), getFullHostels);//W

//Route to get all hostels that aren't filled yet
router.get('/notFullyFilled',  verifyJWT, requireRole('admin'), getNotFullHostels);//W

//Route to get all rooms and that are fully filled (all bedspaces is_occupied = 1)
router.get('/fullyFilledRooms/:id',  verifyJWT, requireRole('admin'), validateIdParam('id'), getFullRooms);//W

//Route to get all rooms that aren't fully filled (there is at least one bedspace where is_occupied = 0)
router.get('/notFullyFilledRooms/:id',  verifyJWT, requireRole('admin'), validateIdParam('id'), getNotFullRooms);//W

// ✅ Core CRUD routes
//Route to add hostels
router.post('/addHostel',  verifyJWT, requireRole('admin'), csrfMiddleware, validateAddHostels, addHostel); //W

//Route to update hostels
router.put('/updateHostel/:id',  verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), validateUpdateHostels, updateHostel); //W

//Route to get all hostels
router.get('/',  verifyJWT, requireRole('admin'), getHostels); //W

//Route to delete a hostel
router.delete('/deleteHostel/:id',  verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), deleteHostel);//W

//Route to evict all occupants from a hostel (update students acc_status=none && hostel_id = null where hostel id =?)
router.delete('/evictAll/:id',  verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), evictAllHostelOccupants);//W


// ✅ Related nested resources
//Route to get all rooms for a particular hostel
router.get('/rooms/:id',  verifyJWT, requireRole('admin'), validateIdParam('id'), getRooms); //W

//Route to get all bedspaces for a particular room in a particular hostel
router.get('/bedspaces/:id',  verifyJWT, requireRole('admin'), validateIdParam('id'), getBedspaces);//W

// ✅ Images
//Route to add Hostel images to a particular hostel (if we wanted to upload many at a go = upload.array('hostel_images', 3))
router.post('/images/:id',  verifyJWT, requireRole('admin'), upload.array('hostel_image', 10), csrfMiddleware, validateIdParam('id'), addHostelImages); //upload.single()- only one file is going to be uploaded. We will give it a field name of 'hostel_image' //W

//Route to view Hostel images for a particular hostel
router.get('/images/:id',  verifyJWT, requireRole('admin'), validateIdParam('id'), getHostelImages);//W

//Route to delete a single hostel image for a particular hostel
router.delete('/images/:id/:imageId',  verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), validateIdParam('imageId'), deleteHostelImage);//W

//Route to all delete hostel images for a particular hostel
router.delete('/images/:id',  verifyJWT, requireRole('admin'), csrfMiddleware, validateIdParam('id'), deleteAllHostelImages);//W

// ✅ Generic single hostel (MUST be last)
//Route to get a single hostel
router.get('/:id',  verifyJWT, requireRole('admin'), validateIdParam('id'), getHostel); //W

export default router;