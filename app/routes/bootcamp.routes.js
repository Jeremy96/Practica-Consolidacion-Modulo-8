const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
const userController = require('../controllers/user.controller');
const bootcampController = require('../controllers/bootcamp.controller');

// Ruta para crear un bootcamp, acceso por medio de token, previamente iniciado sesión 
router.post('/bootcamp', [verifyToken], async (req, res) => {
    try {
        const { title, cue, description } = req.body;
        // Validacion de campos
        if (!title || !cue || !description) {
            return res.status(400).json({ message: "Error: Faltan campos requeridos!" });
        }
        // Creación de bootcamp
        const newBootcamp = await bootcampController.createBootcamp({
            title,
            cue,
            description
        });
        // Mensaje de exito 
        res.status(201).json({
            message: "Bootcamp creado correctamente!",
            bootcamp: newBootcamp
        });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el bootcamp", error: error.message });
    }
});

// Ruta para agregar usuarios previamente registrados al bootcamp, acceso por medio de token, previamente iniciado sesión
router.post('/bootcamp/adduser', [verifyToken], async (req, res) => {
    try {
        const { bootcampId, userId } = req.body;
        // Validación de campos
        if (!bootcampId || !userId) {
            return res.status(400).json({ message: "Error: Faltan campos requeridos!" });
        }
        // Buscar el bootcamp indicado
        const bootcamp = await bootcampController.findById(bootcampId);
        if (!bootcamp) {
            return res.status(404).json({ message: "Bootcamp no encontrado!" });
        }

        // Buscar el usuario indicado
        const user = await userController.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado!" });
        }

        // Agregar el usuario al bootcamp
        await bootcampController.addUser(bootcampId, userId);
        //Mensaje de exito
        res.status(200).json({ message: "Usuario añadido al bootcamp!" });
    } catch (error) {
        res.status(500).json({ message: "Error al añadir el usuario al bootcamp!.", error: error.message });
    }
});

// Ruta para obtener información de un bootcamp según id, y mostrar los usuarios registrados en el bootcamp. Acceso por medio de token, previamente iniciado sesión
router.get('/bootcamp/:id', [verifyToken], async (req, res) => {
    try {
        const bootcampId = req.params.id;
        // Buscar el bootcamp por el id
        const bootcamp = await bootcampController.findById(bootcampId);
        // Mensaje de error si no se encuentra el bootcamp
        if (!bootcamp) {
            return res.status(404).json({ message: "Bootcamp no encontrado!" });
        }
        // Mensaje de exito
        res.status(200).json(bootcamp);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar el bootcamp!", error: error.message });
    }
});

// Ruta para listar todos los bootcamp, acceso público 
router.get('/bootcamp', async (req, res) => {
    try {
        // Obtener todos los bootcamps
        const bootcamps = await bootcampController.findAll();
        // Mensaje de exito
        res.status(200).json(bootcamps);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar los bootcamps!", error: error.message });
    }
});

module.exports = router;