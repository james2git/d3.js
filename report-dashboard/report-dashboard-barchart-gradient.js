
//////////////////////////////////////
function drawBarChart_Gradient(svg,dat,v1,c1,x, y_1,CHARTAreaString,width,height,margin) {
 
    ///////////////////////////////////////////////////
    ///////////// Create the gradient /////////////////
    ///////////////////////////////////////////////////
    var    y_zero_baselinevalue = 0;//20000
    var ymin=d3.min(v1, function(d,i) { return v1[i]; });
    var ymax=d3.max(v1, function(d,i) { return v1[i]; });
    var move_per;
    if (ymin==ymax) {
        move_per=0;
    }
    else{
        move_per=-(y_1(ymin)-y_1(y_zero_baselinevalue)-0.5*(y_1(ymin)-y_1(ymax)))/(y_1(ymin)-y_1(ymax));
    }

    //Define the gradient below the line chart
    // d3.selectAll('defs').remove();
    console.log(CHARTAreaString)
    var areaGradient_positive = svg.append('defs')
            .append("linearGradient")                
            .attr('id','barGradient_positive'+c1 +CHARTAreaString.slice(1))  //去掉第一个点字符"."
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%")

            .attr("gradientTransform", "translate(0," + move_per + ")")

            .selectAll("stop")
            .data([                             
                {offset: "0%", color: "#FF3757", opaciopacity: 0.9}, //红
                {offset: "100%", color: "#FF7070", opacity: 0.7},      
                // {offset: "50%", color: "#FF7070", opacity: 0.7},      
                // {offset: "50%", color: "#FFDE74", opacity: 0.7},
                // {offset: "100%", color: "green", opacity: 0.9}   
            ])
            .enter().append("stop")         
            .attr("offset", function(d) { return d.offset; })   
            .attr("stop-color", function(d) { return d.color; })
            .attr("stop-opacity", function(d) { return d.opacity; });
    var areaGradient_negative = svg.append('defs')
            .append("linearGradient")                
            .attr('id','barGradient_negative'+c1 +CHARTAreaString.slice(1))  //去掉第一个点字符"."
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%")

            .attr("gradientTransform", "translate(0," + move_per + ")")

            .selectAll("stop")
            .data([                             
                // {offset: "0%", color: "#FF3757", opaciopacity: 0.9}, //红
                // {offset: "50%", color: "#FF7070", opacity: 0.7},      
                {offset: "0%", color: "#FFDE74", opacity: 0.7},
                {offset: "100%", color: "green", opacity: 0.9}   
            ])
            .enter().append("stop")         
            .attr("offset", function(d) { return d.offset; })   
            .attr("stop-color", function(d) { return d.color; })
            .attr("stop-opacity", function(d) { return d.opacity; });

    // //Initiate the area line function
    // var barFunction = d3.area()
    // //// .interpolate("monotone")
    // .curve(d3.curveMonotoneX)
    // .x(function(d,i) { return x(dat.date[i]); })
    // .y0(y_1(y_zero_baselinevalue))
    // .y1(function(d,i) { return y_1(v1[i]); })


var x = d3.scaleBand()
    .domain(dat.date)
    .range([0 , width ])
    .padding(0).align(0).paddingInner(0.7)
    .paddingOuter(0)
    ;

var y = d3.scaleLinear()
    .domain(d3.extent(v1))
    .range([height , 0]);
y=y_1;  //一样可行
var xAxis = d3.axisBottom(x);
// xAxis = g => g
//     .attr("transform", `translate(0,${height })`)
//     .call(d3.axisBottom(x))
    // .call(g => g.select(".domain").remove());
            ;
var yAxis = d3.axisLeft(y);
// yAxis = g => g
//     // .attr("transform", `translate(${margin.left},0)`)
//     .call(d3.axisLeft(y))
    // .call(g => g.select(".domain").remove())
;


// svg.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height + ")")
    // .call(xAxis);

// svg.append("g")
//     .attr("class", "y axis")
//     .call(yAxis);
  svg.append("text")  //加标题
    .attr('class','titletext')
    .attr("transform", "rotate(-90)")
    .attr("x", 5)
    .attr("y", 5)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("MOM%");

var bars = svg.selectAll(".bar")
    .data(v1)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d,i) { return   x(dat.date[i]); })
    .attr("width", width/v1.length -20)
    .attr("y", function(d,i) { return  (v1[i]<=0)?  y(0) : y(v1[i]); })
    .attr("height", function(d,i) { return Math.abs(y(0) - y(v1[i])); })
    .style("fill",  function(d,i) { return (v1[i]>=0) ? "url(#barGradient_positive"+c1+CHARTAreaString.slice(1)+")"  :   "url(#barGradient_negative"+c1+CHARTAreaString.slice(1)+")"
            ;})
    // .on('mouseover', tip.show)
    // .on('mouseout', tip.hide)
    ;

    tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-30, 20])
        .html(function(d,i) {
        return "<strong style='color:SlateBlue'> "+  formatMonth(dat.date[i]) + ": </strong><span style='color:SlateBlue'><strong>" + formatPercentage( v1[i]) + "</strong> </span>";
        })
    svg.call(tip);
    bars.on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        ;
}
