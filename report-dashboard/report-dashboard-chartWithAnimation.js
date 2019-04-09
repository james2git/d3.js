
function chart_showFullDetail(dtset,CATEGORY_No,CHARTAreaString,HowManyMonths,ValueString){
    //此处为在CSS GRID>>CONTENT里的报表绘制的代码
    var dt = dtset;
    // //必须大于12个月(数组里会保留初始的那个月)
    // if (HowManyMonths<dt.dates.length && HowManyMonths>=12) {
        
    //         dt.values[CATEGORY_No].splice(0,dt.dates.length-HowManyMonths-1);
              
    // }


    // var containerWidth = 120;
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 50, bottom: 50, left: 50},
        width_parent = 900 , //- margin.left ; //- margin.right,
        height_parent = 300,
        width = width_parent - margin.left - margin.right,
        height = height_parent - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");
    dt.dates.forEach(function(ddd,i,eee) {
        try {
            if (parseTime(ddd)) {                
                eee[i] = parseTime(ddd);
                // console.log(i+": for time parse:  "+ddd);    
            }
        } catch (error) {
            // console.log(i+" : no need time parsing>>>"+ddd);
        }
        
    })

    // set the ranges
    var x = d3.scaleTime().range([0, width]);  // 生成时间比例尺
    // var x =  d3.scaleOrdinal()        // 生成序数比例尺
    //     .domain(dt.dates)
    //     .range([0, width]);

    var y = d3.scaleLinear().range([height, 0]); //y轴
    var y_1 = d3.scaleLinear().range([height, 0]); //第1条线
    // var y_2 = d3.scaleLinear().range([height, 0]);//可用于第2条线，第3条线etc...

    // define the 1st line
    var c1 = CATEGORY_No;//此处表示values[i]的第几组数据,也是category[]中的序号
    // var c2=c1+1;
    // var c3=c1+2;
    // var v1=dt.values[c1];
    // console.log(v1);

    //生成标准化的K/V，方便之后使用dat.key[0],dat.value[0],dat.value2[0]引用
     dat= {
         "date":dt.dates.slice(0-HowManyMonths-1),
         "price":dataset.values[c1].slice(0-HowManyMonths-1),
         "growth":dt.values[c1],
         "growth_cumulative": growthdata_cumulative.values[c1],
         "category": dt.category[c1]  //此处只取了一个值，也可以根据需要取整个数组dt.category
    }

 
    // define the y=0 line
    var valueline_y_zero = d3.line()
        .x(function(d,i) { return x(dat.date[i]); })
        .y(function(d,i) { return y(0);      });
    
    // define the 1st line
     valueline_y = d3.line()
        .x(function(d,i) { return x(dat.date[i]); })
        .y(function(d,i) { return y(dat[ValueString][i]);      });
    

    // // define the 2nd line
    // var valueline_y1 = d3.line()
    // .x(function(d,i) { return x(dat.date[i]); })
    // .y(function(d,i) { return y_1(dat.growth[i]);      });
    

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin

    // /////////////////////////////////////////////
    // ////////////svg_parent 略去不用///////////////
    // var svg_parent = d3.select(CHARTAreaString).append("svg")
    // .attr("width", "100%" ) //width_parent ) //+ margin.left + margin.right)
    // .attr("height", "100%" ) //height_parent)  // height + margin.top + margin.bottom)
    // .attr("class", "svg_parent")
    // .append("g")
    // .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    // /////////////////////////////////////////////
    // /////////////////////////////////////////////
    
    // 调整区域大小
    // console.log( svg_parent.node().getBoundingClientRect().bottom );
    // console.log( d3.select(CHARTAreaString).node().getBoundingClientRect().bottom);
    // let which_bottom1 = svg_parent.node().getBoundingClientRect().bottom ;
    // var svg = svg_parent.append("svg")
    // ////////////svg_parent 略去不用///////////////
    
     var svg = d3.select(CHARTAreaString).append("svg")
        .attr("width", width + margin.left  + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
        // .attr("transform","translate(" + 0 + "," + 0 + ")");

    let which_bottom1 = svg.node().getBoundingClientRect().bottom ;
    let which_bottom2 = d3.select(CHARTAreaString).node().getBoundingClientRect().bottom;

    if (which_bottom1 > which_bottom2) {
        d3.select(CHARTAreaString).attr("style",{"height": which_bottom1 +100}); 
    }

    
    // Scale the range of the data
    x.domain(d3.extent(dat.date, function(d,i) { return d; }));//;;;;;;;;;;;;;
    // y.domain([0, d3.max(data, function(d) {return Math.max(d.values[c]);})]);
    // y_1.domain([0, d3.max(data, function(d) {return Math.max(d.values[c2]); })]);
    // y_2.domain([0, d3.max(data, function(d) {return Math.max(d.values[c3]); })]);
    // y.domain(d3.extent(v1, function(d) { return d; }));
    // y_2.domain(d3.extent(v3, function(d) { return d; }));
    
    y.domain(d3.extent([0,0].concat(dat[ValueString]), function(d) { return d; })); //最小值0

    // var idomain=d3.extent(dat.growth.concat([-0.05,0.05]), function(d) { return d; })  //最大最小值+-5%
    // y_1.domain(d3.extent(dat.growth, function(d) { return d; }));
    // y_1.domain(idomain);
    // y_2.domain(idomain);s
    

    // // Add the valueline path. Y=0
    svg.append("path")
        .datum(dat[ValueString])
        .attr("class", "line")
        .attr("d", valueline_y_zero(dat[ValueString]))
        .style("stroke-dasharray", "4")
        .style("stroke", "#A9A9A9")
        .style("stroke-width", "1.8px")
        .style("opacity", "0.6");

    // // Add the valueline path.
    var line1 = svg.append("path")
        .data(dat[ValueString])
        .attr("class", "line")
        .attr("d", valueline_y(dat[ValueString]));

    // // // Add the valueline2 path.
    // svg.append("path")
    //     .data(dat.growth)
    //     .attr("class", "line growth")
    //     .attr("d", valueline_y1(dat.growth));

    // Add the X Axis
    var xAxis = d3.axisBottom(x);
    xAxis.tickFormat(d3.timeFormat("%Y-%b")); //x轴下标数量及格式
    xAxis.tickSize(12) ; 
    svg.append("g")
        .attr("class", "axisBottom")
        .attr("transform", "translate(0," + height + ")") //显示在最底部
        // .attr("transform", "translate(0," + y(0) + ")") //显示在Y=0处
        // .attr("transform", "translate(0," + (height-(height-y(0))) + ")")
        .call(xAxis)
                .selectAll("text")   //.,,,,,,,,,,,,,
                .style("text-anchor", "end")
                // .attr("dx", "-.8em")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "translate(53,0)" + "rotate(-65)");
                        // .remove(); ////;;;;;;

    // console.log(height,width, y(0));
   
    
    // Add the y Axis
    // var y_axis = d3.svg.axis().orient("left").scale(y);
    var y_axis = d3.axisLeft(y);
    // y_axis.ticks(6).tickFormat(d3.format("+.0%"));
    // y_axis.tickFormat(d3.format(".0%"));
    y_axis.ticks(6).tickSize(8) ;
    
    //设置百分比格式
    if (ValueString.slice(0,6).toUpperCase()=="GROWTH") {
        y_axis.tickFormat(d3.format("+.1%"));
    }

    svg.append("g")
        .attr("class", "axisSteelBlue")
        //.attr("class", "axisRed")
        // .call(d3.axisLeft(y));
        .call(y_axis);
                //.selectAll("text").remove(); ////;;;;;;;;;;;;;

    // Add the y_ Axis --- simple way 2
    // svg.append("g")
    //     .attr("class", "axisSteelBlue")
    //     // .attr("class", "axisRed")
    //     .attr("transform", "translate( " + 0 + ", 0 )")
    //     .call(d3.axisLeft(y))
                    ;

    // // // Add the y_1 Axis
    // svg.append("g")
    //     .attr("class", "axisPurple")
    //     .attr("transform", "translate( " + (width) + ", 0 )")
    //     .call(d3.axisRight(y_1)
    //                 .ticks(6).tickFormat(d3.format("+.0%"))
    //         );
    console.log('width,height:'+ width +',' + height);
 /*   
    //加:AREA + areagradient
    //-------------------------------------------------
var    x_zero_baselinevalue = 0;//2000
    ///////////////////////////////////////////////////
///////////// Create the gradient /////////////////
///////////////////////////////////////////////////
var ymin=d3.min(v1, function(d,i) { return v1[i]; });
var ymax=d3.max(v1, function(d,i) { return v1[i]; });
var move_per;
if (ymin==ymax) {
    move_per=0;
}
else{
    move_per=-(y_1(ymin)-y_1(x_zero_baselinevalue)-0.5*(y_1(ymin)-y_1(ymax)))/(y_1(ymin)-y_1(ymax));
}


//Define the gradient below the line chart
// d3.selectAll('defs').remove();
var areaGradient = svg.append('defs')
		.append("linearGradient")                
        .attr('id','areaGradient'+c1 +CHARTAreaString.slice(1))
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%")

        .attr("gradientTransform", "translate(0," + move_per + ")")

        .selectAll("stop")
        .data([                             
            {offset: "0%", color: "#FF3757", opacity: 0.9}, 
			{offset: "50%", color: "#FF7070", opacity: 0.7},      
            {offset: "50%", color: "#FFDE74", opacity: 0.7},
			{offset: "100%", color: "green", opacity: 0.9}   
        ])
        .enter().append("stop")         
        .attr("offset", function(d) { return d.offset; })   
        .attr("stop-color", function(d) { return d.color; })
        .attr("stop-opacity", function(d) { return d.opacity; });

//Initiate the area line function
var areaFunction = d3.area()
//// .interpolate("monotone")
.curve(d3.curveMonotoneX)
.x(function(d,i) { return x(dt.dates[i]); })
.y0(y_1(x_zero_baselinevalue))
.y1(function(d,i) { return y_1(v1[i]); })
// .x(function(d) { return xScale(d.date); })
// .y0(height)
// .y1(function(d) { return yScale(d.number); });

//draw
svg.append("path")
.attr("class", "area")
.style("fill", "url(#areaGradient"+c1+CHARTAreaString.slice(1)+")")
.attr("d", areaFunction(v1));

    //-------------------------------------------------

   */ 


formatMonth=d3.timeFormat("%Y-%b");
formatPercentage=d3.format("+.1%");
formtNumber=d3.format(",");

 //加category标题
var title_Y=0
var title1 = ValueString.toUpperCase();
if (ValueString.toUpperCase()=="GROWTH") {
    title1 = (ValueString  + " % (Month Over Month)").toUpperCase(); // 输出标题
}     

else if (ValueString.toUpperCase()=="GROWTH_CUMULATIVE") {
    title1 = (ValueString  + " % (of 12 Months)").toUpperCase(); // 输出标题
}     
    svg.append('g') // 输出标题
    .attr("class","text_category")
    .append('text')
    .attr('fill', '#058')
    .attr('font-size', '18px')
    .attr('font-weight', '700')
    // .attr('transform', 'translate(' + 0 + ',' + 20 + ')')
    .attr('text-anchor', 'left')
    .attr('x', width*0.5 - title1.length*0.5*9)  //+margin.left)
    .attr('y', title_Y)
    .text(title1); //slice取99个字符
var title2 = dat.category.slice(0,99); //slice取99个字符
    svg.append('g') // 输出标题
    .attr("class","text_category")
    .append('text')
    .attr('fill', '#058')
    .attr('font-size', '16px')
    .attr('font-weight', '700')
    // .attr('transform', 'translate(' + 0 + ',' + 20 + ')')
    .attr('text-anchor', 'left')
    .attr('x', width*0.5-title2.length*0.5*7)  //+margin.left)
    .attr('y', title_Y+20)
    .text(title2 ); 
var title3 = formatMonth(dat.date.slice(-13)[0]) +'  To  '+ 
    formatMonth(dat.date.slice(-1)[0]); // 输出标题
    svg.append('g') // 输出标题
    .attr("class","text_category")
    .append('text')
    .attr('fill', '#058')
    .attr('font-size', '12px')
    .attr('font-weight', '700')
    // .attr('transform', 'translate(' + 0 + ',' + 20 + ')')
    .attr('text-anchor', 'left')
    .attr('x', width*0.5-title3.length*0.5*5)  //+margin.left)
    .attr('y', title_Y+20+15)
    .text(title3 ); 

// Define the div for the tooltip
// var tooltip = dat.category.slice(0,99); //slice取99个字符
// var tooltip_in = svg.append('g') // 输出标题
//     .attr("class","text_tooltip")
//     .append('text')
//     .attr('fill', '#058')
//     .attr('font-size', '16px')
//     .attr('font-weight', '800')
//     .attr('text-anchor', 'left')
//     .attr('x', width*0.9)  //+margin.left)
//     .attr('y', height-30)
//     .text(function(d,i){
//         return dat[ValueString][i];
//     }); //slice取99个字符


if (ValueString.toUpperCase()=="GROWTH") {
    // function drawBarChart_Gradient(svg,dat,v1,c1,x, y_1,CHARTAreaString,width,height,margin) 
    drawBarChart_Gradient(svg,dat,dat[ValueString], c1, x , y, CHARTAreaString,width,height,margin); //绘制柱状图 


}

if (ValueString.toUpperCase()=="GROWTH_CUMULATIVE") {
    // function drawArea_Gradient(svg,v1,c1,y_1,CHARTAreaString) 
    drawArea_Gradient(svg,dat,dat[ValueString], c1,x , y, CHARTAreaString); //绘制累积图面积 
        // // Add the valueline path.
        line1.remove();
        // line1 = svg.append("path")
        // .data(dat[ValueString])
        // .attr("class", "line")
        // .attr("d", valueline_y(dat[ValueString]))
        // .interpolate("curveMonotoneX");//(d3.curveMonotoneX);
        
        //////////////////////////////
        //d3.line 数据模板--数据结构必须严格相同
        //////////////////////////////
        // var lineData = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
        //          { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
        //          { "x": 80,  "y": 5},  { "x": 100, "y": 60}];
        lineData = [];
        for (let i = 0; i < dat.date.length; i++) {   
            lineData[i] = {
                "x": dat.date[i],
                "y": dat[ValueString][i]
                };
            }
        //线生成器
        var lineFunction = d3.line()
                                .x(function(d,i) { return x(d.x); })
                                .y(function(d) { return y(d.y); })
                                //.interpolate("curveMonotoneX");
                                .curve(d3.curveMonotoneX);

        // //svg容器
        // var svgContainer = d3.select("body").append("svg")
        //                                     .attr("width", 200)
        //                                     .attr("height", 200);
        // var svgContainer = svg;
        //把path扔到容器中，并给d赋属性
        // var lineGraph = svgContainer  .append("path")
        lineGraph =svg.append("path")
                                    .attr("d", lineFunction(lineData))
                                    .attr("stroke", "steelblue")
                                    .style("opacity", 1)
                                    .attr("stroke-width", "2px" )
                                    .attr("fill", "none");
                
// var line2 = svg.append("path")
//     .data(dat[ValueString])
//     .attr("class", "line2")
//     .attr("stroke", "black")
//     .attr("stroke-width", "2px" )
//     .attr("fill", "none")
//     .attr("d", valueline_y(dat[ValueString]));

}


////////////////////////////////////////
 //第二个柱状图也画scatterplot
 ///////////////////////////////////////
 if ( true ||  ValueString.toUpperCase()!="GROWTH" ) {

    // Add the scatterplot
    svg.selectAll("dot")	
        .data(dat[ValueString])			
        .enter().append("circle")	
        .attr("class","dotdot")							
        .attr("r", 5)		
        .style("fill","Coral")
        .style("opacity",0.8)
        .attr("cx", function(d,i) { return x(dat.date[i]); })		 
        .attr("cy", function(d,i) { return y(dat[ValueString][i]); })		;

    svg.selectAll(".dotdot")
        .on("mouseover", function(d,i) {		
            d3.select(this).style("fill","blue")
                            .attr("r", 10)   //SCATTER DOT SIZE 散点的尺寸	
                            .style("opacity",0.4);
        
    // console.log("this___:",this);

        svg.append('g') // 输出标题1:日期
            .attr("class","text_tooltip")
            .append('text')
            .attr('fill', '#058')
            .attr('font-size', '16px')
            .attr('font-weight', '800')
            .attr('text-anchor', 'left')
            .attr('x', x(dat.date[i]) -         40) 
            .attr('y', y(dat[ValueString][i]) + 35)		
            .text(formatMonth (dat.date[i]) )	;
    
            // console.log( d3.event.pageX,d3.event.pageY,dat[ValueString][i]);
            console.log( ValueString.toUpperCase(), d3.event.pageX,d3.event.pageY,dat[ValueString][i]);
            
            svg.append('g') // 输出标题2:数值
            .attr("class","text_tooltip")
            .append('text')
            .attr('fill', '#058')
            .attr('font-size', '16px')
            .attr('font-weight', '800')
            .attr('text-anchor', 'left')
            .attr('x', x(dat.date[i]) -         40) 
            .attr('y', y(dat[ValueString][i]) + 50)		
            .text(function() {

                if ("GROWTH"== ValueString.slice(0,6).toUpperCase()) {
                return formatPercentage( dat[ValueString][i])
                }        
                else{return formtNumber(dat[ValueString][i])}     	
                
            } );

        // console.log( d3.event);
        
        })
    .on("mouseout", function(d,i) {		
        d3.select(this).style("fill","Coral").style("opacity",0.8).attr("r", 5);	
        d3.selectAll('.text_tooltip').remove();
    })
    ;
}

// d3.select("#fileselector").attr("visibility","false");

// console.log(ymin,ymax,move_per,y_1(ymin),y_1(ymax),y(0));
};  






