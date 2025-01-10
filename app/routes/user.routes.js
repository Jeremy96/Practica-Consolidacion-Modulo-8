const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { checkEmail } = require('../middleware/verifySingUp');
const { verifyToken } = require('../middleware/auth');
const { SECRET_KEY } = require('../config/auth.config');
const router = express.Router();
const User = db.users;
const userController = require('../controllers/user.controller')

// Ruta para registrar un nuevo usuario, acceso público 
router.post('/signup', [checkEmail], async (req, res) => {
    try {
        const { firstName, lastName ,email, password } = req.body;
        // Validacion de campos
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "Error: Todos los campos son requeridos" });
        }
        // Crear un hash de la contraseña con bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);
        // Crear y guardar el nuevo usuario
        const user = await userController.createUser({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword
        })
        // Mensaje de exito
        res.status(201).json({ message: "Usuario registrado correctamente!", userId: user.id });
    } catch (error) {
        // Mensaje de error en caso de que el email ya se encuentre registrado
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "Error: El email ingresado ya esta registado en la base de datos!" });
        }
        res.status(500).json({ message: "Error al registrar el usuario", error: error.message });
    }
});

// Ruta para inicio de sesión en la API, acceso público 
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validacion de campos
        if (!email || !password) {
            return res.status(400).json({ message: "Error: Faltan los campos requeridos" });
        }
        // Buscar al usuario por su correo electrónico
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado!" });
        }
        // Verificar si la contraseña es correcta
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Contraseña Invalida!" });
        }
        // Generar el token JWT secreto
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' }); // 24 horas
        // Devolver el usuario con su token
        res.status(200).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            accessToken: token
        });
    } catch (error) {
        res.status(500).json({ message: "Error al iniciar sesión.", error: error.message });
    }
});

// Ruta para listar información del usuario según id, acceso por medio de token, previamente iniciado sesión 
router.get('/user/:id', [verifyToken], async (req, res) => {
    try {
        const userId = req.params.id;
        // Buscar usuario por ID
        const user = await userController.findUserById(userId);
        // Mensaje de error si no encuentra el usuarios
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado!" });
        }
        // Mensaje de exito
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar los usuarios.", error: error.message });
    }
});

// Ruta para listar información de todos los usuarios y los Bootcamp registrados, acceso por medio de token, previamente iniciado sesión 
router.get('/user', [verifyToken], async (req, res) => {
    try {
        // Buscar y listar todos los usuarios
        const users = await userController.findAll();
        // Mensaje de exito
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar los usuarios", error: error.message });
    }
});

// Ruta para actualizar los campos de firstName y lastName de un usuario según su id, acceso por medio de token, previamente iniciado sesión
router.put('/user/:id', [verifyToken], async (req, res) => {
    try {
        const userId = req.params.id;
        const { firstName, lastName } = req.body;
        // Validacion de campos
        if (!firstName || !lastName) {
            return res.status(400).json({ message: "Error: Los campos son requeridos!" });
        }
        // Buscar al usuario por su id
        const user = await userController.findUserById(userId)
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado!" });
        }
        // Actualizar los campos
        await userController.updateUserById(user.id, firstName, lastName);
        const userUpdate = await userController.findUserById(userId)
        // Mensaje de exito
        res.status(200).json({
            message: "Usuario actualizado!",
            user: {
                id: userUpdate.id,
                firstName: userUpdate.firstName,
                lastName: userUpdate.lastName
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el usuario.", error: error.message });
    }
});

//Ruta para eliminar un usuario según id, acceso por medio de token, previamente iniciado sesión  
router.delete('/user/:id', [verifyToken], async (req, res) => {
    try {
        const userId = req.params.id;
        // Buscar usuario por au id
        const user = await userController.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado!" });
        }
        // Elimina el usuario
        await userController.deleteUserById(userId);
        // Mensaje de exito
        res.status(200).json({ message: "Usuario eliminado!" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario.", error: error.message });
    }
});

module.exports = router;