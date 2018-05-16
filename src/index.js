require("./scss/index.scss");
import * as d3 from "d3";
import moment from "moment";

const dataUrl =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const formatCurrency = d3.format("$,.2f");
const t = d3.transition().duration(750);

const margin = {
  top: 0,
  right: 20,
  bottom: 100,
  left: 80
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
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const xAxisGroup = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`);

const yAxisGroup = g.append("g").attr("class", "y axis");

// Scales
const xScale = d3.scaleTime().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// X Label
g
  .append("text")
  .attr("class", "x axis-label")
  .attr("x", width / 2)
  .attr("y", height + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Years");

// Y Label
g
  .append("text")
  .attr("class", "y axis-label")
  .attr("x", -(height / 2))
  .attr("y", -20)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Gross Domestic Product, USA");

d3.json(dataUrl).then(response => {
  const data = response.data.map(
    d =>
      (d = {
        date: d[0],
        gdp: d[1]
      })
  );
  update(data);
});

function update(data) {
  const minDate = new Date(data[0].date);
  const maxDate = new Date(data[data.length - 1].date);
  const barWidth = Math.ceil(width / data.length);

  xScale.domain([minDate, maxDate]);
  yScale.domain([0, d3.max(data, d => d.gdp)]);

  const xAxisCall = d3.axisBottom(xScale);
  xAxisGroup.call(xAxisCall);

  const yAxisCall = d3.axisRight(yScale).tickSize(width);
  yAxisGroup
    .call(yAxisCall)
    .selectAll("text")
    .attr("y", "10")
    .attr("x", "0")
    .attr("text-anchor", "start");

  // JOIN new data with old elements
  const rects = g.selectAll("rect").data(data, d => d.date);

  // EXIT old elements not present in new data
  rects
    .exit()
    .attr("fill", "red")
    .transition(t)
    .attr("y", yScale(0))
    .attr("height", 0)
    .remove();

  // ENTER new elements present in new data
  rects
    .enter()
    .append("rect")
    .attr("fill", "#2F736C")
    .attr("opacity", ".9")
    .attr("x", d => xScale(new Date(d.date)))
    .attr("width", barWidth)
    .attr("y", yScale(0))
    .attr("height", 0)
    .on("mouseover", handleMouseover)
    .on("mouseout", handleMouseout)
    // And UPDATE old elements present in new data
    .merge(rects)
    .transition(t)
    .attr("x", d => xScale(new Date(d.date)))
    .attr("width", barWidth)
    .attr("y", d => yScale(d.gdp))
    .attr("height", d => height - yScale(d.gdp));
}

function handleMouseover(d) {
  d3.select(this).attr("fill", "#b4fef7");
  div
    .transition()
    .duration(200)
    .style("opacity", 0.9);
  div
    .html(
      `<span class='amount'> ${formatCurrency(
        d.gdp
      )}B </span><span class='year'>${moment(d.date).format(
        "YYYY - MMM"
      )}<span>`
    )
    .style("left", d3.event.pageX + "px")
    .style("top", d3.event.pageY - 28 + "px");
}

function handleMouseout(d) {
  d3.select(this).attr("fill", "#2F736C");
  div
    .transition()
    .duration(500)
    .style("opacity", 0);
}
