const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

router.post('/signup', async (req, res) =>{ 
    try{
        const data = req.body

       const newUser = new User(data);
       const response = await newUser.save();
       console.log('data saved');

       const payload = {
        id:response.id
       }
    //    console.log(JSON.stringify(payload));
       const token = generateToken(payload);
       console.log("token is: ", token);
       res.status(200).json({response: response, token: token});

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'internal server error'});

    }
})

//login route
router.post('/login', async(req, res) => {
    try {
        //extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        //find user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // if user and password dose not match return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'invalid username or password'});
        }

        //generate token
        const payload = {
            id : user.id
        }
        const token = generateToken(payload);

        // return token as response
        res.json({token})
;    } catch (err) {
            console.log(err)
            res.status(500).json({error: 'internal server error'});
    }
})

//profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) =>{
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await person.findById(userId);
        res.status(200).json({user});
    } catch (err) {
        console.log(err)
         res.status(500).json({error: 'internal server error'});
    }
})

// router.get('/',jwtAuthMiddleware, async (req, res) =>{
//     try {
//         const data = await person.find();
//         console.log('data fetched');
//        res.status(200).json(data);
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({error: 'internal server error'});
//     }
// })

// router.get('/:workType', async (req, res) =>{
//     try {
//         const workType = req.params.workType;
//         if(workType == 'chef' || workType == 'manager' || workType == 'waiter'){
//             const response = await person.find({work: workType});
//             console.log('response fetched');
//             res.status(200).json(response);
//         }else{
//             res.status(404).json({error: 'invalid work type'});
//         }
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({error: 'internal server error'});
//     }
// })

router.put('/profile/password',jwtAuthMiddleware, async (req, res) =>{
    try {
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body

        const user = await User.findById(userId);

        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'invalid username or password'});
        }

        //update the user password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: 'password updated'});

    } catch (err) {
        console.log(err)
        res.status(500).json({error: 'internal server error'});
    }
})

// router.delete('/:id', async (req, res) =>{
//     try {
//         const personId = req.params.id;
//         const response = await person.findByIdAndDelete(personId);

//         if(!response){
//             return res.status(404).json({error: 'person not found'});
//         }

//         console.log('data deleted');
//         res.status(200).json({message: 'person deleted successfully'});


//     } catch (err) {
//         console.log(err)
//         res.status(500).json({error: 'internal server error'});
//     }
// })

module.exports = router;
