
message_cloud(27001);

var legend = d3.select("#words_cloud")
    .append("div")
    .style({
        "position":"absolute",
        "top":"26px",
        "right":"5px"
    })
    .append("span")
    .attr("id","words_cloud_id")
    .attr("class","label label-default legend_label")
    .style("background-color","#07a6ff")
    .html("27001");

function message_cloud(route_id) {

    d3.select("#words_cloud_id").html(route_id);
    d3.select("#cloud_div").remove();


    $.ajax({
        url: "/route_station_data",            dataType: "json",           async: true,         type: "GET",           contentType: "application/json",
        data:{
            sub_route_id:route_id
        },
        beforeSend: function () {        },
        success: function (rank_data, textStatus) {

            var nest = d3.nest().key(function (d) {
                return d.station_name
            })

            var s=nest.entries(rank_data);

            s.forEach(function (d) {
                var val = 0;
                d.station_id = d.values[0].station_id;
                d.values.forEach(function (s) {
                    val += s.stay_time
                });
                d.values = val/d.values.length;
            });
            word_cloud(s);
        },
        complete: function () {        },
        error: function () {        }
    });

    function word_cloud(dataset) {

        var cloud = $("#clouds_main");
        var width = cloud.width();
        var height = cloud.height();

        var radius = width/4;        var dtr = Math.PI/180;
        var d=200;

        var mcList = [];
        var active = false;
        var lasta = 1;
        var lastb = 1;
        var distr = true;
        var tspeed=.5;        var size=100;

        var mouseX=0;
        var mouseY=0;

        var howElliptical=1;

        var aA=null;
        var oDiv=null;

        function update() {

            var a;
            var b;

            if(active)
            {
                a = (-Math.min( Math.max( -mouseY, -size ), size ) / radius ) * tspeed;
                b = (Math.min( Math.max( -mouseX, -size ), size ) / radius ) * tspeed;
            }
            else
            {
                a = lasta * 0.98;
                b = lastb * 0.98;
            }

            lasta=a;
            lastb=b;

            if(Math.abs(a)<=0.01 && Math.abs(b)<=0.01)
            {
                return;
            }

            var c=0;
            sineCosine(a,b,c);
            for(var j=0;j<mcList.length;j++) {
                var rx1=mcList[j].cx;
                var ry1=mcList[j].cy*ca+mcList[j].cz*(-sa);
                var rz1=mcList[j].cy*sa+mcList[j].cz*ca;

                var rx2=rx1*cb+rz1*sb;
                var ry2=ry1;
                var rz2=rx1*(-sb)+rz1*cb;

                var rx3=rx2*cc+ry2*(-sc);
                var ry3=rx2*sc+ry2*cc;
                var rz3=rz2;

                mcList[j].cx=rx3;
                mcList[j].cy=ry3;
                mcList[j].cz=rz3;

                per=d/(d+rz3);

                mcList[j].x=(howElliptical*rx3*per)-(howElliptical*2);
                mcList[j].y=ry3*per;
                mcList[j].scale=per;
                mcList[j].alpha=per;

                mcList[j].alpha=(mcList[j].alpha-0.6)*(10/6);
            }

            doPosition();
            depthSort();
        }

        function depthSort() {
            var i=0;
            var aTmp=[];

            for(i=0;i<aA.length;i++)
            {
                aTmp.push(aA[i]);
            }

            aTmp.sort
            (
                function (vItem1, vItem2)
                {
                    if(vItem1.cz>vItem2.cz)
                    {
                        return -1;
                    }
                    else if(vItem1.cz<vItem2.cz)
                    {
                        return 1;
                    }
                    else
                    {
                        return 0;
                    }
                }
            );

            for(i=0;i<aTmp.length;i++)
            {
                aTmp[i].style.zIndex=i;
            }
        }

        function positionAll() {

            var phi=0;
            var theta=0;
            var max=mcList.length;
            var i=0;

            var aTmp=[];
            var oFragment=document.createDocumentFragment();


            for(i=0;i<aA.length;i++)
            {
                aTmp.push(aA[i]);
            }

            aTmp.sort
            (
                function ()
                {
                    return Math.random()<0.5?1:-1;
                }
            );

            for(i=0;i<aTmp.length;i++)
            {
                oFragment.appendChild(aTmp[i]);
            }

            oDiv.appendChild(oFragment);

            for( var i=1; i<max+1; i++){
                if( distr )
                {
                    phi = Math.acos(-1+(2*i-1)/max);
                    theta = Math.sqrt(max*Math.PI)*phi;
                }
                else
                {
                    phi = Math.random()*(Math.PI);
                    theta = Math.random()*(2*Math.PI);
                }

                mcList[i-1].cx = radius * Math.cos(theta)*Math.sin(phi);
                mcList[i-1].cy = radius * Math.sin(theta)*Math.sin(phi);
                mcList[i-1].cz = radius * Math.cos(phi);

                                            }
        }

        function doPosition() {

            var l=oDiv.offsetWidth/2;
            var t=oDiv.offsetHeight/2;
            for(var i=0;i<mcList.length;i++)
            {
                aA[i].style.left=mcList[i].cx+l-mcList[i].offsetWidth/2+'px';
                aA[i].style.top=mcList[i].cy+t-mcList[i].offsetHeight/2+'px';
                                aA[i].style.filter="alpha(opacity="+100*mcList[i].alpha+")";
                aA[i].style.opacity=mcList[i].alpha;
            }
        }

        function sineCosine( a, b, c) {

            sa = Math.sin(a * dtr);
            ca = Math.cos(a * dtr);
            sb = Math.sin(b * dtr);
            cb = Math.cos(b * dtr);
            sc = Math.sin(c * dtr);
            cc = Math.cos(c * dtr);
        }

        var oTag=null;

        var data=[];

        dataset.forEach(function (d) {
            data.push({key:d.key,val:parseInt(d.values),station_id:d.station_id})
        });

        var max_data = d3.max(data,function (d) {
            return d.val;
        });

        var min_data = d3.min(data,function (d) {
            return d.val;
        });

        var cloud_div = d3.select("#clouds_main")
            .append("div")
            .attr("id","cloud_div")
            .attr("width",width)
            .attr("height",height)
            .style({
                "position":"relative",
                "top":"50%",
                "word-break":"keep-all",
                "white-space":"nowrap",
                "margin": "20px auto 0"
            });



        var a = d3.rgb(255,215,0);
        var b = d3.rgb(255,50,0);

        /*var svg = d3.select("#words_cloud")
            .append("div")
            .style({
                "position":"absolute",
                "right":"5px",
                "top":"40%",
                "z-index":"999"
            })
            .append("svg")
            .attr("width",30)
            .attr("height",100);

        var defs = svg.append("defs");

        var linearGradient = defs.append("linearGradient")
            .attr("id","linearColor")
            .attr("x1","0%")
            .attr("y1","100%")
            .attr("x2","0%")
            .attr("y2","0%");

        var stop1 = linearGradient.append("stop")
            .attr("offset","0%")
            .style("stop-color",a.toString());

        var stop2 = linearGradient.append("stop")
            .attr("offset","100%")
            .style("stop-color",b.toString());

        var colorRect = svg.append("rect")
            .attr("x", 15)
            .attr("y",0)
            .attr("width", 8)
            .attr("height", 100)
            .style("fill","url(#" + linearGradient.attr("id") + ")");

        svg.selectAll(".cloud_index")
            .data([40,0])
            .enter()
            .append("text")
            .attr("x",0)
            .attr("y",function (d,i) {
                return i*85+10;
            })
            .text(function (d) {
                return d;
            })
            .style({
                "fill":"#FFFFFF",
                "font-size":"10px"
            });*/

        var linear = d3.scale.linear()
            .domain([min_data,max_data])
            .range([0,1]);

        var compute = d3.interpolate(a,b);

        cloud_div.selectAll(".css")
            .data(data)
            .enter()
            .append("a")
            .style({
                "font-size":function(d){
                    return (d.val>40)? "40px":d.val+"px";},
                "fill":function(d){
                    return compute(linear(d.val)).toString();
                },
                "color":function(d){
                    return compute(linear(d.val)).toString();
                }
            })
            .attr("class","name_message")
            .text(function(d){return d.key})
            .on("click",function (d) {
                mainChart.data_point.features.forEach(function (s) {
                    if(s.properties.station_id === d.station_id)
                    {
                        map.flyTo({center:s.geometry.coordinates });
                        if(mainChart.Msg_pop)
                            mainChart.Msg_pop.remove();
                        mainChart.Msg_pop = new mapboxgl.Popup()
                            .setLngLat(s.geometry.coordinates)
                            .setHTML(s.properties.description)
                            .addTo(map);
                                            }
                });
            });


        oDiv=document.getElementById('cloud_div');
        aA=oDiv.getElementsByTagName('a');

        for(var i=0;i<aA.length;i++)
        {
            oTag={};
            oTag.offsetWidth=aA[i].offsetWidth;
            oTag.offsetHeight=aA[i].offsetHeight;
            mcList.push(oTag);
        }

        sineCosine( 0,0,0 );

        positionAll();

        var active_=false;

        oDiv.onmouseover=function ()
        {
            if(active_)
            active=true;
        };

        oDiv.onmouseout=function ()
        {
                   };
        document.getElementById("words_cloud").ondblclick= function(){
            active_=!active_;
            active=false;
        };

        oDiv.onmousemove=function (ev)
        {
            var oEvent=window.event || ev;

            mouseX=oEvent.clientX-(oDiv.offsetLeft+oDiv.offsetWidth);
            mouseY=oEvent.clientY-(oDiv.offsetTop+oDiv.offsetHeight);

            mouseX/=5;
            mouseY/=5;
        };
        setInterval(update, 30);
    }

}


