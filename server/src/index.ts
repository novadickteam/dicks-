import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import app from "./app.js";

const PORT = process.env.PORT ?? 3000;

app.listen(Number(PORT), () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});
