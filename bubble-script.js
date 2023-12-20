/* Load the dataset*/

d3.csv("./data/cheese2.csv", d => {
  return {
    name:d.name,
    animal:d.animal,
    climate_change:+d.clim_change_total,
    ozone_depletion:+d.ozone_depl_total,
    ef_score:+d.ef_score_total,
    protein:+d.protein,
    eiffel_mins: +d.depl_energy_eiffel_mins,
    water_people: +d.depl_water_people,
    car_kms: +d.clim_change_car_kms
  }
}).then(data => {
  createBubbleChart(data);
})

let previousCircle = null;

/* Bubble chart proper */
const createBubbleChart = (data) => {
    /* Set the dimensions and margins of the graph */
    const width = 1000, height = 550;
    const margins = {top: height*0.65, right: 50, bottom: 100, left: 170};

    /* Helper functions and values */
    const format = d3.format(".2f");
    const aveval = d3.mean(data, d=>d.climate_change)
    // console.log(aveval)

    let animals = Array.from(new Set(data.map((d) => d.animal)));
    var color = d3.scaleOrdinal()
      .domain(['cow', 'ewe','goat','plant'])  
      .range(["#f6dd8b","#f6d85f","#eac14a","#697e3e"]);
      // .range(["#FFE471", "#FFD624","#CCAB1D","#a3ae36", "#758a2f","#B5C267","#7F6A12"]); 

    /* Create the SVG container */
    const svg = d3.select("#bubble")
      .append("svg")
      .attr("viewBox",[0,0,width,height])
      ;

    /* Define scales */
    let xScale = d3
      .scaleBand()
      .domain(animals)
      .range([margins.left, width - margins.right]);

    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d=>d.protein)])
      .range([height - margins.bottom, margins.top]);

    let indDomain = d3.extent(data.map((d) => d["climate_change"]));
    let size = d3.scaleSqrt().domain(indDomain).range([3, 25]);    

    /* Define circles */
    bubble=svg.selectAll(".bubbles")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubbles")
      .attr("stroke", "gray")
      .attr("fill", (d) => color(d.animal))
      .attr("r", (d) => size(d["climate_change"]))
      .attr("cx", (d) => xScale(d.animal))
      .attr("cy", (d) => yScale(d.protein))    
      .each(function (d) {
        // Store the original data attributes in a property
        d.originalData = {    
          name:d.name,
          animal:d.animal,
          climate_change:+d.climate_change,
          ozone_depletion:+d.ozone_depletion,
          ef_score:+d.ef_score,
          protein:+d.protein,
          eiffel_mins: +d.eiffel_mins,
          water_people: +d.water_people,
          car_kms: +d.car_kms
        };
      })
      .on('click', togglePopup)
      ;
    
    /* Fix hover attributes */
    // bubble.append('title').text(d=>d.name);
    bubble.append('title').html(d => `<b>Name:</b> ${d.name}<br>\n<b>Impact:</b> ${format(d.climate_change)}`);

    /* Add images as labels per animal */
    const xAxis=d3.axisBottom(xScale).tickFormat("");
    const xGroup = svg.append("g")
      .attr("transform", `translate(0,${0})` ) /* similar to f string in python */
      .call(xAxis)
      .call(g=>g.select('.domain').remove()) /* remove the axis line */
      .selectAll(".tick").each(function(d,i){        
          d3.select(this)
            .append('image')
            .attr('xlink:href', "./images/"+d+".png")
            .attr('x',-100)
            .attr('y', 0)
            .attr('width',40)
            .attr('height',40);
        })
      ;

    /* Add labels per bubble */
    const labels = svg.selectAll('text')
      // .data(data)
      .data(data.filter(d => d.climate_change > aveval)) // add text only for those with values greater than the average
      .enter().append('text')
      .attr("class", "textlabel")
      .attr('dy', '0.35em') // Adjust vertical alignment
      .attr('text-anchor', 'middle')
      .text(d => format(d.climate_change))
      .attr("x", (d) => xScale(d.animal))
      .attr("y", (d) => yScale(d.protein))
      .attr('font-size', d => d.climate_change + 'px') // Adjust font size based on radius
      ;
    // console.log(data.filter(d => d.climate_change > aveval))

    /* jitter bubbles */
    let simulation = d3.forceSimulation(data)
        .force("x", d3.forceX((d) => {
            return xScale(d.animal);
            }).strength(1))
        .force("y", d3.forceY((d) => {
            return yScale(d.protein);
            }).strength(0.2))
        .force("collide", d3.forceCollide((d) => {
            return size(d["climate_change"])*1.02;
            }))
        .alphaDecay(0)
        .alpha(0.3)
        .on("tick", tick);
    
    function tick() {
        d3.selectAll(".bubbles")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
            // .on('click', togglePopup);
        labels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
            // .on('click', togglePopup);
        }
    
    let init_decay = setTimeout(function () {
        // console.log("start alpha decay");
        simulation.alphaDecay(0.1);
        }, 30); 

    /* Legend */
    // Create an SVG group for the legend
    const legend = d3.selectAll('#head').append('svg')
      .attr('class', 'legend')
      .attr('width', 150)
      .attr('height', 120)
      .append('g')
      .attr('transform', 'translate(20,20)'); 

    // Append legend items
    const legendItems = legend.selectAll('.legend-item')
      .data(color.domain())
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', d => color(d));

    legendItems.append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text(d => d);

    /*SELECT CIRCLES*/
    let selectedCircle = null;

    // Show/hide pop-up function
    function togglePopup(d) {
      console.log(d);
      const popupContainer = d3.select('#popup-container');
      const popupContent = d3.select('#popup-content');
      const i=d.srcElement.__data__['index'];

      if (selectedCircle === i) {
          // console.log('Clicked again');
          // Clicked the same circle again, hide the pop-up
          hidePopup();
          selectedCircle = null;
          previousCircle = null;
      } else {
          // Get data from the circle
          const originalData = d.srcElement.__data__;

          // Exclude specific properties from being displayed
          const excludedProperties = ['name','animal'];// ['x', 'y', 'index', 'originalData','vx','vy'];
          const includedProperties = ['climate_change','car_kms', 'eiffel_mins', 'water_people',
                                      'ozone_depletion', 'ef_score'
                                      ];
          // const includedProperties = ["Climate Change Impact (kg CO2)", 
          // "Climate Change: Driving x kms",
          // "Energy Depletion: Mins Eiffel Tower can be lit up",
          // "Water Depletion: #Parisians Daily Water Supply",
          // "Ozone Depletion",
          // "EF Score"
          // ];
          
          const stringData = Object.entries(originalData)
              .filter(([key]) => excludedProperties.includes(key));
          const numData = Object.entries(originalData)
              .filter(([key]) => includedProperties.includes(key));

          const labeldict={
              "name":"Name",
              "animal":"Source",
              "climate_change":"Climate Change <tspan dy=1.2em dx=-8em>Impact (kg CO2)</tspan>", 
              "car_kms":"Climate Change: <tspan dy=1.2em dx=-8em>Driving x kms</tspan>",
              "eiffel_mins":"Energy Depletion: <tspan  dy=1.2em dx=-8em>Mins Eiffel Tower <tspan dy=1.2em dx=-8em>can be lit up</tspan></tspan>",
              "water_people":"Water Depletion: <tspan  dy=1.2em dx=-8em>#Parisians Daily <tspan dy=1.2em dx=-7em>Water Supply</tspan></tspan>",
              "ozone_depletion":"Ozone Depletion",
              "ef_score":"EF Score"
              };

          const iconsdict={
                "name":"",
                "animal":"",
                "climate_change":"", 
                "car_kms":"&#x1F697;",
                "eiffel_mins":"&#x1F4A1;",
                "water_people":"&#x1F465;",
                "ozone_depletion":"",
                "ef_score":""
                };

          
          // Update pop-up content based on circle data
          let contentHtml = null
          // let contentHtml = stringData.map(([key, value]) => `<p>${key}: ${typeof value === 'number' ? value.toFixed(4) : value}</p>`).join('');
          if (previousCircle !== null) {
            contentHtml = `<div style="text-align: center; margin-bottom:10px;"><span style="color: red;">${originalData.name}(${originalData.animal})</span> vs <span style="color: blue;">${previousCircle.name}(${previousCircle.animal})</span></div>`;
          } else {
            contentHtml = `<div style="text-align: center; margin-bottom:10px;"><span style="color: red;">${originalData.name}(${originalData.animal})</span></div>`;
          }
          
          popupContent.html(contentHtml);
      
          // Iterate through all keys in filteredData
          for (const [key, value] of numData) {
              // Extract max values for all circles
              const scores = data.map(d => d[key]);
              const maxscore = d3.max(scores);

              // Add SVG for the line and marker for each key
              let lineSvg = `
                  <svg width="100%" height="50">
                      <text x="0%" y="50%" font-size="10" fill="black">${labeldict[key]}</text>
                      <line x1="20%" y1="25" x2="80%" y2="25" stroke="black" stroke-width="1" />
                      <circle cx="${(value / maxscore) * 60 + 20}%" cy="25" r="5" fill="red" />
                      <text x="${(value / maxscore) * 60 + 22}%" y="45" font-size="10" fill="red">${value.toFixed(2)}</text>
                      <text x=87% y="50%">${iconsdict[key]}</text>
                  </svg>`;

              // Check if previousCircle is not null
              if (previousCircle !== null) {
                // Specify the key to get prevValue from previousCircle
                const prevValue = previousCircle[key];

                // Add additional circles based on the prevValue
                lineSvg = `
                  <svg width="100%" height="50">
                      <text x="0" y="50%" font-size="10" fill="black">${labeldict[key]}</text>
                      <line x1="20%" y1="25" x2="80%" y2="25" stroke="black" stroke-width="1" />
                      <circle cx="${(value / maxscore) * 60 + 20}%" cy="25" r="5" fill="red" />
                      <text x="${(value / maxscore) * 60 + 22}%" y="45" font-size="10" fill="red" font-weight="bolder">${value.toFixed(2)}</text>
                      <circle cx="${(prevValue / maxscore) * 60 + 20}%" cy="25" r="5" fill="blue" />
                      <text x="${(prevValue / maxscore) * 60 + 22}%" y="15" font-size="10" fill="blue" font-weight="bolder">${prevValue.toFixed(2)}</text>
                      <text x=87% y="50%">${iconsdict[key]}</text>
                  </svg>`;
              }
              // Append the generated lineSvg to the container
              popupContent.append('div')
                  .html(lineSvg);
          }

          // Show pop-up by moving it into view
          popupContainer.transition().duration(300)
              .style('right', '0');

          // console.log(d.srcElement)
          // // Change the border width of the clicked circle
          // d3.select(d.srcElement)
          //     .attr('stroke', 'black')
          //     .attr('stroke-width', 2);

          // Set the selected circle
          selectedCircle = i;
          previousCircle = originalData;
      }
    }

    

    }

// Hide pop-up function
function hidePopup() {
  d3.select('#popup-container').transition().duration(300)
      .style('right', '-500px');
  // // Reset the stroke width and make it transparent
  // d3.selectAll('.bubbles')
  //   .attr('stroke-width', '0.5px')
  //   .attr('stroke', '#d2bd98')
  //   ;
  previousCircle = null;
}

// add a reset comparison which will reset the previousCircle to null

// add zoom function to prevent bubbles from spilling out of the svg frame
function zoomed() {
  svg.selectAll(".bubbles")
      .attr("transform", d3.event.transform);
}