// INITIALIZE THINGS

/*Selected things */
let selectedName1, selectedAnimal1, selectedName2, selectedAnimal2;

/*Initialize maximum values*/
let maxscores = {};
let csvdata=null;

/*Initialize CIRCLES*/
let selectedCircle = null;
let previousCircle = null;
let originalData = null;

// Exclude specific properties from being displayed
const excludedProperties = ['name','animal'];
const includedProperties = ['ef_score','car_kms','macbook_hrs','water_people'];

// Icons to use
const iconsdict={
      "name":"",
      "animal":"",
      "climate_change":"", 
      "car_kms":"images/automobile.png",
      "macbook_hrs":"images/power-plug.png",
      "water_people":"images/water-drop.png",
      "ef_score":""
      };

// Declare colors
const color1="#ADD8E6";
const color2="#FFCCCB";
const textcolor1="#3498db";
const textcolor2="#e74c3c";

// Declare labels
const labeldict={
  "name":"Name",
  "animal":"Source",
  "car_kms":"What's the climate impact equivalent in car kilometers?",
  "macbook_hrs":"How many MacBook Pro charging hours can be powered?",
  "water_people":"How many people's daily water supply can be sustained?",
  "ef_score":"Environment Footprint (EF) Score"
  };

// Rounding off parameters
const rounddict={
    "car_kms":0,
    "macbook_hrs":0,
    "water_people":0,
    "ef_score":2
    };

d3.csv("./data/cheese3.csv", d => {
  return {
      name: d.name,
      animal: d.animal,
      climate_change: +d.clim_change_total,
      ef_score: +d.ef_score_total,
      protein: +d.protein,
      depl_water_total: +d.depl_water_total,
      depl_energy_total: +d.depl_energy_total,
      macbook_hrs: +d.depl_energy_macbook_hrs,
      water_people: +d.depl_water_people,
      car_kms: +d.clim_change_car_kms
  }
}).then(data => {

  // Loop through the keys of the first data entry to initialize maxscores
  Object.keys(data[0]).forEach(key => {
      maxscores[key] = d3.max(data, d => d[key]);
  });

  csvdata=data;

});

// ======================================================================================================================

// Initialization of dropdowns and call bubble
document.addEventListener("DOMContentLoaded", function () {
  /* Load the dataset*/

  d3.csv("./data/cheese3.csv", d => {
    return {
      name:d.name,
      animal:d.animal,
      climate_change:+d.clim_change_total,
      ef_score:+d.ef_score_total,
      protein:+d.protein,
      depl_water_total: +d.depl_water_total,
      depl_energy_total: +d.depl_energy_total,
      macbook_hrs: +d.depl_energy_macbook_hrs,
      water_people: +d.depl_water_people,
      car_kms: +d.clim_change_car_kms
    }
  }).then(data => {

  // Function to update name dropdown options
  function updateNameDropdown(animalDropdownId, nameDropdownId) {
    const animalDropdown = document.getElementById(animalDropdownId);
    const nameDropdown = document.getElementById(nameDropdownId);
  
    // Get selected animal
    const selectedAnimal = animalDropdown.value;
  
    // Filter data for the selected animal
    const names = data
        .filter(entry => entry.animal === selectedAnimal)
        .map(entry => entry.name);
  
    // Clear existing options
    nameDropdown.innerHTML = '<option value="" selected disabled>Choose your cheese</option>';
  
    // Add new options to name dropdown
    names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameDropdown.appendChild(option);
    });
  }

  // Initial population of name dropdowns
  updateNameDropdown('bubble-animalDropdown1', 'bubble-nameDropdown1');
  updateNameDropdown('bubble-animalDropdown2', 'bubble-nameDropdown2');

  function updateNameDropdownAll(id) {
    // Populate options for bubble-nameDropdown2
    const nameDropdown2 = document.getElementById(id);
    nameDropdown2.innerHTML = '<option value="" selected disabled>Choose your cheese</option>';

    // Get all unique names from the dataset
    const allNames = [...new Set(data.map(entry => entry.name))];

    // Add options to nameDropdown2
    allNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameDropdown2.appendChild(option);
    });
  }
  updateNameDropdownAll('bubble-nameDropdown1');
  updateNameDropdownAll('bubble-nameDropdown2');


  // Add event listeners to animal dropdowns
  document.getElementById('bubble-animalDropdown1').addEventListener('change', function () {
    updateNameDropdown('bubble-animalDropdown1', 'bubble-nameDropdown1');
  });

  document.getElementById('bubble-animalDropdown2').addEventListener('change', function () {
    updateNameDropdown('bubble-animalDropdown2', 'bubble-nameDropdown2');
  });

  createBubbleChart(data);

  })
})

