import db from '../models/db.js';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//@desc Adding a hostel to the db
//@route POST /api/hostels
const addHostel = async (req, res, next) => {
    const {
        hostel_name, number_of_rooms, hostel_status, hostel_type,
        hostel_accommodation_price_per_month, semester
    } = req.body;

    const adminId = req.user.adminId;

    try{
        await db.query('CALL sp_add_hostels($1, $2, $3, $4, $5, $6, $7)', [hostel_name, number_of_rooms, hostel_status, hostel_type,
            hostel_accommodation_price_per_month, adminId, semester]);

        return res.status(201).json({message: "Hostel added successfully"});

    }
    catch(error){
        error.customMessage = "Hostel not added.";
        next(error);
    }
}

//@desc Updating hostels information in the db
//@route PUT /api/hostels/:id
const updateHostel = async (req, res, next) => {
    const {
        hostel_name, number_of_rooms, hostel_status, hostel_type, hostel_capacity,
        number_of_bedspaces_per_room, hostel_accommodation_price_per_semester,
        hostel_accommodation_price_per_month
    } = req.body;

    const adminId = req.user.adminId;


    const id = parseInt(req.params.id);

    try{
        const data = await db.query('SELECT * FROM hostels WHERE maya_hostels_hostel_id = $1', [id]);

        if(data.rows.length === 0){
            return res.status(404).json({message: `No hostel with the id of ${id} was found.`});
        }

        await db.query('UPDATE hostels SET hostel_name = $1, number_of_rooms = $2, hostel_status = $3, hostel_type = $4,hostel_capacity = $5, number_of_bedspaces_per_room = $6, hostel_accommodation_price_per_semester = $7, hostel_accommodation_price_per_month = $8, maya_hostels_admin_id = $9 WHERE maya_hostels_hostel_id = $10;', [hostel_name, number_of_rooms, hostel_status, hostel_type, hostel_capacity,
            number_of_bedspaces_per_room, hostel_accommodation_price_per_semester,
            hostel_accommodation_price_per_month, adminId, id]);

        return res.status(200).json({message: "Hostel updated successfully"});
    } catch(error){
        error.customMessage = "This hostel's information could not be updated.";
        next(error);
    }
}

//@desc Get all hostels information
//@route GET /api/hostels
const getHostels = async (req, res, next) => {
    try{
        const hostels = await db.query('SELECT * FROM hostels');

        if(hostels.rows.length === 0){
            return res.status(404).json({message: `No hostels found.`});
        }

        return res.status(200).json({hostels: hostels.rows});

    }catch(error){
        error.customMessage = "Hostels not found.";
        next(error);
    }
}

//@desc Get a single hostel
//@route GET /api/hostels/:id
const getHostel = async (req, res, next) => {
    const id = parseInt(req.params.id);

    try{
        const hostel = await db.query('SELECT * FROM hostels WHERE maya_hostels_hostel_id = $1', [id]);
        if(hostel.rows.length === 0){
            return res.status(404).json({message: `No hostel with id of ${id} was found.`});
        }

        return res.status(200).json({hostel: hostel.rows});
    }catch(error){
        error.customMessage = "Hostels not found.";
        next(error);
    }
}

//@desc Delete a single hostel
//@route DELETE /api/hostels/deleteHostel/:id
const deleteHostel = async (req, res, next) => {
    const id = parseInt(req.params.id);

    try{
        await db.query('DELETE FROM hostels WHERE maya_hostels_hostel_id = $1', [id]);
        return res.status(200).json({message: "Hostel with id of ${id} was deleted."});
    }catch(error){
        error.customMessage = "Hostels not found.";
        next(error);
    }
}

//@desc Get all rooms information for a particular hostel
//@route GET /api/hostels/rooms/:id
const getRooms = async (req, res, next) => {
    //Get the one passed in the url after someone clicks show all rooms

    const hostel_id = req.params.id;

    try{
        const rooms = await db.query('SELECT * FROM rooms WHERE maya_hostels_hostel_id = $1', [hostel_id]);
        if(rooms.rows.length === 0){
            return res.status(404).json({message: `No room with the id of ${hostel_id} was found.`});
        }

        return res.status(200).json({rooms: rooms.rows});
    }catch(error){
        error.customMessage = "No Rooms where found for found for this particular hostel.";
        next(error);
    }
}

