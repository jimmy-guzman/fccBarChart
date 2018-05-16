require("./scss/index.scss");
import * as d3 from "d3";
import moment from "moment";

const dataUrl =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const formatCurrency = d3.format("$,.2f");

const margin = {
  top: 10,
  right: 10,
  bottom: 100,
  left: 100
};

const width =
    parseInt(d3.select("#chart-area").style("width")) -
    margin.left -
    margin.right,
  height = 500 - margin.top - margin.bottom;

const g = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const xAxisGroup = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0, " + height + ")");

const yAxisGroup = g.append("g").attr("class", "y axis");
// Scales
const xScale = d3.scaleTime().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// X Label
g
  .append("text")
  .attr("class", "x axis-label")
  .attr("x", width / 2)
  .attr("y", height + 60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Years");

// Y Label
g
  .append("text")
  .attr("class", "y axis-label")
  .attr("x", -(height / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Gross Domestic Product, USA");

d3.json(dataUrl).then(response => {
  update(response.data);
});

function update(data) {
  const minDate = new Date(data[0][0]);

  const maxDate = new Date(data[274][0]);
  const barWidth = Math.ceil(width / data.length);

  xScale.domain([minDate, maxDate]);
  yScale.domain([0, d3.max(data, d => d[1])]);

  const xAxisCall = d3.axisBottom(xScale);
  xAxisGroup.call(xAxisCall);

  const yAxisCall = d3.axisLeft(yScale).ticks(9);
  yAxisGroup.call(yAxisCall);

  const rects = g
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => xScale(new Date(d[0])))
    .attr("y", d => yScale(d[1]))
    .attr("width", barWidth)
    .attr("height", d => height - yScale(d[1]))
    .attr("fill", "#2F736C")
    .on("mouseover", function(d) {
      d3.select(this).attr("fill", "#b4fef7");
      div
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      div
        .html(
          `<span class='amount'> ${formatCurrency(
            d[1]
          )}B </span><span class='year'>${moment(d[0]).format(
            "YYYY - MMM"
          )}<span>`
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      d3.select(this).attr("fill", "#2F736C");
      div
        .transition()
        .duration(500)
        .style("opacity", 0);
    });
}
