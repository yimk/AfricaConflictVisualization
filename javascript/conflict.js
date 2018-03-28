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

            color = randomColors(dataCacheYear.length);
            array = dataCacheYear;
        case 'country':

            color = randomColors(dataCacheCountry.length);
            array = dataCacheCountry;
        case 'city':

            color = randomColors(dataCacheCity.length);
            array = dataCacheCity;
        case 'actor':

            color = randomColors(dataCacheActor.length);
            array = dataCacheActor;
        case 'event':

            color = randomColors(dataCacheEventType.length);
            array = dataCacheEventType;
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
            return c[array.indexOf(d)];
        });
}