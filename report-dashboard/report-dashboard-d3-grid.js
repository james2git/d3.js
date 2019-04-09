/*
FileReader共有4种读取方法：
1.readAsArrayBuffer(file)：将文件读取为ArrayBuffer。
2.readAsBinaryString(file)：将文件读取为二进制字符串
3.readAsDataURL(file)：将文件读取为Data URL
4.readAsText(file, [encoding])：将文件读取为文本，encoding缺省值为'UTF-8'
*/

var wb;//读取完成的数据
var rABS = false; //是否将文件读取为二进制字符串

function importf(obj) {//导入
    if(!obj.files) {
        return;
    }
    var f = obj.files[0]; 
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = e.target.result;
        if(rABS) {
            wb = XLSX.read(btoa(fixdata(data)), {//手动转化
                type: 'base64'
            });
        } else {
            wb = XLSX.read(data, {
                type: 'binary'
            });
        }
        //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
        //wb.Sheets[Sheet名]获取第一个Sheet的数据
        //for(var i=0;i<wb.SheetNames.length;i++){
　　　　　// 　datajason=JSON.parse(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]]));
        arr=new Array();
        for(var i=0;i<wb.SheetNames.length;i++){
            arr[i]=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]], {header:1, raw:false});
        };
        var tempstr="";
        //删除空行row;"YoY" ||MoM
        for (let index = 0; index < arr.length; index++) {
            //console.log(index + ": ");
            for (let row = 0; row < arr[index].length; row++) {
                //console.log(index + ": "+row);
                if (!arr[index][row][0]){ //若此行首列为空值
                    arr[index].splice(row,1);row--; continue;
                }
                
                else{
                    tempstr = arr[index][row][0];
                    tempstr=tempstr.replace(/(^\s+)|(\s+$)/g, "");//删除首尾空格
                    //若此行为"YoY" ||MoM || ||
                    // if (tempstr=="YoY" || tempstr == "MoM" || tempstr.slice(0,4)=="2016" || tempstr.slice(0,4)=="2017"){ 
                    if (tempstr=="YoY" || tempstr == "MoM" ){ 
                            arr[index].splice(row,1); row--; continue;
                    }
                }

            }
        }
            
    
        //数据清理
        for (let index = 0; index < arr.length; index++) {            
            for (let row = 0; row < arr[index].length; row++) {                
                for (let column = 0; column < arr[index][0].length; column++) {
                    //console.log(index + ": "+row +": "+column);
                    // 空值处理：补充为上一个值
                    if (!arr[index][row][column] ){
                        arr[index][row][column]=arr[index][row-1][column];
                    }
                    else{
                    //删除首尾空格
                    tempstr=arr[index][row][column]
                    tempstr=tempstr.replace(/(^\s+)|(\s+$)/g, "");//删除首尾空格
                    arr[index][row][column]=tempstr
                    }

                    //转换为数值
                    if (column>=1 && row>=1) {
                        arr[index][row][column]= Number(arr[index][row][column].toString().replace(/[,-\s\n\t]/g, ""));
                        
                    }

                    //零值处理
                    if (arr[index][row][column]==0 ){
                        arr[index][row][column]=arr[index][row-1][column];
                    }
                }
                
            }
            
        }
        //数据清理2
        for (let index = 0; index < arr.length; index++) {            
            for (let row = 0; row < arr[index].length; row++) {   
                //若此行为"2016" ||2017 || ||
                tempstr = arr[index][row][0];
                if (tempstr.slice(0,4)=="2016" || tempstr.slice(0,4)=="2017"){ 
                    arr[index].splice(row,1); row--; continue;
                    }
            }
        }
                   


        //增长率计算
        growth= JSON.parse(JSON.stringify(arr));
        for (let index = 0; index < growth.length; index++) {            
            for (let column = 1; column < growth[index][0].length; column++) {
                growth[index][1][column]=0 ;               //首条数据记录值设为0
            }
        }
        for (let index = 0; index < growth.length; index++) {            
            for (let row = 2; row < growth[index].length; row++) {                
                for (let column = 1; column < growth[index][0].length; column++) {
                    growth[index][row][column]=Math.round((arr[index][row][column]/arr[index][row-1][column]-1)*1000)/1000 ; //增长率计算

                }
            }
        }

        //相对于12个月前累计增长率计算
        var HowManyMonths = 12;
        growth_12M_cumulative = JSON.parse(JSON.stringify(arr));
        for (let index = 0; index < growth.length; index++) {            
            for (let row = 1; row < growth[index].length; row++) {     
                for (let column = 1; column < growth[index][0].length; column++) {
                    growth_12M_cumulative[index][row][column]=0 ;               //数据记录值设为0
                }   
            }
        }
        for (let index = 0; index < growth.length; index++) {            
            for (let row = growth[index].length-1; row >growth[index].length-13; row--) {                
                for (let column = 1; column < growth[index][0].length; column++) {
                    growth_12M_cumulative[index][row][column]=Math.round((arr[index][row][column]/arr[index][growth[index].length-1-12][column]-1)*1000)/1000 ; //cumulative增长率计算

                }
            }
        }






        //提取，转置数组数据
        
        dataset=combine_transpose_arr([].concat(arr)); //原始数据
        growthdata=combine_transpose_arr([].concat(growth));//增长率
        // var growthdata_cumulative;//增长率
        growthdata_cumulative=combine_transpose_arr([].concat(growth_12M_cumulative));//增长率
        //计算MONTH%,YEAR%
        growthdata.MtoM = [];
        growthdata.YtoY = [];
        for (let index = 0; index < dataset.values.length; index++) {
            growthdata.MtoM[index] = growthdata.values[index].slice(-1)[0];
            growthdata.YtoY[index] = Math.round((dataset.values[index].slice(-1)[0]/dataset.values[index].slice(-13)[0]-1)*1000)/1000;                
        }
        

