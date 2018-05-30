var dataCache;
var dataCacheYear = [];
var dataCacheCity = [];
var dataCacheCountry = [];
var dataCacheEventType = [];
var dataCacheActor = [];


var width = 962,
    rotated = 90,
    height = 502;

//countries which have states, needed to toggle visibility
//for USA/ etc. either show countries or states, not both
var usa, canada;
var states; //track states
//track where mouse was clicked
var initX;
//track scale only rotate when s === 1
var s = 1;
var mouseClicked = false;


var projection = d3.geo.mercator()
    .scale(153)
    .translate([width/2,height/1.5])
    .rotate([rotated,0,0]); //center on USA because 'murica

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 20])
    .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    //track where user clicked down
    .on("mousedown", function() {
        d3.event.preventDefault();
        //only if scale === 1
        if(s !== 1) return;
        initX = d3.mouse(this)[0];
        mouseClicked = true;
    })
    .on("mouseup", function() {
        if(s !== 1) return;
        rotated = rotated + ((d3.mouse(this)[0] - initX) * 360 / (s * width));
        mouseClicked = false;
    })
    .call(zoom);


function rotateMap(endX) {
    projection.rotate([rotated + (endX - initX) * 360 / (s * width),0,0])
    g.selectAll('path')       // re-project path data
        .attr('d', path);
}
//for tooltip
var offsetL = document.getElementById('map').offsetLeft-200;
var offsetT = document.getElementById('map').offsetTop;

var path = d3.geo.path()
    .projection(projection);

var tooltip = d3.select("#map")
    .append("div")
    .attr("class", "tooltip hidden");

//need this for correct panning
var g = svg.append("g");

//det json data and draw it
d3.json("combined2.json", function(error, world) {
    if(error) return console.error(error);

    //countries
    g.append("g")
        .attr("class", "boundary")
        .selectAll("boundary")
        .data(topojson.feature(world, world.objects.countries).features)
        .enter().append("path")
        .attr("name", function(d) {return d.properties.name;})
        .attr("id", function(d) { return d.id;})
        // .on('click', selected)
        .on("mousemove", showTooltip)
        .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true);
        })
        .attr("d", path);

    usa = d3.select('#USA');
    canada = d3.select('#CAN');

    //states
    g.append("g")
        .attr("class", "boundary state hidden")
        .selectAll("boundary")
        .data(topojson.feature(world, world.objects.states).features)
        .enter().append("path")
        .attr("name", function(d) { return d.properties.name;})
        .attr("id", function(d) { return d.id;})
        .on("mousemove", showTooltip)
        .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true);
        })
        .attr("d", path);

    states = d3.selectAll('.state');
});

// load conflict city
loadConflictDataset();
drawConflict("year")

