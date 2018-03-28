var width = 1500,
    height = 800;

var dataCache;
var dataCacheYear = [];
var dataCacheCity = [];
var dataCacheCountry = [];
var dataCacheEventType = [];
var dataCacheActor = [];
var currentCompareAttribute = 'year';

var projection = d3.geo.kavrayskiy7()
    .scale(200)
    .center([20,-0])
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

var svgGlobe = d3.select("#globe").append("svg")
    .attr("width", width)
    .attr("height", height);

// draw globe
loadAndDrawGlobe();

// load conflict city
loadConflictDataset();
drawConflict("year")

d3.select(self.frameElement).style("height", height + "px");

$('.globe-checkbox').click(function(){

    var type = document.getElementById('attibute-to-compare-dropdown').innerHTML.split("Attribute To Compare - ")[1]
    drawConflict(type)
});

function loadAndDrawGlobe(){

    svgGlobe.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", path);

    svgGlobe.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    svgGlobe.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");

    svgGlobe.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    d3.json("world-110m.v1.json", function(error, world) {
        if (error) throw error;

        var countries = topojson.feature(world, world.objects.countries).features,
            neighbors = topojson.neighbors(world.objects.countries.geometries);

        svgGlobe.selectAll(".country")
            .data(countries)
            .enter().insert("path", ".graticule")
            .attr("class", "country")
            .attr("d", path)
            .style("fill", "#EEEEEE"/*function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) {return countries[n].color;}) + 1 | 0); }*/);

        svgGlobe.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("d", path);
    });
}

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
    svgGlobe.selectAll(".conflict-point").remove();

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

    svgGlobe.selectAll(".conflict")
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