　　　　　 　// 读取 excel文件
            
            // console.log(arr);
            // document.getElementById("demo").innerHTML+=arr[0][0]+"\n<br>"+arr[0].slice(-1);
            // document.getElementById("demo").innerHTML+="\n<br>"+growth[0][1]+"\n<br>"+growth[0].slice(-1);

//document.getElementById("demo").innerHTML +=wb.SheetNames[i]+"="+JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]]))+"<br/>";
　　　　    //document.getElementById("demo").innerHTML  += JSON.stringify( XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]]) );
            //to do to do
        
            // document.getElementById("demo").innerHTML= JSON.stringify( XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) );
        //}

            //do something here:

            var ranking_month=sort2Darray(growthdata,"ZA");
            var ranking_year=sort2Darray(growthdata_cumulative,"ZA");
            //将图表加载至header。。。等区域
            for (let j = 0; j < growthdata.category.length; j++) {
                
                runReportData(growthdata,ranking_month[j][2],".header",HowManyMonths);
                runReportData(growthdata_cumulative,ranking_year[j][2],".footer",HowManyMonths); 
                
                
            }
            //runReportData(data2)
            //runReportData(data3)
    }
    if(rABS) {
        reader.readAsArrayBuffer(f);
    } else {
        reader.readAsBinaryString(f);
    }
}



function fixdata(data) { //文件流转BinaryString
    var o = "",
        l = 0,
        w = 10240;
    for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
    return o;
}

//新建一个功能用于数组排序
function sort2Darray(aDATA,AZorZA){
    var sortedArray=[];
    var temp = [];
    //先取值
    for (let row = 0; row < aDATA.category.length; row++) {
        temp[row]=[];
        temp[row][0] = aDATA.category[row];
        temp[row][1] = [];
        temp[row][1] = aDATA.values[row][aDATA.values[row].length-1];
        temp[row][2] = [];
        temp[row][2] = row;  //用于记录原始INDEX
        
    }
    //降序ZA,升序AZ
    sortedArray=temp.sort(function(a,b){
        if(a[1]<b[1]){
            return (AZorZA=="ZA")?1:-1;
        }
        if(a[1]>b[1]){
            return (AZorZA=="ZA")?-1:1;
        }
        return 0;
    })
    // console.log(sortedArray);
    return sortedArray;
}


//提取标题，并转换数组
function combine_transpose_arr(aArray) {
    var tempA=[].concat(aArray);
    var dates=[];
    var category=[];
    var values=[];


    //提取dates
    for (let index = 0; index < tempA.length; index++) {
        for (let row = 0; row < tempA[index].length; row++) {    
            if (index==0) {
                dates=dates.concat(tempA[index][row].splice(0,1));
            }
            else{tempA[index][row].splice(0,1);
            }
        }
    }
    //提取category
    for (let index = 0; index < tempA.length; index++) {
        for (let column = 0; column < tempA[index][0].length; column++) {    
            category=category.concat(tempA[index][0][column]);
        }
        tempA[index].splice(0,1);
    }
    
    //转置数组,子项数组必须同样SIZE
    // for (let index = 0; index < tempA.length; index++) {
    //     values=values.concat( tempA[index].map(function(col, i) {
    //         return tempA[index].map(function(row) {return row[i];
    //                                         })
    //                                         })
    //                                         )
    // }
    values=combinedata(tempA);

    
    dates.splice(0,1);
    //若这两项重复则删除一项
    if (category[12]==category[5]){
        category.splice(12,1);
        values.splice(12,1);        
    }

    return {category,dates,values};
    // return new Array(category,dates,values);
}

