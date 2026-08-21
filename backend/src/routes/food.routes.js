const express = require('express');
const foodController = require("../controllers/food.controller")
const orderController = require("../controllers/order.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const router = express.Router();
const multer = require('multer');


const upload = multer({
    storage: multer.memoryStorage(),
})


/* POST /api/food/ [protected]*/
router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("mama"),
    foodController.createFood)


/* GET /api/food/ [protected] */
router.get("/",
    authMiddleware.authUserMiddleware,
    foodController.getFoodItems)


router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood)


router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood
)


router.get('/save',
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood
)

router.get('/:foodId/comments',
    authMiddleware.authUserMiddleware,
    foodController.getComments
)

router.post('/:foodId/comments',
    authMiddleware.authUserMiddleware,
    foodController.createComment
)

router.patch('/comments/:commentId',
    authMiddleware.authUserMiddleware,
    foodController.updateComment
)

router.delete('/comments/:commentId',
    authMiddleware.authUserMiddleware,
    foodController.deleteComment
)

router.post('/:foodId/orders',
    authMiddleware.authUserMiddleware,
    orderController.createOrder
)



module.exports = router