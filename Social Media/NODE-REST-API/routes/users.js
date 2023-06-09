const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcryptjs");

// update user
router.put("/:id", async (req, res)=>{

    if(req.body.userId == req.params.id || req.body.isAdmin) {
        if(req.body.password){
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (err) {
                return res.status(500).json(err);
            }
        }
            try {
                const user = await User.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true});
                res.status(200).json("Account has been updated");
            } catch (err) {
                return res.status(500).json(err);
            }
    } else {
        return res.status(403).json("You can update only your account!")
    }
});

// delete user
router.delete("/:id", async (req, res)=>{

    if(req.body.userId == req.params.id || req.body.isAdmin) {
       
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can delete only your account!")
    }
});

// get a user
// query helps to use both /:id and profile?id=jhkhkhh
router.get("/", async (req, res)=>{
    const userId = req.query.userId;
    const username = req.query.username
    try {
        const user = userId ? await User.findById(userId) : await User.findOne({username: username});
        const {password,updatedAt, ...others} = user._doc;
        return res.status(200).json(others);
        
    } catch (err) {
        return res.status(500).json(err);
    }
});

// follow a user

router.put("/:id/follow", async (req, res)=>{

    if(req.body.userId !== req.params.id){
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                return res.status(200).json("user has been followed");
            } else {
                return res.status(403).json("You already follow this user");
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }

    }else{
        return res.status(403).json("you cant follow youself");
    }
});

// unfollolw a user

router.put("/:id/unfollow", async (req, res)=>{

    if(req.body.userId !== req.params.id){
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                return res.status(200).json("user has been unfollowed");
            } else {
                return res.status(403).json("You dont follow this user");
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }

    }else{
        return res.status(403).json("you cant unfollow youself");
    }
});

module.exports = router;