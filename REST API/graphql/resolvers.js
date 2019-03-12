const User = require('../models/user')
const Post = require('../models/post')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
/* DEFINE LOGIC */

module.exports = {
  createUser: async function ({
    userInput
  }, req) {
    const existingUser = await User.findOne({email: userInput.email})
    let errors = []
    if (!validator.isEmail(userInput.email)) {
      errors.push({message: "Email is invalid"})
    }
    if (validator.isEmpty(userInput.password) || validator.isLength(userInput.password, {max: 7})) {
      errors.push({message: "please choose a better password"})
    }
    if (errors.length > 0) {
      const error = new Error("invalid input")
      error.data = errors
      error.code = 422;
      throw error
    }
    if (existingUser) {
      const error = new Error("User already exists")
      throw error
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12)
    const user = new User({name: userInput.name, email: userInput.email, password: hashedPassword})
    const createdUser = await user.save()
    return ({
      ...createdUser._doc,
      _id: createdUser
      ._id
      .toString()
    })
  },
  
  login: async function ({email, password}) {
    const user = await User.findOne({email: email})
    if (!user) {
      const error = new Error('USer Not Found')
      error.code = 401
      throw error
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      const err = new Error('Password is incorrect')
      err.code = 401
      throw err
    }
    const token = jwt.sign({
      userId: user._id.toString(),
      email: user.email
    }, "somesupersecretsecret", {expiresIn: '1h'})
    return {
      token: token,
      userId: user._id.toString()
    }
  },
  
  createPost: async function({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: 'Title is invalid.' });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: 'Content is invalid.' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('Invalid user.');
      error.code = 401;
      throw error;
    }
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
  },
}
