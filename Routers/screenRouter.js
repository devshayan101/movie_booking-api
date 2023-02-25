const router = require('express').Router();
const {saveTheaterData, saveMoviesData, saveShowsData} = require('../Controllers/adminRoleController')
const {routeAuth} = require('../helpers/routeAuth')

router.route('/admin/saveTheaterData').post(routeAuth, saveTheaterData);
router.route('/admin/saveMoviesData').post(routeAuth, saveMoviesData);
// router.route('/admin/saveShowsData').post(routeAuth, saveShowsData);

router.route('/user/bookShow')


module.exports = router;