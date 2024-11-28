import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    const conection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const url = `${conection.connection.host}:${conection.connection.port}`;
    console.log(`MongoDB conectado en: ${url}`);
  } catch (error) {
    console.log(`error: ${error.message}`);
    process.exit(1);
  }
};

export default conectarDB;
