import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ?? 3000;
const ENV  = process.env.NODE_ENV ?? 'development';

function main(): void {
  console.log(`✅ Proyecto corriendo`);
  console.log(`   Entorno : ${ENV}`);
  console.log(`   Puerto  : ${PORT}`);
  console.log(`\n🚀 ¡Hackathon en marcha! Agrega tu código en src/`);
}

main();
