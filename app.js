const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const expresshandlebars = require('express-handlebars');
const databaseobject = require('./db');
const { ObjectId } = require('mongodb');
const ObjectID = databaseobject.ObjectID;

app.engine('hbs',expresshandlebars.engine({layoutsDir:'views/',defaultLayout:"main",extname:"hbs"}))
app.set('view engine','hbs');
app.set('views','views');
app.use(bodyparser.urlencoded({extended:Boolean}))

app.get('/',async (req,res)=>{
    let database= await databaseobject.getDatabase();
    const collection = database.collection('cinema');
    const cursor = collection.find({})
    let cinema = await cursor.toArray();

    let message = '';
    let edit_id,edit_cinema;

    if(req.query.edit_id){
        edit_id= req.query.edit_id;
        edit_cinema = await collection.findOne({_id:new ObjectId(edit_id)})
    }

    if(req.query.delete_id){
       await collection.deleteOne({_id:new ObjectId(req.query.delete_id)})  
       return res.redirect('/?status=3')
    }

    switch (req.query.status) {
        case '1':
            message='Added Succesfully'
            break;
        case '2':
            message='Updated Succesfully'
            break;   
        case '3':
            message='Deleted Succesfully'
            break;     
    
        default:
            break;
    } 

    res.render('main',{message,cinema,edit_id,edit_cinema})
})

app.post('/store_cinema',async(req,res)=>{
    let database = await databaseobject.getDatabase();
    const collection = database.collection('cinema');
    let cinema = { movie:req.body.movie,director:req.body.director};
    await collection.insertOne(cinema);
    return res.redirect('/?status=1');
})


app.post('/update_cinema/:edit_id',async(req,res)=>{
    let database = await databaseobject.getDatabase();
    const collection = database.collection('cinema');
    let cinema = { movie:req.body.movie,director:req.body.director};
    let edit_id = req.params.edit_id;
    await collection.updateOne({_id:new ObjectId(edit_id)},{$set:cinema});
    return res.redirect('/?status=2');
})

app.listen(4000,()=>{
    console.log('listening to 4000 port')
})