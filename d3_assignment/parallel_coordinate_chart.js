//global variable
//define margins and width and height
var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 900 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

//define scales 
var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {};

//define lines (channel 1) and axises 
var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    foreground;
//dimension 1 
var sources = ['cow','ewe','goat','plant']
var sources_map = {
  'cow': 'Cow',
  'ewe': 'Sheep',
  'goat': 'Goat', 
  'plant': 'Plant'
}
//dimension 2 
var stages_map = {
  'agri': 'Agriculture', 
  'packing': 'Packing', 
  'processing': 'Processing', 
  'transport': 'Transport', 
  'distri': 'Distribution', 
  'consumption': 'Consumption', 
}
//channel 2 
var colors = {
  "cow": '#EDB458',
  "ewe": '#E8871E',
  "goat": '#C8963E',
  "plant": '#C3C49E',
};

//icons 
var icons = {
  "cow": "\u{1F42E}", // Unicode for cow face
  "ewe": "\u{1F411}", // Unicode for sheep
  "goat": "\u{1F410}", // Unicode for goat
  "plant": "\u{1F33F}" // Unicode for herb
};

let moving_icons = true; 

var data; 

//main chart svg
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// append instructions for user to click on legend if desired 
var instructions = d3.select("#wrapper") 
  .append("div") 
    .style("text-align", "center") 
    .style("color", "gray") 
    .style("margin-top", "10px") 
    .text("To highlight a specific type of \u{1F9C0}, you can click on the icons in the legend."); 

//legend svg 
var svg_legend = d3.select("#legend").append("svg").attr('width', 150).attr('height',300).append("g").attr("transform",  "translate(" + -10 + "," + -10 + ")"); 

var legendHolder = svg_legend.append('g')

var legend = legendHolder.append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.selectAll("dots")
  .data(sources)
  .enter()
  .append("circle")
    .attr("cx", 100)
    .attr("cy", function(d,i){ return 80 + i*50}) 
    .attr("r", 9)
    .style("fill", function(d){ return colors[d]})


var source_name = d3.select("body").append("div")
.attr("class", "source_name")
.style("opacity", 0);

legend.selectAll(".icon")
.data(sources)
.enter()
.append("text")
  .attr("x", 120) 
  .attr("y", function(d, i){ return 90 + i*50; }) 
  .attr("class", "icon")
  .style("font-size", "30px")
  .text(function(d) { return icons[d]; })
  .on('mouseover', function (d, i) {
    d3.select(this).transition()
         .duration('50')
         .attr('opacity', '.85');
  
    source_name.transition()
         .duration(50)
         .style("opacity", 1);
    let name = d
    //console.log(sources_map[name])
    source_name.html(sources_map[name])
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
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
        svg.selectAll(".moving_icon").remove();
        filter_lines(sources[d]);
    });


function filter_lines(category) {
  
  // Select all the data lines in the chart
  var path = svg.selectAll(".path_class") 
      .style("opacity", 0.1) //reduce the opacity 
      .style("stroke-width",1) //reduce the width 
      .filter(function(lineData) {
          return lineData.animal === category; // Filter based on category of type of cheese. 
      })
      .style("opacity", 1)
      .attr('id','selected_path')
      .style("stroke-width",2); // Highlight the lines that match the category of cheese. 
      //console.log(moving_icons) //debug

  if(moving_icons){ //moving icons functionality is only possible if the user selected to display the mean values 

    var select_path = svg.selectAll("#selected_path") 
    var icon_start = select_path.node().getPointAtLength(0);
    var selected_icon = svg.append("text")
        .attr("class", "moving_icon")
        .attr("font-family", "Segoe UI Emoji") 
        .attr("font-size", "30px") 
        .text(icons[category]) 
        .attr("x", icon_start.x - 30)
        .attr("y", icon_start.y);
    selected_icon.transition()
    .duration(8500) //set transition speed 
    .attrTween("transform", translate_along_path(path))
    .each("end", function() {
      
    });
    //console.log(cat.at(0).total)
    //console.log(icons[category]) //debug
  }


}

function translate_along_path(path) {
  var l = path.node().getTotalLength();
  return function(d, i, a) {
    return function(t) {
      var p = path.node().getPointAtLength(t * l);
      var x = p.x - 30;
      var y = p.y - 70; 
      //console.log(x); //debug translation
      //console.log(y); //debug translation
      return "translate(" + x + "," + y + ")";
    };
  };
}
    
function position(d) {
  return x(d);
}

function path(d) {
  return line(dimensions.map(function(p) {
      return [position(p), y[p](d[p])];
  }));
}

d3.select("#user_selection").on("change", function() {
  var selected_option = d3.select(this).property("value");
  console.log(moving_icons);
  var file_name = selected_option === "all" ? "stages-all-clim_change1.csv" : "stages-clim_change1.csv";
  if(selected_option === "all"){
    svg.selectAll(".moving_icon").remove();
    moving_icons = false;
  }else{
    moving_icons = true; 
  }
  load_data(file_name);
});

function load_data(file_name) {
  d3.csv(file_name, function(error, sources) {
    svg.selectAll(".foreground path").remove();
    data = sources;
    if (error) throw error;
    var values = sources.flatMap(d => 
      d3.keys(d).filter(k => k !== "animal" && k !== "total").map(k => +d[k])
    );
    var uniform_scale = d3.scale.linear()
    .domain(d3.extent(values))
    .range([height, 0]);
    

    //Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(sources[0]).filter(function(d) {
      return d != 'name_lci' && d != "animal" && d != 'total' && (y[d] = uniform_scale);
    }));

    var line_width = d3.scale.linear()
    .domain([0, 7])  
    .range([1, 6]); 

    foreground = svg.append("g")
        .attr("class", "foreground")
      .selectAll("path")
        .data(sources)
      .enter().append("path")
        .attr("d", path)
        .attr("class","path_class")
        .style("stroke-width", function(d) {
          console.log('here')
          return 4; 
        })
        .style("stroke", function(d){
          return colors[d['animal']];
        });
  
    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; });
  
    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .style("stroke-width",1)
        .each(function(d) 
        { 
          d3.select(this).call(axis.scale(y[d])); 
        })
      .append("text")
        .style("text-anchor", "middle")
        .style("font-size","15px")
        .attr('id','stages')
        .attr("y", -9)
        .text(function(d) { return stages_map[d]; });
    
    
  });
}

var page = d3.select('#chart')
page.on("click", function() {
  reset_lines();
});

function reset_lines() {

  svg.selectAll(".path_class") 
      .style("opacity", 1) 
      .style("stroke-width", function(d) { 

        return 4; 
      });
  svg.selectAll(".moving_icon").remove()
}
let file_name = 'stages-clim_change1.csv'
load_data(file_name);

/*
Thanks to various resources found, alot of the functionality was implemented. 
references: 
hover over: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
parallel chart: https://observablehq.com/@d3/brushable-parallel-coordinates , https://syntagmatic.github.io/parallel-coordinates/  
transitioning: stackoverflow and debuggig 
*/