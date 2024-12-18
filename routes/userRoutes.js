const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

router.post('/signup', async (req , res) => {
      try {
            const data = req.body  //Assuming the request body contains the User data 

            // create a new User document using the mongoose model
            const newUser = new User(data);
            
            // save the new user to the database
            const response = await newUser.save();
            console.log('data saved');
            
            const payload = {
              id : response.id
            }
            console.log(JSON.stringify(payload));
            const token = generateToken(payload);
            console.log("Token is :", token);
            
            res.status(200).json({ response: response, token : token});

      } catch (error) {
             console.log(error);
             res.status(500).json({ error : 'Internal Server Error '})
      }
})

//Login Route

router.post('/login', async(req, res) => {     
  try {
        const {aadharCardNumber, password } = req.body;

        const user = await User.findOne({aadharCardNumber : aadharCardNumber});

        if( !user || !(await user.comparePassword(password))){
           return res.status(401).json({error : 'Invalid username or password '});
        }

        const payload = {
           id : user.id
        }

        const token = generateToken(payload);

        res.json({token});

  } catch (error) {
     console.log(error);
     res.status(500).json({ error : 'Internal server error '});
  }
       
})

//profille route
router.get('/profile', jwtAuthMiddleware, async(req, res) =>  {
   try {
        
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(201).json({user});
   } catch (error) {
      console.log(error);
      res.status(500).json({ error : 'Invalid Server error'});
   }
})

router.put('/profile/password', jwtAuthMiddleware,async(req, res) => {
     try {     
           const userId = req.user.id;
           const {currentPassword, newPassword} = req.body;

           const user = await User.findById(userId);

           if(!(await user.comparePassword(currentPassword))){
               return res.status(401).json({ error: 'invalid username or password ' });
           }
       
           user.password = newPassword;
           await user.save();

           console.log('Password updated');
           res.status(200).json({message : "password updated"});
           
     } catch (error) {
        console.log(error);
        res.status(500).json({ error : 'Invalid Server error '})
     }
})

module.exports = router;