//合并并转置数组
function combinedata(a) {  
    var temparray=[];
    
    var combinedRowNo=0;
    for (let index = 0; index < a.length; index++) {

            for (let column = 0; column < a[index][0].length; column++) {
                temparray[column+combinedRowNo]=[]; //先定义
            }
        combinedRowNo+=(a[index][0].length);
    }
    combinedRowNo=0;
    for (let index = 0; index < a.length; index++) {            
        for (let row = 0; row < a[index].length; row++) {    
            for (let column = 0; column < a[index][0].length; column++) {
                temparray[column+combinedRowNo][row]=a[index][row][column]; //这里加上了转置动作
            }
        }
        combinedRowNo+=(a[index][0].length);
    }
    return temparray;
}

function runReportData(dtset,CATEGORY_No,CHARTAreaString,HowManyMonths){
    //此处为报表绘制的代码
    var dt = dtset;
    //必须大于12个月(数组里会保留初始的那个月)
    if (HowManyMonths<dt.dates.length && HowManyMonths>=12) {
        
            dt.values[CATEGORY_No].splice(0,dt.dates.length-HowManyMonths-1);
              
    }


    // var containerWidth = 120;
    // set the dimensions and margins of the graph
    var margin = {top: 5, right: 45, bottom: 5, left: 3},
        width_parent = 130 ;//- margin.left ; //- margin.right,
        // height = 80 - margin.top - margin.bottom;
        width = width_parent - margin.left - margin.right,
        height = 105 - margin.top - margin.bottom;

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
    var x = d3.scaleTime().range([0, width]);
    // var x =  d3.scaleOrdinal()        // 生成序数比例尺
    //     .domain(dt.dates)
    //     .range([0, width]);

    var y = d3.scaleLinear().range([height, 0]); //y轴
    var y_1 = d3.scaleLinear().range([height, 0]); //第1条线
    // var y_2 = d3.scaleLinear().range([height, 0]);//可用于第2条线，第3条线

    // define the 1st line
    var c1 = CATEGORY_No;//此处表示values[i]的第几组数据,也是category[]中的序号
    // var c2=c1+1;
    // var c3=c1+2;
    var v1=dt.values[c1];
    // v2=dt.values[c2];
    // v3=dt.values[c3];
    // console.log(v1);

    var valueline = d3.line()
        // .x(function(d,i) { return x(d.dates); })
        // .x(function(d,i) { return x(i); })
        .x(function(d,i) { return x(dt.dates[i]); })
        .y(function(d,i) { 
            // console.log(y_1(v1[i]));
            return y_1(v1[i]); });

    // // define the 2nd line
    // var valueline2 = d3.line()
    //     .x(function(d,i) { return x(dt.dates[i]); })
    //     .y(function(d,i) { return y_2(v2[i]); });
    
    // var valueline3 = d3.line()
    //     .x(function(d,i) { return x(dt.dates[i]); })
    //     // .y(function(d,i) { return y_2(d.values[c3]); });
    //     .y(function(d,i) { return y_2(v3[i]); });
    //     // .y(function(d,i) { return y_2(Math.sqrt(d.values[c2][i])); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg_parent = d3.select(CHARTAreaString).append("svg")
        .attr("width", width_parent ) //+ margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    
    console.log( svg_parent.node().getBoundingClientRect().bottom );
    console.log( d3.select(CHARTAreaString).node().getBoundingClientRect().bottom);
    let which_bottom1 = svg_parent.node().getBoundingClientRect().bottom ;
    let which_bottom2 = console.log( d3.select(CHARTAreaString).node().getBoundingClientRect().bottom);

    if (which_bottom1 > which_bottom2) {
        d3.select(CHARTAreaString).attr("style",{"height": which_bottom1 +100}); 
    }

    var svg = svg_parent.append("svg")
    .attr("width", width  + margin.left)  // + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(0,0)"); //   + margin.left + "," + margin.top + ")");
    

    //* Get the data
    //d3.json(d, function(error, data) {
    //if (error) throw error;

    // format the data
    // var data=d.values[c];
    // data.forEach(function(d) {
    //     d.date = parseTime(d.date);
    //     d.price = +d.Alumium;
    //     d.growth = +d.values[c];
    // })
    // );//
    

    // Scale the range of the data
    // x.domain(d3.extent(data, function(d) { return d.date; }));
    // y.domain([0, d3.max(data, function(d) {return Math.max(d.values[c]);})]);
    // y_1.domain([0, d3.max(data, function(d) {return Math.max(d.values[c2]); })]);
    // y_2.domain([0, d3.max(data, function(d) {return Math.max(d.values[c3]); })]);
    // y_2.domain([0, d3.max(data, function(d) {return Math.max(Math.log(d.values[c2])); })]);

    x.domain(d3.extent(dt.dates, function(d,i) { return d; }));//;;;;;;;;;;;;;

    // x.domain(d3.extent(dt.dates, function(d,i) { return d; }));
    // x.domain(d3.extent(dt.dates, function(d,i) { return i; }));
    // console.log(d3.extent(dt.dates, function(d) { return d; }));
    // y.domain(d3.extent(v1, function(d) { return d; }));
    // y_1.domain(d3.extent(v2, function(d) { return d; }));
    // y_2.domain(d3.extent(v3, function(d) { return d; }));
    
    
    var idomain=d3.extent(v1.concat([-0.05,0.05]), function(d) { return d; })  //最大最小值+-5%
    // idomain=d3.extent(v1.concat(v2,v3), function(d) { return d; })
    // idomain=d3.extent(dt.values, function(d) { return d; })
    // idomain[0]=d3.min(idomain[0])
    // idomain[1]=d3.max(idomain[1])

    y.domain(idomain);
    y_1.domain(idomain);
    // y_2.domain(idomain);
    // console.log(dt.category[c1],idomain);


    // // Add the valueline path.
    // svg.append("path")
    //     .data(v1)
    //     .attr("class", "line")
    //     .attr("d", valueline(v1));

    

    // // Add the valueline2 path.
    // svg.append("path")
    //     .data(v2)
    //     .attr("class", "line")
    //     .style("stroke", "red")
    //     .attr("d", valueline2(v2));
    
    // // Add the valueline3 path.
    // svg.append("path")
    //     .data(v3)
    //     .attr("class", "line")
    //     .style("stroke", "purple")
    //     .attr("d", valueline3(v3));   /////

    // Add the X Axis
    var xAxis = d3.axisBottom(x);
    // xAxis.ticks(6).tickFormat(d3.timeFormat("%Y-%b"));
    xAxis.tickSize(0) ;

    svg.append("g")
        .attr("class", "axisBottom")
        // .attr("transform", "translate(0," + height + ")")
        .attr("transform", "translate(0," + (height-(height-y(0))) + ")")
        // .call(d3.axisBottom(x));
        .call(xAxis)
                .selectAll("text")   //.,,,,,,,,,,,,,
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)")
                        .remove(); ////;;;;;;



