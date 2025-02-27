import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
} from "../controllers/tareaControllers.js";

const router = express.Router();

router.post("/", checkAuth, agregarTarea);
router
  .route("/:id")
  .get(checkAuth, obtenerTarea)
  .put(checkAuth, actualizarTarea)
  .delete(checkAuth, eliminarTarea);
router.post("/estado/:id", checkAuth, cambiarEstado);

export default router;
