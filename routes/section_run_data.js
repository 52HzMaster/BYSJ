/**
 * Created by Liang Liu on 2018/1/20.
 */
var express = require('express');
var router = express.Router();
var d3 = require('./d3.min');

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';

//获取路段速度 渲染路段
router.get('/section_run_data', function(req, res, next) {
    var date_extent=req.query.date_extent;
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        collection.find({
            "start_date_time" :{$gte:new Date(date_extent[0]),$lte:new Date(date_extent[1])}
        }).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            callback(result);
        });
    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            var nest = d3.nest().key(function (d) {
                return d.section_id;
            });
            var section_data = nest.entries(result);
            for(var i=0;i<section_data.length;i++){
                if(section_data[i].key === "null") section_data.splice(i,1);
            }
            for(i=0;i<section_data.length;i++){
                if(section_data[i].key>2611) section_data.splice(i,1);
            }
            section_data.forEach(function (d) {
                var sum =0;
                d.values.forEach(function (s) {
                    sum += s.speed;
                });
                d.values = parseFloat(sum/d.values.length).toFixed(2);
            });
            res.json(section_data);
            //console.log(result);
            db.close();
        });
    });

});


router.get('/section_id_data', function(req, res, next) {

    var section_id =parseInt(req.query.section_id);
    var date_extent = req.query.date_extent;

    //console.log(typeof(section_id),date_extent);

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        collection.find({section_id:section_id,start_date_time:{$gte:new Date(date_extent[0]),$lte:new Date(date_extent[1])}},{
            _id:0,id:0,product_id:0,
            from_station_id:0,from_station_name:0,target_station_id:0,target_station_name:0,
            section_id:0,speed:0,type:0,end_date_time:0
        }).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            callback(result);
        });
    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            res.send(result);
            //console.log(result);
            db.close();
        });
    });

});

//spiral_line
router.get('/spiral_data', function(req, res, next) {

    var route_id = req.query.sub_route_id;
    var date_extent=req.query.date_extent;

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        collection.find({
            "sub_route_id":route_id,
            "start_date_time" :{$gte:new Date(date_extent[0]),$lte:new Date(date_extent[1])}
        }).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            callback(result);
        });
    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            res.json(result);
            //console.log(result);
            db.close();
        });
    });

});

//time_line
router.get('/time_line_data', function(req, res, next) {

    var section_id = req.query.section_id;
    console.log(section_id);

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        collection.find({
            "section_id":parseInt(section_id),
            'stay_time':{$lte:300},
            start_date_time:{$gte:new Date(2016,0,1),$lte:new Date(2016,0,7)}},
            {
            "_id":0,
            "id":0,
            "end_date_time":0,
            "product_id":0,
            "route_id": 0,
            "section_id": 0,
            "speed":0,
            "type":0
        }).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            callback(result);
        });
    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            res.json(result);
            db.close();
        });
    });

});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
