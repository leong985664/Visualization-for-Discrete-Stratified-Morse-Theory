class DMT {

    constructor(vertices, faces, edges) {
        this.vertices = vertices;
        this.faces = faces;
        this.edges = edges;

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

        this.canvas = d3.select('#canvas');
        this.width = this.canvas.attr('width');
        this.height = this.canvas.attr('height');

        this.xScale = d3.scaleLinear()
            .domain([this.xmin, this.xmax])
            .range([50,350])
        this.yScale = d3.scaleLinear()
            .domain([this.ymin, this.ymax])
            .range([50,350])
    }

    clear() {
        d3.selectAll('li').remove();
        this.canvas.selectAll('g').remove();
        this.fgroup = this.canvas.append('g')
            .attr('id', 'fgroup');
        this.ftgroup = this.canvas.append('g')
            .attr('id', 'ftgroup');
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
        this.clear();
        this.drawFaces();
        this.drawEdges();
        this.drawVertices();
        this.computeUL();
    }

    drawFaces() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        let fs = this.fgroup.selectAll('polygon')
            .data(this.faces);
        fs.exit().remove();
        fs = fs.enter().append('polygon').merge(fs)
            .attr('points', function (d) {
                let result = '';
                for (let p of d.point) {
                    result += xScale(p.xcoord)+','+yScale(p.ycoord)+' '
                }
                return result;
            })
            .attr('class', 'face')
            .attr('id', function (d) {
                return 'f'+d.id;
            })

        let fts = this.ftgroup.selectAll('text')
            .data(this.faces);
        fts.exit().remove();
        fts = fts.enter().append('text').merge(fts)
            .attr('x', function (d) {
                let sum = 0;
                for (let p of d.point) {
                    sum += p.xcoord;
                }
                return xScale(sum/d.point.length);
            })
            .attr('y', function(d) {
                let sum = 0;
                for (let p of d.point) {
                    sum += p.ycoord;
                }
                return yScale(sum/d.point.length);
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text(d => d.value)
    }

    drawEdges() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        let es = this.egroup.selectAll('line')
            .data(this.edges)
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

        let ets = this.etgroup.selectAll('text')
            .data(this.edges);
        ets.exit().remove();
        ets = ets.enter().append('text').merge(ets)
            .attr('x', d => xScale((d.start.xcoord+d.end.xcoord)/2))
            .attr('y', d => yScale((d.start.ycoord+d.end.ycoord)/2))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text(d => d.value)
    }

    drawVertices() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        let vs = this.vgroup.selectAll('circle')
            .data(this.vertices);
        vs.exit().remove();
        vs = vs.enter().append('circle').merge(vs)
            .attr('cx', d => xScale(d.xcoord))
            .attr('cy', d => yScale(d.ycoord))
            .attr('r', 10)
            .attr('class', 'vertex')
            .attr('id', function (d) {
                return 'v'+d.id;
            })

        let vts = this.vtgroup.selectAll('text')
            .data(this.vertices);
        vts.exit().remove();
        vts = vts.enter().append('text').merge(vts)
            .attr('x', d => xScale(d.xcoord))
            .attr('y', d => yScale(d.ycoord))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text(d => d.value)
    }

    computeUL() {
        this.uVertex = new Array();
        for (let v of this.vertices) {
            let uv = [];
            for (let arm of v.arms) {
                if (arm.value <= v.value)
                    uv.push(arm);
            }
            this.uVertex.push(uv);
        }
        this.lFace = new Array();
        for (let f of this.faces) {
            let lf = [];
            for (let l of f.line) {
                if (l.value >= f.value)
                    lf.push(l);
            }
            this.lFace.push(lf);
        }
        this.uEdge = new Array();
        this.lEdge = new Array();
        for (let e of this.edges) {
            let ue = [];
            for (let w of e.wings) {
                if (w.value <= e.value)
                    ue.push(w);
            }
            let le = [];
            if (e.start.value >= e.value)
                le.push(e.start)
            if (e.end.value >= e.value)
                le.push(e.end)
            this.uEdge.push(ue);
            this.lEdge.push(le);
        }
    }

    findViolator() {
        let violatorVertex = new Array();
        let violatorEdge = new Array();
        let violatorFace = new Array();
        console.log(this.uVertex)
        for (let i = this.uVertex.length-1; i >= 0; i--) {
            if (this.uVertex[i].length > 1) {
                violatorVertex.push(i);
                // this.uVertex.splice(i, 1);
            }
        }
        console.log(violatorVertex);
        console.log(this.uVertex);


        this.violatorVertex = violatorVertex;
    }


    findViolator2() {
        this.violatorEdge = new Array();
        for (let e of this.edges) {
            let nbr1 = e.start.value;
            let nbr2 = e.end.value;
            let value = e.value;
            if (value <= nbr1 && value <= nbr2) {
                this.violatorEdge.push(e)
            }
        }
        this.violatorVertex = new Array();
        for (let v of this.vertices) {
            let isViolator = true;
            let value = v.value;
            for (let e of v.arms) {
                if (value < e.value)
                    isViolator = false;
            }
            if (isViolator) {
                this.violatorVertex.push(v)
            }
        }
    }

    updateViolator() {
        this.findViolator();
        // console.log(this.violatorEdge)
        // for (let e of this.violatorEdge) {
        //     d3.select('#e'+e.id)
        //         .attr('class', 'violatorEdge')
        // }
        // for (let v of this.violatorVertex) {
        //     d3.select('#v'+v.id)
        //         .attr('class', 'violatorVertex')
        // }
        // let violator = d3.select('#violator');
        // let violatorList = violator.selectAll('li')
        //     .data(this.violatorVertex.concat(this.violatorEdge))
        // violatorList.exit().remove();
        // violatorList = violatorList.enter().append('li').merge(violatorList)
        //     .html(function (d) {
        //         return 'f<sup>-1</sup>('+d.value+')';
        //     })
    }

    findCritical() {
        this.criticalEdge = new Array();
        for (let e of this.edges) {
            let nbr1 = e.start.value;
            let nbr2 = e.end.value;
            let value = e.value;
            if (value > nbr1 && value > nbr2) {
                this.criticalEdge.push(e);
            }
        }
        this.criticalVertex = new Array();
        for (let v of this.vertices) {
            let isCritical = true;
            let value = v.value;
            for (let e of v.arms) {
                if (value > e.value)
                    isCritical = false;
            }
            if (isCritical) {
                this.criticalVertex.push(v);
            }
        }
    }

    updateCritical() {
        this.findCritical();
        for (let e of this.criticalEdge) {
            d3.select('#e'+e.id)
                .attr('class', 'criticalEdge')
        }
        for (let v of this.criticalVertex) {
            d3.select('#v'+v.id)
                .attr('class', 'criticalVertex')
        }
        let critical = d3.select('#critical');
        let criticalList = critical.selectAll('li')
            .data(this.criticalVertex.concat(this.criticalEdge))
        criticalList.exit().remove();
        criticalList = criticalList.enter().append('li').merge(criticalList)
            .html(function (d) {
                return 'f<sup>-1</sup>('+d.value+')';
            })
    }

    findPair() {
        this.pair = new Array();
        for (let e of this.edges) {
            let nbr1 = e.start.value;
            let nbr2 = e.end.value;
            let value = e.value;
            if (nbr1 < value && value <= nbr2) {
                this.pair.push([e.end, e]);
            }
            if (nbr2 < value && value <= nbr1) {
                this.pair.push([e.start, e]);
            }
        }
    }

    updatePair() {
        this.findPair();
        for (let p of this.pair) {
            d3.select('#v'+p[0].id)
                .attr('class', 'nonCriticalVertex')
            d3.select('#e'+p[1].id)
                .attr('class', 'nonCriticalEdge')
        }
        let noncritical = d3.select('#noncritical');
        let noncriticalList = noncritical.selectAll('li')
            .data(this.pair)
        noncriticalList.exit().remove();
        noncriticalList = noncriticalList.enter().append('li').merge(noncriticalList)
            .html(function (d) {
                return 'f<sup>-1</sup>('+d[0].value+') => f<sup>-1</sup>('+d[1].value+')';
            })
    }

    updateEdges() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        let es = this.egroup.selectAll('line')
            .data(this.edges)
        es.exit().remove();
        es = es.enter().append('line').merge(es)
            .transition()
            .duration(1000)
            .attr('x1', d => xScale(d.start.xcoord))
            .attr('y1', d => yScale(d.start.ycoord))
            .attr('x2', d => xScale(d.end.xcoord))
            .attr('y2', d => yScale(d.end.ycoord))

        let ets = this.etgroup.selectAll('text')
            .data(this.edges);
        ets.exit().remove();
        ets = ets.enter().append('text').merge(ets)
            .transition()
            .duration(1000)
            .attr('x', d => xScale((d.start.xcoord+d.end.xcoord)/2))
            .attr('y', d => yScale((d.start.ycoord+d.end.ycoord)/2))
    }

    updateVertices() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        let vs = this.vgroup.selectAll('circle')
            .data(this.vertices);
        vs.exit().remove();
        vs = vs.enter().append('circle').merge(vs)
            .transition()
            .duration(1000)
            .attr('cx', d => xScale(d.xcoord))
            .attr('cy', d => yScale(d.ycoord))

        let vts = this.vtgroup.selectAll('text')
            .data(this.vertices);
        vts.exit().remove();
        vts = vts.enter().append('text').merge(vts)
            .transition()
            .duration(1000)
            .attr('x', d => xScale(d.xcoord))
            .attr('y', d => yScale(d.ycoord))
    }

    redraw() {
        this.updateEdges();
        this.updateVertices();
        this.updateViolator();
        this.updateCritical();
        this.updatePair();
    }

    removePair() {
        for (let p of this.pair) {
            //whether pair with start point
            let isStart = true;
            if (p[1].end.id == p[0].id)
                isStart = false;

            //update the vertex on the other side of the edge
            if (isStart) {
                this.changeCoord(this.vertices[p[1].end.id], p[0])
            } else {
                this.changeCoord(this.vertices[p[1].start.id], p[0])
            }
        }
        this.redraw();

    }

    changeCoord(e, f) {
        e.xcoord = f.xcoord;
        e.ycoord = f.ycoord;
    }
}