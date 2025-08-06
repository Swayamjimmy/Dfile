const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views','src/views');

app.use(express.static('src/public'));

app.get('/' , (req, res) => {
    res.render('index', {user:null});
});

app.listen(PORT, ()=> {
    console.log('Server is running at http://localhost:${PORT}');
});