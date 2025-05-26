import app from './app.js';
// import { initializeDatabase } from './models/userModel.js';

// initializeDatabase();

import connection from './config/database.js';

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL!');
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
})