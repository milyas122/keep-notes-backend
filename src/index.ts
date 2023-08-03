import app from "./app";
import dataSource from "./db";

async function bootstrap() {
  await dataSource.initialize();

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`App is listening on the PORT ${PORT} ..`);
  });
}

bootstrap();
