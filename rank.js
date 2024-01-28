var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 900 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
//legend svg 

var sources = ['all','cow','ewe','goat']
var sources_map = {
  'cow': 'Cow',
  'ewe': 'Sheep',
  'goat': 'Goat', 
  'all': 'All'
}
var svg_legend = d3.select("#chart").append("svg").attr('width', 150).attr('height',300).append("g").attr("transform",  "translate(" + -10 + "," + -10 + ")")
.attr('display','inline-block');; 

var legendHolder = svg_legend.append('g')

var legend = legendHolder.append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

var source_name = d3.select("body").append("div")
.attr("class", "source_name")
.style("opacity", 0);

  legend.selectAll(".icon")
  .data(sources)
  .enter()
  .append('svg:image')
            .attr('xlink:href',function(d,i){return "images/"+d+".png";})
            .attr('x',120)
            .attr('y', function(d,i){ return 50 + i*50})
            .attr('width',40)
            .attr('height',40)
            .attr("class", "icon")
            .on('click', function(d,i){ 
                console.log(i);
                var indicator = document.getElementById('indicator').value;
                filter_and_draw(i,indicator);
            });

empty_podium();
function filter_and_draw(source,indicator){
    d3.csv("data/cheese3.csv").then(function(data) {

        var filteredData = data.filter(function(d) {
            if (source === "all"){
                return d;
            }else{
            return d.animal === source;
            }
        });

        filteredData.sort(function(a, b) {
            return d3.ascending(+a.indicator, +b.indicator);
        });

        var top3 = filteredData.slice(0,3);
        draw_chart(top3);
        console.log(top3);
        console.log(indicator);

    });
}

function draw_chart(data){
    // Sample data for podium positions
    var podiumData = [
        { position: 1, color: '#a4c56a', label: '1st' , data: data[0]},
        { position: 2, color: '#6e8146', label: '2nd',data: data[1] },
        { position: 3, color: '#3b4e27', label: '3rd',data: data[2]},
  ];
  d3.select('.podium').remove();


  // Create SVG container
  var svg = d3.select('#chart').append('svg')
    .attr('class', 'podium')
    .attr("viewBox", [-200,0, width, height])
    .attr('width', '60%')
    .attr('display','inline-block')
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // Create podium bars
  var podiumBars = svg.selectAll('.podium-bar')
    .data(podiumData)
    .enter().append('rect')
    .attr('class', 'podium-bar')
    .attr('width', 100)
    .attr('height', (d,i) => d.position === 1 ? 150 : d.position === 2 ? 100: 50)
    .attr('x', (d, i) => i === 0 ? 100 : i === 1 ? 0 : 200)
    .attr('y', d => d.position === 1 ? 200-150 : d.position === 2 ? 200-100: 200-50)
    .style('fill', d => d.color);

  // Add labels
  var labels = svg.selectAll('.position-label')
    .data(podiumData)
    .enter().append('text')
    .attr('class', 'position-label')
    .attr('x', (d, i) => i === 0 ? 150 : i === 1 ? 50 : 250)
    .attr('y', 220)
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  var name = svg.selectAll('.name-label')
    .data(podiumData)
    .enter().append('g')
    .attr('class', 'name-label')
    .append('text')
    .attr('x', (d, i) => i === 0 ? 150 : i === 1 ? 50 : 250)
    .attr('y', (d,i) => d.position === 1 ? 35 : d.position === 2 ? 85: 135)
    .attr('text-anchor', 'middle')
    .style('font-size', '9px')
    .text(d => d.data.name_french)
    .call(wrap, 100);

}
function filterBasedOn(){
    var source = document.getElementById('source').value;
    var indicator = document.getElementById('indicator').value;
    // var type = document.getElementById('type').value;
    filter_and_draw(source,indicator);


}

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}
function empty_podium(){
    var podiumData = [
        { position: 1, color: '#a4c56a', label: '1st' },
        { position: 2, color: '#6e8146', label: '2nd'},
        { position: 3, color: '#3b4e27', label: '3rd'},
    ];
  // Create SVG container
  var svg = d3.select('#chart').append('svg')
  .attr('class', 'podium')
  .attr("viewBox", [-200,0, width, height])
  .attr('width', '60%')
  .attr('display','inline-block')
  // .attr("width", width + margin.left + margin.right)
  // .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// Create podium bars
var podiumBars = svg.selectAll('.podium-bar')
  .data(podiumData)
  .enter().append('rect')
  .attr('class', 'podium-bar')
  .attr('width', 100)
  .attr('height', (d,i) => d.position === 1 ? 150 : d.position === 2 ? 100: 50)
  .attr('x', (d, i) => i === 0 ? 100 : i === 1 ? 0 : 200)
  .attr('y', d => d.position === 1 ? 200-150 : d.position === 2 ? 200-100: 200-50)
  .style('fill', d => d.color);

// Add labels
var labels = svg.selectAll('.position-label')
  .data(podiumData)
  .enter().append('text')
  .attr('class', 'position-label')
  .attr('x', (d, i) => i === 0 ? 150 : i === 1 ? 50 : 250)
  .attr('y', 220)
  .attr('text-anchor', 'middle')
  .text(d => d.label);
}
