const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const voteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  voteType: { type: String, enum: ['upvote', 'downvote'] },
  voterKarma: Number
});

const ideaSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  userEmail: { type: String },
  userAvatar: { type: String },
  ideaImage: { type: String }, // Ensuring 'ideaImage' is included
  comments: [commentSchema],
  votes: [voteSchema],
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  points: { type: Number, default: 0 },  // Make sure to initialize 'points'
  voterKarma: { type: Number, default: 1 },
  ideaOwnerKarma: { type: Number, default: 1 }
});

const Idea = mongoose.model('Idea', ideaSchema);
module.exports = Idea;