// ======================================================================================================================

function updateDropdownValues(nameDropdownId, animalDropdownId, nameValue, animalValue) {
  const animalDropdown = document.getElementById(animalDropdownId);
  const nameDropdown = document.getElementById(nameDropdownId);
  
  // Iterate through the options in the name dropdown
  for (let i = 0; i < nameDropdown.options.length; i++) {
    if (nameDropdown.options[i].value === nameValue) {
        // Set the selected value for the name dropdown
        nameDropdown.selectedIndex = i;
        break;
    }
  }

  // Set the selected values for the dropdowns
  animalDropdown.value = animalValue;
}

function updateBackgroundColor(id, color){
  // Assuming you have an element with the id "myElement"
  const myElement = document.getElementById(id);

  // Change the background color to dark gray
  myElement.style.backgroundColor = color;
}

function showPopup(){
  const popupContainer = d3.select('#popup-container');
  // Show pop-up by moving it into view
  popupContainer.transition().duration(300)
  .style('right', '0');
}

// general update of popup - depends on global values of originalData and previousCircle
function updatePopup(){
  const popupContainer = d3.select('#popup-container');
  const popupContent = d3.select('#popup-content');

  const stringData = Object.entries(originalData)
      .filter(([key]) => excludedProperties.includes(key));
  const numData = Object.entries(originalData)
        .filter(([key]) => includedProperties.includes(key))
        .sort(([key1], [key2]) => includedProperties.indexOf(key1) - includedProperties.indexOf(key2));

  // Update pop-up content based on circle data
  let contentHtml = '';
  
  var sublabeldict={};

  if (previousCircle !== null) {
      updateDropdownValues('bubble-nameDropdown2', 'bubble-animalDropdown2', previousCircle.name, previousCircle.animal);
      updateDropdownValues('bubble-nameDropdown1', 'bubble-animalDropdown1', originalData.name, originalData.animal);        

      updateBackgroundColor('bubble-nameDropdown1', color1);
      updateBackgroundColor('bubble-animalDropdown1', color1);

      updateBackgroundColor('bubble-nameDropdown2', color2);
      updateBackgroundColor('bubble-animalDropdown2', color2);
      
      sublabeldict={
        "car_kms":`Climate Change Impact (kg CO2/kg cheese): ${parseFloat(originalData.climate_change).toFixed(2)} vs ${parseFloat(previousCircle.climate_change).toFixed(2)}`,
        "macbook_hrs":`Energy Depleted (MJ/kg cheese): ${parseFloat(originalData.depl_energy_total).toFixed(2)} vs ${parseFloat(previousCircle.climate_change).toFixed(2)}`,
        "water_people":`Water Depleted (m3/kg of cheese): ${parseFloat(originalData.depl_water_total).toFixed(2)} vs ${parseFloat(previousCircle.climate_change).toFixed(2)}`,
        "ef_score":""
        };

  } else {

      updateDropdownValues('bubble-nameDropdown1', 'bubble-animalDropdown1', originalData.name, originalData.animal);
      updateBackgroundColor('bubble-nameDropdown1', color1);
      updateBackgroundColor('bubble-animalDropdown1', color1);

      updateDropdownValues('bubble-nameDropdown2', 'bubble-animalDropdown2', '', '');
      updateBackgroundColor('bubble-nameDropdown2', "#ddd");
      updateBackgroundColor('bubble-animalDropdown2', "#ddd");

      sublabeldict={
        "car_kms":`Climate Change Impact (kg CO2/kg cheese): ${parseFloat(originalData.climate_change).toFixed(2)}`,
        "macbook_hrs":`Energy Depleted (MJ/kg cheese): ${parseFloat(originalData.depl_energy_total).toFixed(2)}`,
        "water_people":`Water Depleted (m3/kg cheese): ${parseFloat(originalData.depl_water_total).toFixed(2)}`,
        "ef_score":""
        };
  };
  
  popupContent.html(contentHtml);
  
  // Iterate through all keys in filteredData
  for (const [key, value] of numData) {
      // Extract max values for all circles
      const maxscore = maxscores[key];
      const circleradius=15;
      const xadj=17.8;
      const opacity=0.5;
      const basey=50;
      const yadj=basey-12;

      // Add SVG for the line and marker for each key
      let lineSvg = `
          <svg width="100%" height="100">
              <text x="50%" y="0%" font-size="13" fill="black" text-anchor="middle" alignment-baseline="hanging">${labeldict[key]}</text>
              <text x="50%" y="15%" font-size="10" fill="black" text-anchor="middle" alignment-baseline="hanging">${(sublabeldict[key])}</text>
              <line x1="10%" y1="${basey}" x2="90%" y2="${basey}" stroke="#909090" stroke-width="1" />
              <circle cx="${(value / maxscore) * 60 + 20}%" cy="${basey}" r="${circleradius}" fill="${color1}" />
              <text x="${(value / maxscore) * 60 + 19}%" y="${basey+25}" font-size="10" fill="${textcolor1}">${value.toFixed(rounddict[key])}</text>
              <image xlink:href="${iconsdict[key]}" x="${(value / maxscore) * 60 + xadj}%" y="${yadj}" width="${circleradius*1.5}" height="${circleradius*1.5}" opacity=${opacity} />
          </svg>`;
      
      // Check if previousCircle is not null
      if (previousCircle !== null) {
        // Specify the key to get prevValue from previousCircle
        const prevValue = previousCircle[key];

        // Add additional circles based on the prevValue
        lineSvg = `
          <svg width="100%" height="100">
              <text x="50%" y="0%" font-size="13" fill="black" text-anchor="middle" alignment-baseline="hanging">${labeldict[key]}</text>
              <line x1="10%" y1="${basey}" x2="90%" y2="${basey}" stroke="lightgray" stroke-width="1" />
              <circle cx="${(value / maxscore) * 60 + 20}%" cy="${basey}" r="${circleradius}" fill="${color1}" />
              <text x="${(value / maxscore) * 60 + 20}%" y="${basey+25}" font-size="10" fill="${textcolor1}">${value.toFixed(rounddict[key])}</text>
              <image xlink:href="${iconsdict[key]}" x="${(value / maxscore) * 60 + xadj}%" y="${yadj}" width="${circleradius*1.5}" height="${circleradius*1.5}" opacity=${opacity} />

              <circle cx="${(prevValue / maxscore) * 60 + 20}%" cy="${basey}" r="${circleradius}" fill="${color2}" />
              <text x="${(prevValue / maxscore) * 60 + 19}%" y="${basey-20}" font-size="10" fill="${textcolor2}">${prevValue.toFixed(rounddict[key])}</text>
              <image xlink:href="${iconsdict[key]}" x="${(prevValue / maxscore) * 60 + xadj}%" y="${yadj}" width="${circleradius*1.5}" height="${circleradius*1.5}" opacity=${opacity} />
              
          </svg>`;
      }
      // Append the generated lineSvg to the container
      popupContent.append('div')
          .html(lineSvg);
  }

  // Set the selected circle
  selectedCircle = originalData.index;
  previousCircle = originalData;

}