function loadConflictDataset() {

    d3.csv("african_conflicts.csv", function(error, conflict) {
        if (error) throw error;

        dataCache = conflict

        for (var i in dataCache) {

            d = conflict[i]
            dataCacheYear.push(d["YEAR"]);
            dataCacheCity.push(d["LOCATION"]);
            dataCacheCountry.push(d["COUNTRY"]);
            dataCacheEventType.push(d["EVENT_TYPE"]);
            dataCacheActor.push(d["ACTOR1"]);
            dataCacheActor.push(d["ACTOR2"]);
        }

        dataCacheYear = dataCacheYear.filter(function (x, i, a) {
            return a.indexOf(x) == i && x !== undefined && x !== "";
        }).sort(function(a,b){return a-b})

        dataCacheCity = dataCacheCity.filter(function (x, i, a) {
            return a.indexOf(x) == i && x !== undefined && x !== "";
        });

        dataCacheCountry = dataCacheCountry.filter(function (x, i, a) {
            return a.indexOf(x) == i && x !== undefined && x !== "";
        });

        dataCacheActor = dataCacheActor.filter(function (x, i, a) {
            return a.indexOf(x) == i && x !== undefined && x !== "";
        });

        dataCacheEventType = dataCacheEventType.filter(function (x, i, a) {
            return a.indexOf(x) == i && x !== undefined && x !== "";
        });

        // append year dropdown selection for the globe
        for (i in dataCacheYear) {
            var year = dataCacheYear[i];
            document.getElementById('globe-year-select').innerHTML = document.getElementById('globe-year-select').innerHTML + "<option class=\"globe-checkbox-select\"  id=\"YEAR" + year + "\" value=\"" + year + "\">" + year + "</option>\n";
        }

        for (i in dataCacheCity) {
            var year = dataCacheCity[i].toString();
            document.getElementById('globe-city-select').innerHTML = document.getElementById('globe-city-select').innerHTML + "<option class=\"globe-checkbox-select\"  id=\"CITY" + year + "\" value=" + year + "> " + year + "</option>";
        }

        for (i in dataCacheCountry) {
            var year = dataCacheCountry[i].toString();
            document.getElementById('globe-country-select').innerHTML = document.getElementById('globe-country-select').innerHTML + "<option class=\"globe-checkbox-select\"  id=\"COUNTRY" + year + "\" value=" + year + "> " + year + "</option>";
        }

        for (i in dataCacheActor) {
            var year = dataCacheActor[i].toString();
            document.getElementById('globe-actor-select').innerHTML = document.getElementById('globe-actor-select').innerHTML + "<option class=\"globe-checkbox-select\"  id=\"ACTOR" + year + "\"  value=" + year + "> " + year + "</option>";
        }

        for (i in dataCacheEventType) {
            var year = dataCacheEventType[i].toString();
            document.getElementById('globe-event-select').innerHTML = document.getElementById('globe-event-select').innerHTML + "<option class=\"globe-checkbox-select\"  id=\"EVENT" + year + "\" value=" + year + "> " + year + "</option>";
        }

        $(function () {
            $('.globe-checkbox').multiselect({
                includeSelectAllOption: true
            });
        });
    });

}

