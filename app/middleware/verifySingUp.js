const db = require('../models')
const User = db.users

const checkEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({where: {email: req.body.email}});
        if (user) {
            return res.status(400).json({ message: "El email ingresado ya se encuentra en la base de datos!" });
        }
        next();
    }catch (error) {
        res.status(500).json({ message: "Error con el email", error: error.message });
    }
};

module.exports = { checkEmail };