// Show/hide pop-up function for clicking the bubble
function togglePopup(d) {
  const i=d.srcElement.__data__['index'];

  if (selectedCircle === i) {
      // console.log('Clicked again');
      // Clicked the same circle again, hide the pop-up
      hidePopup();
  } else {
      // Get data from the circle
      originalData = d.srcElement.__data__;
      console.log(originalData)
      updatePopup();
      showPopup();
  }
}

function resetPopup(){
  const popupContent = d3.select('#popup-content');
  popupContent.html('');
  showPopup();

  updateDropdownValues('bubble-nameDropdown2', 'bubble-animalDropdown2', '', '');
  updateBackgroundColor('bubble-nameDropdown2', "#ddd");
  updateBackgroundColor('bubble-animalDropdown2', "#ddd");

  updateDropdownValues('bubble-nameDropdown1', 'bubble-animalDropdown2', '', '');
  updateBackgroundColor('bubble-nameDropdown1', "#ddd");
  updateBackgroundColor('bubble-animalDropdown1', "#ddd");

  originalData=null;
  previousCircle=null;
}

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
      .range(["#EDB458","#E8871E","#C8963E","#697e3e"]);

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
          ef_score:+d.ef_score,
          protein:+d.protein,
          macbook_hrs: +d.macbook_hrs,
          water_people: +d.water_people,
          car_kms: +d.car_kms,
          depl_water_total: +d.depl_water_total,
          depl_energy_total: +d.depl_energy_total    
        };
      })
      .on('click', togglePopup)
      ;
    
    /* Fix hover attributes */
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

    }

