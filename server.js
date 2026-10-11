import exp from 'express';
import {connect} from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import {userRouter} from "./api/userAPI.js";
import {skillRouter} from "./api/skillAPI.js";
import {requestRouter} from "./api/requestAPI.js";
import {adminRouter} from "./api/adminAPI.js";

const app = exp();

dotenv.config();

//bodyparser middleware
app.use(exp.json());

//cookie middleware
app.use(cookieParser());

//routes
app.use('/users', userRouter);
app.use('/skills', skillRouter);
app.use('/requests', requestRouter);
app.use('/admin', adminRouter);

app.get('/', (req, res) => {
  res.send('Student Skill Exchange backend is running');
});


async function connectDB() {

  try {

    await connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

  } catch (err) {

    console.log('Error connecting to MongoDB:', err);
    console.log(err.message);

  }

}

connectDB();


//centralized error handling
app.use((err, req, res, next) => {

  console.log(err.message);
  console.log(err.name);

  if (err.name === 'ValidationError') {

    return res.status(400).json({
      success: false,
      message: err.message
    });

  }

  if (err.name === 'CastError') {

    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });

  }

  if (err.code === 11000) {

    return res.status(409).json({
      success: false,
      message: 'Duplicate value already exists'
    });

  }

  res.status(500).json({
    success: false,
    message: err.message
  });

});