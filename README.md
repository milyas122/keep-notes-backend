# Google Keep Notes APIs

## Dev Setup
1. You must have installed mysql locally or docker (docker-compose) in order to run the project.

2. If you wanna spin up mysql instance via docker-compose, you can run the following command
```
docker-compose up -d
```

3. Need to create .env file similar to .env.example. And put the credentials there before starting the dev server.
e.g. 
```
DB_HOST=localhost
DB_DATABASE=keep-notes
DB_USERNAME=root
DB_PASSWORD=somepassword
DB_PORT=3306
```

4. You can run the following command to run the server
```
npm run dev
```

If you don't wanna watch files, you can use the alternative command to run the server i.e. 
```
npm start
```

## Database (TypeORM)
You must define all the TypeORM entities in the /db/entities folder. I've already added one user entity to get started.