// console.log(height,width, y(0));
    
    // Add the y Axis
    // var y_axis = d3.svg.axis().orient("left").scale(y);
    var y_axis = d3.axisLeft(y);
    // y_axis.ticks(6).tickFormat(d3.format(".0%"));
    // y_axis.tickFormat(d3.format("+.0%"));
    y_axis.tickFormat(d3.format(".0%"));
    y_axis.tickSize(0) ;
    

    // svg.append("g")
        // .attr("class", "axisSteelBlue")
        // // .call(d3.axisLeft(y));
        // .call(y_axis)
        //         .selectAll("text")   
                        // .remove(); ////;;;;;;;;;;;;;

    // // Add the y_1 Axis
    // svg.append("g")
    //     .attr("class", "axisRed")
    //     .attr("transform", "translate( " + width + ", 0 )")
    //     .call(d3.axisRight(y_1));

    // // Add the y_2 Axis
    // svg.append("g")
    //     .attr("class", "axisPurple")
    //     .attr("transform", "translate( " + width + ", 0 )")
    //     .call(d3.axisLeft(y_2));

   
    
    //加AREA
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

    

 //加category标题
 svg.append('g') // 输出标题
 .attr("class","text_category")
 .append('text')
 .attr('fill', '#058')
 .attr('font-size', '14px')
 .attr('font-weight', '700')
 // .attr('transform', 'translate(' + 0 + ',' + 20 + ')')
 .attr('text-anchor', 'left')
 .attr('x', +margin.left)
 .attr('y', 12)
 .text(dt.category[c1].slice(0,11));
//加growth标题
svg_parent.append("svg") // 输出标题
 .attr("class","text_growth")
 .append('text')
 .attr('fill', (d,i)=>{   //为正负零数字上色
                if (v1[v1.length-1]>0){
                    // return'darkred';
                    return'rgb(255,56,16)';
                }
                else if (v1[v1.length-1]==0) {
                        return'steelblue'
                }
                else {
                        // return'darkblue';
                        return'rgb(17,140,18)';
                }                   
                }
            )
 .attr('font-size', '14px')
 .attr('font-weight', '700')
 // .attr('transform', 'translate(' + 0 + ',' + 20 + ')')
 .attr('text-anchor', 'left')
 .attr('x', width+margin.left-11)
 .attr('y', height / 2)
//  .text(Math.round(1000*v1[v1.length-1])/10 + "%");
 .text((d,i)=>{
     return d3.format("+.1%")(v1[v1.length-1]);
    });







d3.select("#fileselector").attr("display","none");

// console.log(ymin,ymax,move_per,y_1(ymin),y_1(ymax),y(0));
};  