/////////////////---///////////////////////////////////////////////////////////////////////////////////
/////////////////drawArea_Gradient/////////////////////////////////////////////////////////////////////
/////////////////---///////////////////////////////////////////////////////////////////////////////////




function drawArea_Gradient(svg,dat,v1,c1,x, y_1,CHARTAreaString) {
 
    var    x_zero_baselinevalue = 0;//2000
        ///////////////////////////////////////////////////
    ///////////// Create the gradient /////////////////
    ///////////////////////////////////////////////////
    var ymin=d3.min(v1, function(d,i) { return v1[i]; });
    var ymax=d3.max(v1, function(d,i) { return v1[i]; });
    var move_per;
    if (ymin==ymax) {
        move_per=0;
    }
    else{
        move_per=-(y_1(ymin)-y_1(x_zero_baselinevalue)-0.5*(y_1(ymin)-y_1(ymax)))/(y_1(ymin)-y_1(ymax));
    }

    //Define the gradient below the line chart
    // d3.selectAll('defs').remove();
    console.log(CHARTAreaString)
    var areaGradient = svg.append('defs')
            .append("linearGradient")                
            .attr('id','areaGradient'+c1 +CHARTAreaString.slice(1))  //去掉第一个点字符"."
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%")

            .attr("gradientTransform", "translate(0," + move_per + ")")

            .selectAll("stop")
            .data([                             
                {offset: "0%", color: "#FF3757", opaciopacity: 0.9}, 
                {offset: "50%", color: "#FF7070", opacity: 0.7},      
                {offset: "50%", color: "#FFDE74", opacity: 0.7},
                {offset: "100%", color: "green", opacity: 0.9}   
            ])
            .enter().append("stop")         
            .attr("offset", function(d) { return d.offset; })   
            .attr("stop-color", function(d) { return d.color; })
            .attr("stop-opacity", function(d) { return d.opacity; });

    //Initiate the area line function
    var areaFunction = d3.area()
    //// .interpolate("monotone")
    .curve(d3.curveMonotoneX)
    .x(function(d,i) { return x(dat.date[i]); })
    .y0(y_1(x_zero_baselinevalue))
    .y1(function(d,i) { return y_1(v1[i]); })
    // .x(function(d) { return xScale(d.date); })
    // .y0(height)
    // .y1(function(d) { return yScale(d.number); });

    //draw area
    svg.append("path")
    .attr("class", "area")
    .style("fill", "url(#areaGradient"+c1+CHARTAreaString.slice(1)+")")
    .attr("d", areaFunction(v1));
    svg.append("text")  //加标题
    .attr('class','titletext')
    .attr("transform", "rotate(-90)")
    .attr("x", 5)
    .attr("y", 10)
    .attr("dy", ".51em")
    .style("text-anchor", "end")
    .text("12 Month Cumulative%");

}