//@desc Get all bedspaces information for all rooms in a particular hostel
//@route GET /api/hostels/bedspaces/:id
const getBedspaces = async (req, res, next) => {
    //Get the one passed in the url after someone clicks show all rooms
    const hostel_id = req.params.id;
    try{
        const bedspaces = await db.query('SELECT b.* FROM bedspaces b INNER JOIN rooms r ON b.maya_hostels_room_id = r.maya_hostels_room_id WHERE maya_hostels_hostel_id = $1', [hostel_id]);
        if(bedspaces.rows.length === 0){
            return res.status(404).json({message: `No room with the id of ${hostel_id} was found.`});
        }

        return res.status(200).json({rooms: bedspaces.rows});
    }catch(error){
        error.customMessage = "No Rooms where found for found for this particular hostel.";
        next(error);
    }
}

//@desc Get all fully filled hostels
//@route GET /api/hostels/fullyFilled
const getFullHostels = async (req, res, next) => {
    try{
        const fullHostels = await db.query('SELECT * from hostels WHERE hostel_status = 1');

        if(fullHostels.rows.length === 0){
            return res.status(404).json({message: `No hostels that are fully booked were found.`});
        }
        return res.status(200).json({hostels: fullHostels.rows});
    }catch(error){
        error.customMessage = "There was an error in finding all the fully booked hostels.";
        next(error);
    }
}

//@desc Get all hostels that aren't fully filled
//@route GET /api/hostels/NotFullyFilled
const getNotFullHostels = async (req, res, next) => {
    try{
        const notFullHostels = await db.query('SELECT * from hostels WHERE hostel_status = 0');

        if(notFullHostels.rows.length === 0){
            return res.status(404).json({message: `No hostels that are fully booked were found.`});
        }
        return res.status(200).json({hostels: notFullHostels.rows});
    }catch(error){
        error.customMessage = "There was an error in finding all the non-fully booked hostels.";
        next(error);
    }
}

//@desc Get all rooms that are fully filled in a particular hostel
//@route GET /api/hostels/FullyFilled/:id
const getFullRooms = async (req, res, next) => {
    const hostel_id = req.params.id;
    try {
        const fullyFilled = await db.query(`
      SELECT r.*
      FROM rooms r
      JOIN bedspaces b ON r.maya_hostels_room_id = b.maya_hostels_room_id
      WHERE r.maya_hostels_hostel_id = $1
      GROUP BY r.maya_hostels_room_id, r.room_number, r.room_capacity, r.maya_hostels_hostel_id
      HAVING COUNT(*) = SUM(CASE WHEN b.is_occupied = 1 THEN 1 ELSE 0 END)
    `, [hostel_id]);

        if (fullyFilled.rows.length === 0) {
            return res.status(404).json({ message: `No rooms that are fully booked were found.` });
        }

        return res.status(200).json({ rooms: fullyFilled.rows });

    } catch (error) {
        error.customMessage = "There was an error in finding fully booked rooms.";
        next(error);
    }
};


//@desc Get all rooms that aren't fully filled in a particular hostel
//@route GET /api/hostels/NotFullyFilled/:id
const getNotFullRooms = async (req, res, next) => {
    const hostel_id = req.params.id;
    try {
        const notFullyFilled = await db.query(`
      SELECT r.*
      FROM rooms r
      JOIN bedspaces b ON r.maya_hostels_room_id = b.maya_hostels_room_id
      WHERE r.maya_hostels_hostel_id = $1
      GROUP BY r.maya_hostels_room_id, r.room_number, r.room_capacity, r.maya_hostels_hostel_id
      HAVING COUNT(*) > SUM(CASE WHEN b.is_occupied = 1 THEN 1 ELSE 0 END)
    `, [hostel_id]);

        if (notFullyFilled.rows.length === 0) {
            return res.status(404).json({ message: `No rooms that are not fully booked were found.` });
        }

        return res.status(200).json({ rooms: notFullyFilled.rows });

    } catch (error) {
        error.customMessage = "There was an error in finding the non-fully booked rooms.";
        next(error);
    }
};

//@desc Evict all occupants from a hostel
//@route PUT /api/hostels/evictAll/:id
const evictAllHostelOccupants = async (req, res, next) => {
    const hostel_id = req.params.id;
    try{
        //Handle the bedspaces
        await db.query(`
      UPDATE bedspaces
      SET is_occupied = 0
      WHERE maya_hostels_room_id IN (
        SELECT maya_hostels_room_id FROM rooms WHERE maya_hostels_hostel_id = $1
      )
    `, [hostel_id]);

        //Unlink students
        await db.query(`
      UPDATE students
      SET accommodation_status = 'None',
          maya_hostels_hostel_id = NULL,
          maya_hostels_room_id = NULL,
          maya_hostels_bedspaces_id = NULL
      WHERE maya_hostels_hostel_id = $1
    `, [hostel_id]);

        return res.status(200).json({message: `All hostel occupants were evicted successfully.`});
    }catch(error){
        error.customMessage = "An error occurred during the eviction process of hostel occupants.";
        next(error);
    }
}

