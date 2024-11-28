import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  const existeProyecto = await Proyecto.findById(proyecto);

  if (!existeProyecto) {
    const error = new Error("No existe ningún proyecto asociado a ese id.");
    return res.status(404).json({ msg: error.message });
  }
  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes permiso para añadir tareas.");
    return res.status(404).json({ msg: error.message });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  //Comprobando si existe la tarea
  if (!tarea) {
    const error = new Error("No existe niguna tarea asociada a ese id.");
    return res.status(404).json({ msg: error.message });
  }
  //Comprobando que la persona que está autenticada es la que creó el proyecto
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "Usted no tiene permiso para acceder a esta tarea."
    );
    return res.status(403).json({ msg: error.message });
  }

  res.json(tarea);
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  //Comprobando si existe la tarea
  if (!tarea) {
    const error = new Error("No existe niguna tarea asociada a ese id.");
    return res.status(404).json({ msg: error.message });
  }
  //Comprobando que la persona que está autenticada es la que creó el proyecto
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "Usted no tiene permiso para acceder a esta tarea."
    );
    return res.status(403).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.estado = req.body.estado || tarea.estado;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("No existe ninguna tarea asociada a ese id");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "Usted no tiene autorización para eliminar esta tarea."
    );
    return res.status(403).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);

    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);

    res.json({ msg: "Tarea eliminada correctamente." });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("No existe ninguna tarea asociada a ese id");
    return res.status(404).json({ msg: error.message });
  }

  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error(
      "Usted no tiene autorización para eliminar esta tarea."
    );
    return res.status(403).json({ msg: error.message });
  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;

  await tarea.save();

  const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");

  res.json(tareaAlmacenada);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
