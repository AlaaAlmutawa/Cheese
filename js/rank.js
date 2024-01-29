var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 900,// - margin.left - margin.right,
    height = 400;// - margin.top - margin.bottom;
//legend svg 

// var sources = ['all','cow','ewe','goat']
var sources_map = {
  'cow': 'Cow',
  'ewe': 'Sheep',
  'goat': 'Goat', 
  'all': 'All'
}

var indicator='ef_score_total';

//========================================
const sources = ['cow', 'ewe', 'goat','plant'];

function toggleImage(img, animal) {
  console.log('adsadsa');
  var index = sources.indexOf(animal);

  if (index === -1) {
    // Animal not in sources, add it
    sources.push(animal);
    img.classList.remove('selected'); // Add the 'selected' class
    console.log(`Added ${animal} to sources: ${sources}`);
  } else {
    // Animal in sources, remove it
    sources.splice(index, 1);
    img.classList.add('selected'); // Remove the 'selected' class
    console.log(`Removed ${animal} from sources: ${sources}`);
  }
  filter_data(sources,indicator);
}

//========================================

// var images={'cow':"images/cow.png",
//   'ewe':"images/ewe.png",
//   'goat':"images/goat.png",
//   'plant':"images/plant.png"};


function filter_data(sources, indicator) {
  console.log('Update values call');
  d3.csv("data/cheese3.csv").then(function(data) {
    var filteredData;

    if (sources.includes("all")) {
      // If "all" is in sources, keep the original dataset
      filteredData = data;
    } else {
      // Filter based on the animals in the sources list
      filteredData = data.filter(function(d) {
        return sources.includes(d.animal);
      });
    }

    filteredData.sort(function(a, b) {
      return d3.ascending(+a[indicator], +b[indicator]);
    });

    // Get the first three rows of the sorted data
    var top3 = filteredData.slice(0, 3);

    // Now you have the filtered, sorted, and top3 data available
    draw_chart(top3);
    // Perform further operations with the filtered, sorted, and top3 data as needed
  });
}

function draw_chart(data) {
  // Sample data for podium positions
  var podiumData = [
    { position: 1, color: '#a4c56a', label: '1st', data: data[0] },
    { position: 2, color: '#6e8146', label: '2nd', data: data[1] },
    { position: 3, color: '#3b4e27', label: '3rd', data: data[2] },
  ];

  // Select the existing SVG and remove its contents
  var svg = d3.select('#chart').select('svg');

  if (!svg.empty()) {
    svg.remove();
  }

  // Create SVG container
  var svg = d3.select('#chart').append('svg')
    .attr('class', 'podium')
    .attr('viewBox', '0 0 300 300')
    .attr('width', '40%')
    .attr('height', '40%')
    .style('margin', 'auto')
    .style('margin-top', '3%')
    ;

  // Create podium bars with gradient for 3D effect
  podiumData.forEach((d, i) => {
    var gradientId = `gradient-${i}`;
    var gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .style('stop-color', d.color);

    gradient.append('stop')
      .attr('offset', '100%')
      .style('stop-color', d3.rgb(d.color).darker(1));

    svg.append('rect')
      .attr('width', 100)
      .attr('height', d.position === 1 ? 150 : d.position === 2 ? 100 : 75)
      .attr('x', i === 0 ? 100 : i === 1 ? 0 : 200)
      .attr('y', d.position === 1 ? 200 - 150 : d.position === 2 ? 200 - 100 : 200 - 75)
      .style('fill', `url(#${gradientId})`);
  });

  // Add labels
  // var labels = svg.selectAll('.position-label')
  //   .data(podiumData)
  //   .enter().append('text')
  //   .attr('class', 'position-label')
  //   .attr('x', (d, i) => i === 0 ? 150 : i === 1 ? 50 : 250)
  //   .attr('y', 180)
  //   .attr('text-anchor', 'middle')
  //   .attr('fill', 'white')
  //   .text(d => d.label)
  //   .style('font-size', '25px')
  //   // .style('color','white')
  //   ;

  var name = svg.selectAll('.name-label')
    .data(podiumData)
    .enter().append('text')
    .attr('class', 'name-label')
    .attr('x', (d, i) => i === 0 ? 150 : i === 1 ? 50 : 250)
    .attr('y', (d, i) => d.position === 1 ? 30 : d.position === 2 ? 80 : 110)
    .attr('text-anchor', 'middle')
    .style('font-size', '7px')
    .text(d => d.data.name) // + " ("+d.data.animal+")"
    .call(wrap, 100);




  var labels = svg.selectAll('.position-label')
    .data(podiumData)
    .enter().append('g')
    .attr('class', 'position-label')
    .attr('transform', (d, i) => `translate(${i === 0 ? 150 : i === 1 ? 50 : 250}, 185)`)
    .style('font-size', d => `${(4-parseFloat(d.label))*6+10}px`)//'25px'
    .style('fill', 'white');

  labels.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  const xdict={
    '1st':-20,
    '2nd':-15,
    '3rd':-10,
  }
  const ydict={
    '1st':-65,
    '2nd':-55,
    '3rd':-45,
  }

  labels.append('image')
    .attr('xlink:href', d => "images/"+d.data.animal+d.label+".png") // Assuming you have an 'imagepath' property in your data
    .attr('width', d => `${(4-parseFloat(d.label))*6+20}px`) // Adjust the width as needed
    .attr('height', d => `${(4-parseFloat(d.label))*6+20}px`) // Adjust the height as needed
    .attr('x', //-20
    d => xdict[d.label]
    ) // Adjust the position relative to the text
    .attr('y', 
    d => ydict[d.label]
    // d => `${(parseFloat(d.label))*5-65}px`
    ); // Adjust the position relative to the text

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

function filterBasedOn(){
  console.log('Call function');
    // source = document.getElementById('source').value;
    indicator = document.getElementById('indicator').value;
    filter_data(sources,indicator);
}

// initial run
filterBasedOn()