const addHostelImages = async (req, res, next) => {
    const hostel_id = parseInt(req.params.id);
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded." });
    }

    try {
        const hostel = await db.query(
            'SELECT * FROM hostels WHERE maya_hostels_hostel_id = $1',
            [hostel_id]
        );

        if (hostel.rows.length === 0) {
            return res.status(404).json({ message: `Hostel with id ${hostel_id} does not exist.` });
        }

        for (const file of files) {
            await db.query(
                'INSERT INTO hostel_images (hostel_image, maya_hostels_hostel_id) VALUES ($1, $2)',
                [file.filename, hostel_id]
            );
        }

        return res.status(201).json({ message: "Hostel images uploaded and saved to DB." });
    } catch (error) {
        error.customMessage = "Upload of hostel images failed.";
        next(error);
    }
};


const getHostelImages = async (req, res, next) => {
    const hostel_id = parseInt(req.params.id);

    try{
        const images = await db.query(`SELECT hostel_image FROM hostel_images WHERE maya_hostels_hostel_id = $1`, [hostel_id]);

        if(images.rows.length === 0) {
            return res.status(404).json({ message: `No hostel images where found for the hostel with the id of ${hostel_id}.` });
        }

        //Build a url that leads to the exact location of each image
        const imageUrls = images.rows.map(img => `/hostel_images/${img.hostel_image}`);

        //Send an array of urls
        return res.status(200).json({ images: imageUrls });
    }catch(error){
        error.customMessage = "Failed retrieving hostel images.";
        next(error);
    }
}

const deleteHostelImage = async (req, res, next) => {
    const hostel_id = parseInt(req.params.id);
    const image_id = parseInt(req.params.imageId);

    try{
        //Get the filename (image to be deleted)
        const image = await db.query(`SELECT hostel_image FROM hostel_images WHERE maya_hostels_hostel_id = $1 AND maya_hostels_hostel_images_id = $2`, [hostel_id, image_id]);

        if(image.rows.length === 0) {
            return res.status(200).json({ message: `Image to be deleted was not found.` });
        }

        const filename = image.rows[0].hostel_image;

        //Delete image from disk
        const image_location = path.join(__dirname, `../public`, `hostel_images`, filename);

        fs.unlink(image_location).catch(err => console.log(err));

        //Delete image reference from the database
        await db.query(`DELETE FROM hostel_images WHERE maya_hostels_hostel_id = $1 AND maya_hostels_hostel_images_id = $2`, [hostel_id,image_id]);

        return res.status(200).json({message: `Successful deletion of hostel image for the hostel with the id of ${hostel_id}.`})
    }catch(error){
        error.customMessage = `Failed deleting hostel image for the hostel with the id of ${hostel_id}.`;
        next(error);
    }
}

const deleteAllHostelImages = async (req, res, next) => {
    const hostel_id = parseInt(req.params.id);

    try{
        const images = await db.query(`SELECT hostel_image FROM hostel_images WHERE maya_hostels_hostel_id= $1`, [hostel_id]);

        if(images.rows.length === 0) {
            return res.status(404).json({ message: `Image to be deleted was not found.` });
        }

        //Delete all images from the disk storage
        for(const image of images.rows){
            const image_location = path.join(__dirname, '../public', 'hostel_images', image.hostel_image);
            fs.unlink(image_location).catch(err => console.log(err));
        }

        //delete all images from the database
        await db.query(`DELETE FROM hostel_images WHERE maya_hostels_hostel_id = $1`, [hostel_id]);

        return res.status(200).json({ message: `All images for the hostel with the id of ${hostel_id} were deleted successfully.` });
    }catch(error){
        error.customMessage = `Failed deleting all hostel images for the hostel with the id of ${hostel_id}.`;
        next(error);
    }
}



export {
    addHostel,
    updateHostel,
    getHostels,
    getHostel,
    deleteHostel,
    getRooms,
    getBedspaces,
    getFullHostels,
    getNotFullHostels,
    getFullRooms,
    getNotFullRooms,
    evictAllHostelOccupants,
    addHostelImages,
    getHostelImages,
    deleteHostelImage,
    deleteAllHostelImages
};