// Hide pop-up function
function hidePopup() {
  d3.select('#popup-container').transition().duration(100)
      .style('right', '-550px')
      .style('left', '')
      .ease(d3.easeCubicInOut);
  previousCircle = null;
  selectedCircle = null;

  updateDropdownValues('bubble-nameDropdown2', 'bubble-animalDropdown2', '', '');
  updateDropdownValues('bubble-nameDropdown1', 'bubble-animalDropdown1', '', '');
  
  updateBackgroundColor('bubble-nameDropdown1', "#ddd");
  updateBackgroundColor('bubble-animalDropdown1', "#ddd");

  updateBackgroundColor('bubble-nameDropdown2', "#ddd");
  updateBackgroundColor('bubble-animalDropdown2', "#ddd");
}

function forgetComparison(){
  previousCircle = null;
  updateDropdownValues('bubble-nameDropdown2', 'bubble-animalDropdown2', '', '');
  updateBackgroundColor('bubble-nameDropdown2', "#ddd");
  updateBackgroundColor('bubble-animalDropdown2', "#ddd");
  updatePopup()
}


function dropdownPopup(){
    // Get values from the first set of dropdowns
    selectedName1 = document.getElementById('bubble-nameDropdown1').value;
    selectedAnimal1 = document.getElementById('bubble-animalDropdown1').value;

    // Get values from the second set of dropdowns
    selectedName2 = document.getElementById('bubble-nameDropdown2').value;
    selectedAnimal2 = document.getElementById('bubble-animalDropdown2').value;
    
    // Perform filtering based on selected values
    originalData = csvdata.filter(entry => entry.name === selectedName1 && entry.animal === selectedAnimal1)[0];
    if (selectedAnimal2!==''){
      previousCircle = csvdata.filter(entry => entry.name === selectedName2 && entry.animal === selectedAnimal2)[0];
    }
    else{
      previousCircle=null;
    };
    
    updatePopup();

}

// add zoom function to prevent bubbles from spilling out of the svg frame
function zoomed() {
  svg.selectAll(".bubbles")
      .attr("transform", d3.event.transform);
}

// Information functions
function openInfoPopup() {
  document.getElementById('info-popup-container').style.display = 'block';
}

function closeInfoPopup() {
  document.getElementById('info-popup-container').style.display = 'none';
}
