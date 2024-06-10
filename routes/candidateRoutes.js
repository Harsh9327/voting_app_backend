const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const Candidate = require('./../models/candidate');

const checkAdminRole = async (userID) => {
    try{
         const user = await User.findById(userID);
         if(user.role === 'admin'){
             return true;
         }
    }catch(err){
         return false;
    }
 }

// post route for add candidate
router.post('/', jwtAuthMiddleware, async (req, res) =>{
    try{
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'});

        const data = req.body // Assuming the request body contains the candidate data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateId',jwtAuthMiddleware, async (req, res) =>{
    try {
        if(!checkAdminRole(req.user))
            return res.status(403).json({message: 'user does not admin role'});

        const candidateId = req.params.candidateId;
        const updatedcandidateData = req.body;

        const response = await User.findByIdAndUpdate(candidateId, updatedcandidateData, {
            new: true,
            runValidators: true
        })

        if(!response){
            return res.status(404).json({error: 'candidate not found'});
        }

        console.log('candidate data updated');
        res.status(200).json(response);

    } catch (err) {
        console.log(err)
        res.status(500).json({error: 'internal server error'});
    }
})

router.delete('/:candidateId',jwtAuthMiddleware, async (req, res) =>{
    try {
        if(!checkAdminRole(req.user))
            return res.status(403).json({message: 'user does not admin role'});

        const candidateId = req.params.candidateId;

        const response = await User.findByIdAndDelete(candidateId);

        if(!response){
            return res.status(404).json({error: 'candidate not found'});
        }

        console.log('candidate deleted');
        res.status(200).json(response);

    } catch (err) {
        console.log(err)
        res.status(500).json({error: 'internal server error'});
    }
})

router.post('/vote/:candidateID',jwtAuthMiddleware, async (req, res) =>{

    const candidateId = req.params.candidateID;
    const  userId = req.user.id;

    try {
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});
  
router.get('/vote/count', async (req,res) =>{
    try {
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);

    } catch (err) {
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
})


module.exports = router;
