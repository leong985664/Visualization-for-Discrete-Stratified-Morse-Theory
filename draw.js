class Draw {

    constructor(vertices, faces, edges) {

        // change for 3d
        this.xmin = Infinity;
        this.xmax = -Infinity;
        this.ymin = Infinity;
        this.ymax = -Infinity;

        for (let v of vertices) {
            if (v.xcoord < this.xmin)
                this.xmin = v.xcoord;
            if (v.xcoord > this.xmax)
                this.xmax = v.xcoord;
            if (v.ycoord < this.ymin)
                this.ymin = v.ycoord;
            if (v.ycoord > this.ymax)
                this.ymax = v.ycoord;
        }

        this.vertices = vertices;
        this.faces = faces;
        this.edges = edges;

        this.canvas = d3.select('#canvas');
        this.width = this.canvas.attr('width');
        this.height = this.canvas.attr('height');

        this.xScale = d3.scaleLinear()
            .domain([this.xmin, this.xmax])
            .range([50,350])
        this.yScale = d3.scaleLinear()
            .domain([this.ymin, this.ymax])
            .range([50,350])

        this.egroup = this.canvas.append('g')
            .attr('id', 'egroup');
        this.etgroup = this.canvas.append('g')
            .attr('id', 'etgroup');
        this.vgroup = this.canvas.append('g')
            .attr('id', 'vgroup');
        this.vtgroup = this.canvas.append('g')
            .attr('id', 'vtgroup');
    }

    draw() {
        this.drawEdges(this.egroup, this.etgroup, this.edges, this.xScale, this.yScale);
        this.drawVertices(this.vgroup, this.vtgroup, this.vertices, this.xScale, this.yScale);
    }

    drawEdges(egroup, etgroup, edges, xScale, yScale) {
        let es = egroup.selectAll('line')
            .data(edges)
        es.exit().remove();
        es = es.enter().append('line').merge(es)
            .attr('x1', d => xScale(d.start.xcoord))
            .attr('y1', d => yScale(d.start.ycoord))
            .attr('x2', d => xScale(d.end.xcoord))
            .attr('y2', d => yScale(d.end.ycoord))
            .attr('class', 'edge')
            .attr('id', function (d) {
                return 'e'+d.id;
            })

        let ets = etgroup.selectAll('text')
            .data(edges);
        ets.exit().remove();
        ets = ets.enter().append('text').merge(ets)
            .attr('x', d => xScale((d.start.xcoord+d.end.xcoord)/2))
            .attr('y', d => yScale((d.start.ycoord+d.end.ycoord)/2))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text(d => d.value)
    }

    drawVertices(vgroup, vtgroup, vertices, xScale, yScale) {
        let vs = vgroup.selectAll('circle')
            .data(vertices);
        vs.exit().remove();
        vs = vs.enter().append('circle').merge(vs)
            .attr('cx', d => xScale(d.xcoord))
            .attr('cy', d => yScale(d.ycoord))
            .attr('r', 10)
            .attr('class', 'vertex')
            .attr('id', function (d) {
                return 'v'+d.id;
            })

        let vts = vtgroup.selectAll('text')
            .data(vertices);
        vts.exit().remove();
        vts = vts.enter().append('text').merge(vts)
            .attr('x', d => xScale(d.xcoord))
            .attr('y', d => yScale(d.ycoord))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text(d => d.value)
    }
}