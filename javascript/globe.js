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