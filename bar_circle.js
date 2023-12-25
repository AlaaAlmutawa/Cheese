$(document).ready(function() {

    var $this = $('.barchart');
    // 5.452991153841180 cow
    // 5.780729289471430 ewe
    // 6.444954150900000 goat
    var data = [
        {
            label: 'Goat',
            value: 99552*6.444954150900000*907.185, //million tons 99,552 tons
            code: 'goat',
        },
        {
            label: 'Sheep',
            value: 5.780729289471430*61000*907.185, //61,000 tons
            code: 'ewe',
        },
        {
            label: 'Cow',
            value: 1700000*907.185*5.452991153841180, //million tons statista 2019
            code: 'cow',
        },
    ];

    var width = $this.data('width'),
        height = $this.data('height'),
        radius = $this.data('r'),
        innerradius = $this.data('ir');

    //channel 2 
    // var colors = {
    //     "cow": '#EDB458',
    //     "ewe": '#E8871E',
    //     "goat": '#C8963E',
    //     "plant": '#C3C49E',
    // };
    var colors = {
        "cow": '#EDB458',
        "ewe": '#E8871E',//'#E8871E',
        "goat": '#C8963E',
        "plant": '#697e3e'//'#C3C49E',
      };
    //icons 
    var icons = {
        "cow": "\u{1F42E}", // Unicode for cow face
        "ewe": "\u{1F411}", // Unicode for sheep
        "goat": "\u{1F410}", // Unicode for goat
        "plant": "\u{1F33F}" // Unicode for herb
    };
        // var color = d3.scaleOrdinal()
        // .range(["#f0cf85", "#e7f0c3", "#a4d4ae", "#32afa9"]);
    var source_name = d3.select("body").append("div")
    .attr("class", "source_name")
    .style("opacity", 0);

    var funfact = d3.select("body").append("div")
    .attr("class", "funfact")
    .style("opacity", 0);

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(innerradius);
    
    const hoverArc = d3.arc() 
    .innerRadius(innerradius +20)
    .outerRadius(radius + 30) // to make the arc bigger over hover 
    // .cornerRadius(radius + 30)

    const zeroArc = d3.arc()
    .outerRadius(radius - 10)
    .outerRadius(1)
    
    var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    data.forEach(function(d) {
        d.total = +d.value;
    });

    // var pie = d3.pie()
    //     .startAngle(-90 * (Math.PI / 180))
    //     .endAngle(120 * (Math.PI / 180))
    //     .sort(null)
    //     .value(function(d) { return d.total; });
    var pie = d3.pie()
    .startAngle(-90 * (Math.PI / 180))
    .endAngle(90 * (Math.PI / 180))
    .sort(null)
    .value(function(d) { return d.total; });

    var pieData = pie(data);
    var mult = 3;
    var svg = d3.select('.barchart')
        .append("svg")
        .attr("width", width*mult)
        .attr("height", height*mult/2)
        .append("g")
        .attr('class', 'piechart')
        .attr("transform", "translate(" + width*mult / 2 + "," + height*mult / 3.5 + ")");
    var totalSum = data.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue.value;
    }, 0);
    var formattedTotal = '~ '+ (totalSum / 1000000000).toFixed(0) + 'billion kg CO2 eq';
    var text = svg.append('g')
        .append("text")
        .attr("text-anchor", "middle")  // Center the text
        .attr("x", 5)           // Horizontally center the text in the SVG
        .attr("y", -30) 
        .attr("class","total")         // Vertically position the text in the middle
        .attr("dy", "-0.5em")            // Adjust the position under the arc
        .text(formattedTotal)         // The text to display //EURO stat 2021
    //__ text
    var segments = svg.append('g').attr('class', 'segments');

    var slices = segments.selectAll(".arc")
        .data(pieData)
        .enter().append("g")
        .attr("class", "arc")
        .attr('id', function(d) { console.log(d); return d.data.code; })

    // slices.append("path")
    //     .data(pieData)
    //     .attr("d", arc)
    //     .attr('fill', function(d,i) {
    //         return colors[d.data.code];
    //     })
    //     .on('mouseover', function(d) {
    //         d3.select(this)
    //             .transition()
    //             .duration(500)
    //             .attr('d', hoverArc)
    //             .style('fill-opacity', 1)
    //             .transition().duration(500)
    //             .attr('d', hoverArc)
    //             .style('stroke-width', 10)
    //             .style('stroke', '#f2f2ba')
    //     })
    //     .on('mouseout', function(d) {
    //         d3.select(this)
    //             .style('fill-opacity', 0.8)
    //             .transition()
    //             .duration(500)
    //             .attr('d', arc)
    //      })
    slices.append("path")
    .attr('d', zeroArc)
    .attr('class', 'arc')
    .style('fill-opacity', 0.7)
    // .style('stroke-width',5)
    // .style('stroke', '#f2f2ba')
    .data(pieData)
    .attr('fill', function(d,i) {
        return colors[d.data.code];
    })
    .on('mouseover', function(d) {
        d3.select(this)
            .transition()
            .duration(500)
            .attr('d', hoverArc)
            .style('fill-opacity', 1)
            .transition().duration(500)
            .attr('d', hoverArc)
            .style('stroke-width', 10)
            // .style('stroke', '#f2f2ba')
       
    })
    .on('mouseout', function(d) {
        d3.select(this)
            .style('fill-opacity', 0.7)
            .transition()
            .duration(500)
            .attr('d', arc)
        funfact.transition()
        .duration(50)
        .style("opacity", 0);
     })
    .on('click', function(d,i) {
        funfact.transition()
        .duration(50)
        .style("opacity", 1);
       console.log(i)
       funfact.html("Did you know?<br><br>Equivalent to driving "+ Math.round((i.data.value/1000000) * 0.19) +" million km using Toyota Corolla Sedan Petrol (2020) \u{1F697}<br><br>Equivalent to lighting effiel tower for X days \u{1F4A1}\u{1F1EB}\u{1F1F7}")
           .style("left", (400) + "px")
           .style("top", (100) + "px");
    })
    .transition()
    .duration(1000)
    .delay((d, i) => i * 300)
    .attr('d', arc)

    //__labels
    var labels = svg.append('g').attr('class', 'labels');

    var label = labels.selectAll('text').data(pieData)
        .enter()
        .append('svg:image')

    label
        .attr('x', function(d) {
            if(d.data.code == "cow"){
                var a =
                d.startAngle +
                (d.endAngle - d.startAngle) / 2 -
                Math.PI / 2;
            d.cx = Math.cos(a) * (innerradius + (radius - innerradius) /2);
            return (d.x = Math.cos(a) * (radius + 50)-250);

            }else{
            var a =
                d.startAngle +
                (d.endAngle - d.startAngle) / 2 -
                Math.PI / 2;
            d.cx = Math.cos(a) * (innerradius + (radius - innerradius) /2);
            return (d.x = Math.cos(a) * (radius + 50)-200);}
        })
        .attr('y', function(d) {
            // console.log(d)
            if(d.data.code == "cow"){
                var a =
                d.startAngle +
                (d.endAngle - d.startAngle) / 2 -
                Math.PI / 2;
            d.cy = Math.sin(a) * (innerradius + (radius - innerradius) / 2);
            return (d.y = Math.sin(a) * (radius + 50)-150)
            
            }else{var a =
                d.startAngle +
                (d.endAngle - d.startAngle) / 2 -
                Math.PI / 2;
            d.cy = Math.sin(a) * (innerradius + (radius - innerradius) / 2);
            return (d.y = Math.sin(a) * (radius + 50)-50)};
        })
        .attr('xlink:href',function(d) {
            return "images/"+d.data.code+".png";
        }).attr("class", "icon")
        .attr("width", 40)
        .attr("height", 40)
        .each(function(d) {
            var bbox = this.getBBox();
            d.sx = d.x - bbox.width / 2 - 2;
            d.ox = d.x + bbox.width / 2 + 2;
            d.sy = d.oy = d.y + 5;
        })
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '.85');
          
            source_name.transition()
                 .duration(50)
                 .style("opacity", 1);
            let name = i
            // console.log(i)
            source_name.html(i.data.label)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
            })
            .on('mouseout', function (d, i) {
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1');
        
                source_name.transition()
                    .duration('50')
                    .style("opacity", 0)
            }).on("click", function(event, d) {
                //console.log(sources[d]) //debug icons 
               
            });
        // .transition()
        // .duration(300);

    labels.transition().duration(300);

    labels.exit().remove();
    //__labels
    //__ unit explaination 
    htmlContent = `<div class="top-right-content_html" style="text-align: center; margin-bottom:10px;"><span style="color: gray;">What are CO2 Equivalents (CO2)?</span></div>`
    dets = `<div class="top-right-content_dets" style="text-align: center; margin-bottom:10px;"><span style="color: black;">Emissions of different gases emitted are converted to CO2 equivalent based on 'Global Warming Potential' (GWP)</span></div>`
    dets2 = `<div class="top-right-content_dets" style="text-align: center; margin-bottom:10px;">
    <span style="color: black;">
        This helps in measuring of warming that is contributed by each gas to the greenhouse effect.
        <br> 
        <table>
            <tr>
                <th>Gas type (1kg emissions)</th>
                <th>CO2 Equivalents</th>
            </tr>
            <tr>
                <td>CO2</td>
                <td>1kg</td>
            </tr>
            <tr>
                <td>N2O (Nitrous Oxide)</td>
                <td>298kg</td>
            </tr>
            <tr>
                <td>CH4 (Methane)</td>
                <td>25kg</td>
            </tr>
        </table>
    </span>
</div>`
    source = `<div class="top-right-content_dets" style="text-align: center; margin-bottom:10px;">Source: <a href="https://www.cbs.nl/en-gb/news/2019/37/greenhouse-gas-emissions-down/co2-equivalents" target="_blank">Statistics Netherlands</a></div>`
    var topRightDiv = d3.select('.barchart').append("div")
        .attr("class", "top-right-content")
        .html(htmlContent+dets+dets2+source);
    
    //__pointers
    //  var pointers = svg.append('g').attr('class', 'pointers');

    //  pointers
    //     .append('defs')
    //     .append('marker')
    //     .attr('id', 'circ')
    //     .attr('markerWidth', 6)
    //     .attr('markerHeight', 6)
    //     .attr('refX', 3)
    //     .attr('refY', 3)
    //     .append('circle')
    //     .attr('cx', 3)
    //     .attr('cy', 3)
    //     .attr('r', 3);

    // var pointer = pointers.selectAll('path.pointer').data(pieData)
    //     .enter()
    //     .append('path')
    //     .attr('class', 'pointer')
    //     .style('fill', 'none')
    //     .style('stroke', 'black')
    //     .attr('marker-end', 'url(#circ)');

    // pointer
    //     .attr('d', function(d) {
    //         if (d.cx > d.ox) {
    //             return (
    //                 'M' + d.sx + ',' +  d.sy +
    //                 'L' + d.ox + ',' + d.oy + ' ' + d.cx + ',' + d.cy
    //             );
    //         } else {
    //             return (
    //                 'M' + d.ox + ',' + d.oy + 
    //                 'L' + d.sx + ',' + d.sy + ' ' + d.cx + ',' + d.cy
    //             );
    //         }
    //     })
    //     .transition()
    //     .duration(300);

    // pointers.transition().duration(300);

    // pointers.exit().remove();
    // //__pointers

});
