const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const User = require('../models/user');

const checkAdminRole = async (userID) => {
    try {
        const user  =  await User.findById(userID);
        if(user.role === 'admin'){
             return true;
          }
    } catch (error) {
        return false; 
    }
}

router.post('/',jwtAuthMiddleware, async(req, res) => {
     try {
           if(! await checkAdminRole(req.user.id))
             return res.status(403).json({ message : 'user does not have admin role'});
           
           const data = req.body

           const newCandidate = new Candidate(data);

           const response = await newCandidate.save();
           console.log('data saved');
           res.status(200).json({response : response});
           
     } catch (error) {
           console.log(error);
           res.status(500).json({error: 'Internal Server Error '});
     }
})

router.put('/:candidateID',jwtAuthMiddleware, async(req, res) => {
     try {
          if(!checkAdminRole(req.user.id))
            return res.status(403).json({ message : 'user does not have admin role'});

          const candidateID = req.params.candidateID; // 
          const updateCandidateData = req.body;

          const response = await Candidate.findByIdAndUpdate(candidateID, updateCandidateData,{
              new : true, // return the upload document
              runValidators: true, // Run mongoose validation
          }) 

          if(!response){
            return res.status(404).json({ error: 'Candidate not found'});
          }

          console.log('candidate data updated');
          res.status(200).json(response);
     } catch (error) {
        console.log(error);
        res.status(500).json({error : 'Internal Server Error'});
        
     }
})

router.delete('/:candidateID',jwtAuthMiddleware, async(req, res) => {
     try {
       
         if(!checkAdminRole(req.user.id))
          return res.status(403).json({ message : 'user does not have admin role'});

         const candidateID = req.params.candidateID;

         const response = await Candidate.findByIdAndDelete(candidateID);

         if(!response){
           return res.status(404).json({ error: 'candidate not found' });
         }

         console.log('candidate deleted');
         res.status(200).json(response);
         
     } catch (error) {
         console.log(error);
         res.status(500).json({error : 'Internal Server Error '})
         
     }
})

router.get('/vote/:candidateID',jwtAuthMiddleware,async(req, res) => {
        
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try {
      
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
          return res.status(404).json({ error: 'candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
          return res.status(404).json({ error: 'user not found' });
        }

        if(user.role == 'admin'){
           return res.status(403).json({message : 'admin is allowed '});   
        }
        if(user.isVoted){
           return res.status(400).json({ message : 'you have  already voted '});
        }

        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (error) {
      console.log(err);
      return res.status(500).json({error: 'Internal Server Error'});
    }
})

roter.get('/vote/:count',async(req, res) =>{
     try {
         
        const candidate = await Candidate.find().sort({voteCount : 'desc'});

        const voteRecord = candidate.map((data) =>{
               return{
                  party: data.party,
                  count: data.voteCount
               }
        });

        return res.status(200).json(voteRecord);
     } catch (error) {
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
     }
})

router.get('/', async (req, res) => {
  try {
      // Find all candidates and select only the name and party fields, excluding _id
      const candidates = await Candidate.find({}, 'name party -_id');

      // Return the list of candidates
      res.status(200).json(candidates);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;