const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Make sure mongoose is required
const Idea = require('../models/Idea');
const User = require('../models/User'); // Ensure User model is required if you're using it
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/admin');
// Route to post a new idea
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, avatar, ideaImage } = req.body;
    const newIdea = new Idea({
      title,
      description,
      userId: req.user.id, // req.user should now be defined after middleware
      userName: req.user.username,
      userEmail: req.user.useremail,
      userAvatar: avatar,
      ideaImage: ideaImage,
      points:1,

    });
    await newIdea.save();
    res.status(201).json(newIdea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to add a comment to an idea
router.post('/:ideaId/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const idea = await Idea.findById(req.params.ideaId);
    if (!idea) return res.status(404).send('Idea not found');

    idea.comments.push({
      userId: req.user.id, // Now req.user is defined thanks to authMiddleware
      userName: req.user.username,
      text
    });

    await idea.save();
    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Route to vote on an idea
router.post('/:ideaId/vote', authMiddleware, async (req, res) => {
  try {
      const { voteType } = req.body;
      const idea = await Idea.findById(req.params.ideaId);
      const voter = await User.findById(req.user.id);

      console.log("Voter found:", voter); // Log the voter data

      if (!idea) {
          return res.status(404).send('Idea not found');
      }
      if (!voter) {
          return res.status(404).send('Voter not found');
      }

      // Modify the upvotes and downvotes count based on the vote type
      if (voteType === 'upvote') {
          idea.upvotes += 1;
      } else if (voteType === 'downvote') {
          idea.downvotes += 1;
      }

      // Calculate karma impact and points
      const karmaEffect = voteType === 'upvote' ? 0.1 * voter.karma : -0.1 * voter.karma;
      const pointEffect = voteType === 'upvote' ? voter.karma : -voter.karma;

      // Update idea owner's karma
      const ideaOwner = await User.findById(idea.userId);
      console.log(idea)
      ideaOwner.karma = Math.max(0.5, Math.min(2.0, ideaOwner.karma + karmaEffect));
      await ideaOwner.save();

      // Update idea points and ensure they remain within the allowed range
      idea.points = Math.max(0.5, Math.min(2.0, idea.points + pointEffect));

      // Add vote to idea's votes array
      idea.votes.push({ voter: voter._id, voteType, voterKarma: voter.karma });

      await idea.save(); // Save any updates to the idea

      res.status(200).json(idea); // Return the updated idea with embedded voting results
  } catch (error) {
      console.error('Error voting on idea:', error);
      res.status(500).json({ message: error.message });
  }
});





// Route to delete a comment from an idea
router.delete('/:ideaId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { ideaId, commentId } = req.params;
    const idea = await Idea.findById(ideaId);
    if (!idea) return res.status(404).send('Idea not found');

    // Remove the comment
    idea.comments = idea.comments.filter(comment => comment._id.toString() !== commentId);
    await idea.save();

    res.status(200).json({ message: 'Comment deleted successfully', idea });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Route to update an idea
router.put('/:ideaId', authMiddleware, async (req, res) => {
  try {
    const { title, description, avatar } = req.body;
    const idea = await Idea.findByIdAndUpdate(req.params.ideaId, {
      title, 
      description, 
      userAvatar: avatar
    }, { new: true }); // The option { new: true } ensures the returned document is the updated one

    if (!idea) return res.status(404).send('Idea not found');

    res.status(200).json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Route to delete an idea
router.delete('/:ideaId', authMiddleware,adminAuthMiddleware, async (req, res) => {
  try {
    const { ideaId } = req.params;
    const idea = await Idea.findByIdAndDelete(ideaId);

    if (!idea) return res.status(404).send('Idea not found');

    res.status(200).json({ message: 'Idea deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});










// Route to get all ideas with comments and votes
router.get('/', async (req, res) => {
  const sortBy = req.query.sort;  // Changed from sortBy to sort

  console.log("Sorting by:", sortBy);

  try {
      let ideas = await Idea.find().lean();

      ideas.forEach(idea => {
          idea.points = (idea.votes || []).reduce((acc, vote) => acc + (vote.voteType === 'upvote' ? 1 : -1) * (vote.voterKarma || 0), 0);
      });

      switch (sortBy) {
          case 'newest':
              ideas.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());
              break;
          case 'oldest':
              ideas.sort((a, b) => a._id.getTimestamp() - b._id.getTimestamp());
              break;
          case 'best':
              ideas.sort((a, b) => b.points - a.points);
              break;
          default:
              ideas.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp()); // Default to newest if no sort provided
              break;
      }

      res.json(ideas);
  } catch (error) {
      console.error('Error retrieving ideas:', error);
      res.status(500).json({ message: error.message });
  }
});





module.exports = router;
