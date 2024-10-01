module.exports = () => {
    return (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ message: 'Une erreur s\'est produite', error: err.message });
    };
};