function drawConflict(type) {

    // remove all conflict dots
    svg.selectAll(".conflict-point").remove();

    // get all year selections
    var selectedYear = dataCacheYear.filter(function (x, i, a) {
        return document.getElementById("YEAR"+x).selected;
    });

    var selectedCity = dataCacheCity.filter(function (x, i, a) {
        return document.getElementById("CITY"+x).selected;
    });

    var selectedCountry = dataCacheCountry.filter(function (x, i, a) {
        return document.getElementById("COUNTRY"+x).selected;
    });

    var selectedActor = dataCacheActor.filter(function (x, i, a) {
        return document.getElementById("ACTOR"+x).selected;
    });

    var selectedEvent = dataCacheEventType.filter(function (x, i, a) {
        return document.getElementById("EVENT"+x).selected;
    });

    // get the color
    var color;
    var array;
    switch(type) {

        case 'year':

            color = randomColors(selectedYear.length);
            array = selectedYear;
            break;
        case 'country':

            color = randomColors(selectedCountry.length);
            array = selectedCountry;
            break;
        case 'city':

            color = randomColors(selectedCity.length);
            array = selectedCity;
            break;
        case 'actor':

            color = randomColors(selectedActor.length);
            array = selectedActor;
            break;
        case 'event':

            color = randomColors(selectedEvent.length);
            array = selectedEvent;
            break;
    }

    g.selectAll(".conflict")
        .data(dataCache.filter(function(x, i, a) {
            return selectedYear.indexOf(x["YEAR"]) > -1 &&
                selectedCity.indexOf(x["LOCATION"]) > -1 &&
                selectedCountry.indexOf(x["COUNTRY"]) > -1 &&
                (selectedActor.indexOf(x["ACTOR1"]) > -1 || selectedActor.indexOf(x["ACTOR2"]) > -1) &&
                selectedEvent.indexOf(x["EVENT_TYPE"]) > -1
        }))
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return projection([d.LONGITUDE, d.LATITUDE])[0];
        })
        .attr("cy", function (d) {
            return projection([d.LONGITUDE, d.LATITUDE])[1];
        })
        .attr("class", "conflict-point")
        .attr("r", 1)
        .attr("d", path)
        .style("cursor", "pointer")
        .style("fill", function (d) {

            var c;
            if (type == "year") {
                c = color[array.indexOf(d["YEAR"])]
            } else if (type == "country") {
                c =  color[array.indexOf(d["COUNTRY"])]
            } else if (type == "city") {
                c =  color[array.indexOf(d["LOCATION"])]
            } else if (type == "actor") {
                c =  color[array.indexOf(d["ACTOR1"])]
            } else if (type == "event") {
                c =  color[array.indexOf(d["EVENT_TYPE"])]
            }
            return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
        })
        .on({
            "click":  function(d) {
                document.getElementById('id01').style.display='block';
                document.getElementById('modal-content').innerHTML = "<p>Actor1: " + d["ACTOR1"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>Actor2: " + d["ACTOR2"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>Admin1: " + d["ADMIN1"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>Admin2: " + d["ADMIN2"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>All Actor 1: " + d["ALLY_ACTOR_1"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>All Actor 2: " + d["ALLY_ACTOR_2"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>Country: " + d["COUNTRY"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>Event Date: " + d["EVENT_DATE"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>Event Type: " + d["EVENT_TYPE"] + "</p>";
                document.getElementById('modal-content').innerHTML = document.getElementById('modal-content').innerHTML + "<p>Notes: " + d["NOTES"] + "</p>";
            }
        });


    d3.select(".conflict")
        .data(array)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            100;
        })
        .attr("cy", function (d) {
            var index = array.indexOf(d)
            return 500 + index * 20
        })
        .attr("class", "conflict-explain")
        .attr("r", 5)
        .attr("d", path)
        .attr("position", "absolute")
        .style("fill", function (d) {
            var index = array.indexOf(d)
            return "rgb(" + color[index][0] + "," + color[index][1] + "," + color[index][2] + ")";
        });
}

function drawGraph(type) {

    // remove all conflict dots
    svg.selectAll(".conflict-graph").remove();

    // get all year selections
    var selectedYear = dataCacheYear.filter(function (x, i, a) {
        return document.getElementById("YEAR"+x).selected;
    });

    var selectedCity = dataCacheCity.filter(function (x, i, a) {
        return document.getElementById("CITY"+x).selected;
    });

    var selectedCountry = dataCacheCountry.filter(function (x, i, a) {
        return document.getElementById("COUNTRY"+x).selected;
    });

    var selectedActor = dataCacheActor.filter(function (x, i, a) {
        return document.getElementById("ACTOR"+x).selected;
    });

    var selectedEvent = dataCacheEventType.filter(function (x, i, a) {
        return document.getElementById("EVENT"+x).selected;
    });

    // get the color
    var colors;
    var array;
    var data;
    var histogramData = [];

    var selectedData = dataCache.filter(function(x, i, a) {
        return selectedYear.indexOf(x["YEAR"]) > -1 &&
            selectedCity.indexOf(x["LOCATION"]) > -1 &&
            selectedCountry.indexOf(x["COUNTRY"]) > -1 &&
            (selectedActor.indexOf(x["ACTOR1"]) > -1 || selectedActor.indexOf(x["ACTOR2"]) > -1) &&
            selectedEvent.indexOf(x["EVENT_TYPE"]) > -1
    });

    switch(type) {

        case 'year':
            //
            // colors = randomColors(selectedYear.length);
            // array = selectedYear;

            // histogram of location(city) against number of time
            var data = {};
            for (var i = 0; i < selectedData.length; i++) {
                data[selectedData[i]["LOCATION"]] = 1 + (data[selectedData[i]] || 0);
            }

            for (var key in data) {
                histogramData.push([data[key], key]);
            }
            colors = randomColors(histogramData.length)
            draw();

            break;
        case 'country':

            colors = randomColors(selectedCountry.length);
            array = selectedCountry;
            break;
        case 'city':

            colors = randomColors(selectedCity.length);
            array = selectedCity;
            break;
        case 'actor':

            colors = randomColors(selectedActor.length);
            array = selectedActor;
            break;
        case 'event':

            colors = randomColors(selectedEvent.length);
            array = selectedEvent;
            break;
    }

    var canvas, ctx;
    var barWidth;
    var linesToDraw;
    var id;
    var textBuffer = 20;
    var block = 30;
    var margin = 10;

    function draw() {
        canvas = document.getElementById('histogram');
        ctx = canvas.getContext('2d');
        barWidth = (canvas.width / data.length) - margin;

        drawHistogram();
    }

    function drawHistogram() {
        cancelAnimationFrame(id);
        ctx.clearRect(0,0, canvas.width, canvas.height);
        drawAxisLabels();
        linesToDraw = block * 12;

        id = requestAnimationFrame(drawBars);
    }

    function drawBars() {
        ctx.save();

        ctx.translate(20, canvas.height-20);

        for (var j=0; j<histogramData.length; j++) {
            var currentLine = 360 - linesToDraw;
            ctx.fillStyle = colors[j];
            if (block*histogramData[j][0] >= currentLine)
                ctx.fillRect(barWidth*j + margin*j,0,barWidth,-currentLine);
        }

        linesToDraw--;

        if (linesToDraw > 0) {
            id = requestAnimationFrame(drawBars);
        }

        ctx.restore();
    }

    function drawAxisLabels() {
        ctx.save();

        ctx.translate(20, canvas.height-20);

        for (var i=0; i<histogramData.length; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillText(histogramData[i][1], barWidth*i + margin*i + 5, 15);
        }

        for (var j=0; j<=12; j++) {
            ctx.fillStyle = 'black';
            ctx.fillText(j, -textBuffer, -j * block);
        }

        ctx.restore();
    }
}

function redrawConflict(){

    var type = document.getElementById('attibute-to-compare-dropdown').innerHTML.split("Attribute To Compare - ")[1];
    type = type.split("\n")[0];
    drawConflict(type.toLowerCase());
}

function randomColors(total)
{
    function hsvToRgb(h, s, v) {
        var r, g, b;
        var i;
        var f, p, q, t;

        // Make sure our arguments stay in-range
        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        v = Math.max(0, Math.min(100, v));

        // We accept saturation and value arguments from 0 to 100 because that's
        // how Photoshop represents those values. Internally, however, the
        // saturation and value are calculated from a range of 0 to 1. We make
        // That conversion here.
        s /= 100;
        v /= 100;

        if(s == 0) {
            // Achromatic (grey)
            r = g = b = v;
            return [
                Math.round(r * 255),
                Math.round(g * 255),
                Math.round(b * 255)
            ];
        }

        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i; // factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));

        switch(i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;

            case 1:
                r = q;
                g = v;
                b = p;
                break;

            case 2:
                r = p;
                g = v;
                b = t;
                break;

            case 3:
                r = p;
                g = q;
                b = v;
                break;

            case 4:
                r = t;
                g = p;
                b = v;
                break;

            default: // case 5:
                r = v;
                g = p;
                b = q;
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

    var i = 360 / (total - 1); // distribute the colors evenly on the hue range
    var r = []; // hold the generated colors
    for (var x=0; x<total; x++)
    {
        r.push(hsvToRgb(i * x, 100, 100)); // you can also alternate the saturation and value for even more contrast between the colors
    }
    return r;
}

function showTooltip(d) {
    label = d.properties.name;
    var mouse = d3.mouse(svg.node())
        .map( function(d) { return parseInt(d); } );
    tooltip.classed("hidden", false)
        .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
        .html(label);
}

function zoomed() {
    var t = d3.event.translate;
    s = d3.event.scale;
    var h = 0;

    t[0] = Math.min(
        (width/height)  * (s - 1),
        Math.max( width * (1 - s), t[0] )
    );

    t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(height  * (1 - s) - h * s, t[1])
    );

    zoom.translate(t);
    if(s === 1 && mouseClicked) {
        rotateMap(d3.mouse(this)[0])
        return;
    }

    g.attr("transform", "translate(" + t + ")scale(" + s + ")");

    //adjust the stroke width based on zoom level
    d3.selectAll(".boundary")
        .style("stroke-width", 1 / s);

    //toggle state/USA visability
    if(s > 1.5) {
        states
            .classed('hidden', false);
        usa
            .classed('hidden', true);
        canada
            .classed('hidden', true);
    } else {
        states
            .classed('hidden', true);
        usa
            .classed('hidden', false);
        canada
            .classed('hidden', false);
    }
}
/*
 Modal
 */