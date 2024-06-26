const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');

const server = createServer(app);
const io = new Server(server);
var globalVariable ='';



const indexRouter = require('./routes')
const userRouter = require('./routes/user')
const videoRouter = require('./routes/video')
const adminRouter = require('./routes/admin')
const valuesRouter = require('./routes/values')
//database
const conn = require('./config/database')


const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');


app.use(cors());
app.use(express.json());


app.use(express.urlencoded({extended : true}));

app.use(bodyParser.urlencoded({ extended: false} ))
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'react-project/build')));
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'react-project/build/index.html'));
})


// router 
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/video', videoRouter);
app.use('/admin', adminRouter)
app.use('/values',valuesRouter)

app.set('port', process.env.PORT || 3001); 

app.post('/sensor-data', (req, res) => {
    const data = req.body.data
    console.log('Received sensor value:', data);
    // 여기서 센서 값을 처리하거나 저장하는 작업을 수행할 수 있습니다.
    res.sendStatus(200); 
    
    io.emit('sensorData', data);
    const sql2 = "insert into alert values('123',now());"

    conn.query(sql2, (err,rows)=>{
        console.log('침입 데이터 업데이트');
    })

});

io.on('connection', (socket)=>{

    console.log("Connected to Client")
    
    
    socket.on('hello', (data)=>{
        console.log(data.message)
    })

    if(globalVariable !== ''){
        socket.emit('doorLock', { data : "침입자 발생!" })

    }
    socket.emit('hello', 'world');



    socket.on('disconnect', ()=>{
        console.log('Client disconnected');
    })


})


server.listen(app.get('port'), ()=>{
    console.log(`listening to port : ${app.get('port')}`);
});