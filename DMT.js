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
            .range([50, 350])
        this.yScale = d3.scaleLinear()
            .domain([this.ymin, this.ymax])
            .range([50, 350])

        //define arrow head
        this.canvas.append('svg:defs').append('svg:marker')
            .attr('id', 'arrowhead')
            .attr('refX', 3)
            .attr('refY', 3)
            .attr('markerWidth', 15)
            .attr('markerHeight', 15)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 0 6 3 0 6 1.5 3')
            .attr('class', 'arrowHead')
    }

    clear() {
        d3.selectAll('li').remove();
        this.canvas.selectAll('g').remove();

        this.fgroup = this.canvas.append('g')
            .attr('id', 'fgroup');
        this.egroup = this.canvas.append('g')
            .attr('id', 'egroup');
        this.vegroup = this.canvas.append('g')
            .attr('id', 'vegroup');
        this.vgroup = this.canvas.append('g')
            .attr('id', 'vgroup');

        this.ftgroup = this.canvas.append('g')
            .attr('id', 'ftgroup');
        this.etgroup = this.canvas.append('g')
            .attr('id', 'etgroup');
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
                    result += xScale(p.xcoord) + ',' + yScale(p.ycoord) + ' '
                }
                return result;
            })
            .attr('class', 'face')
            .attr('id', function (d) {
                return 'f' + d.id;
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
                return xScale(sum / d.point.length);
            })
            .attr('y', function (d) {
                let sum = 0;
                for (let p of d.point) {
                    sum += p.ycoord;
                }
                return yScale(sum / d.point.length);
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
                return 'e' + d.id;
            })

        let ets = this.etgroup.selectAll('text')
            .data(this.edges);
        ets.exit().remove();
        ets = ets.enter().append('text').merge(ets)
            .attr('x', d => xScale((d.start.xcoord + d.end.xcoord) / 2))
            .attr('y', d => yScale((d.start.ycoord + d.end.ycoord) / 2))
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
                return 'v' + d.id;
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
        this.uVertex = new Map();
        for (let v of this.vertices) {
            let uv = [];
            for (let arm of v.arms) {
                if (arm.value <= v.value)
                    uv.push(arm);
            }
            this.uVertex.set(v, uv);
        }
        this.lFace = new Map();
        for (let f of this.faces) {
            let lf = [];
            for (let l of f.line) {
                if (l.value >= f.value)
                    lf.push(l);
            }
            this.lFace.set(f, lf);
        }
        this.uEdge = new Map();
        this.lEdge = new Map();
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
            this.uEdge.set(e, ue);
            this.lEdge.set(e, le);
        }
    }

    findViolator() {
        let violatorVertex = new Array();
        let violatorEdge = new Array();
        let violatorFace = new Array();

        //Find vertex violators
        this.uVertex.forEach(function (value, key, map) {
            if (value != null && value.length > 1) {
                violatorVertex.push(key);
            }
        });

        //Find edge violators
        this.uEdge.forEach(function (value, key, map) {
            if (value != null && value.length > 1) {
                violatorEdge.push(key);
            }
        })
        this.lEdge.forEach(function (value, key, map) {
            if (value != null && value.length > 1) {
                violatorEdge.push(key);
            }
        })

        //Find face violators
        this.lFace.forEach(function (value, key, map) {
            if (value != null && value.length > 1) {
                violatorFace.push(key);
            }
        })

        //Remove violators from UL list
        this.removeViolator(violatorVertex, this.uVertex, this.lEdge);
        this.removeViolator(violatorEdge, this.uEdge, this.lFace);
        this.removeViolator(violatorEdge, this.lEdge, this.uVertex);
        this.removeViolator(violatorFace, this.lFace, this.uEdge);

        this.violatorVertex = violatorVertex;
        this.violatorEdge = violatorEdge;
        this.violatorFace = violatorFace;
    }

    removeViolator(violator, map, map2) {
        for (let v of violator) {
            for (let key of map.keys()) {
                if (key.id == v.id) {
                    map.set(key, null);
                }
            }
            for (let value of map2.values()) {
                if (value == null) {
                    continue;
                }
                for (let i = value.length-1; i >= 0; i--) {
                    if (value[i].id == v.id) {
                        value.splice(i,1);
                    }
                }
            }
        }
    }

    updateViolator() {
        this.findViolator();
        for (let e of this.violatorEdge) {
            d3.select('#e'+e.id)
                .attr('class', 'violatorEdge')
        }
        for (let v of this.violatorVertex) {
            d3.select('#v'+v.id)
                .attr('class', 'violatorVertex')
        }
        for (let f of this.violatorFace) {
            d3.select('#f'+f.id)
                .attr('class', 'violatorFace')
        }

        let test = this.violatorVertex.concat(this.violatorEdge).concat(this.violatorFace);
        let violator = d3.select('#violator');
        let violatorList = violator.selectAll('li')
            .data(test)
        violatorList.exit().remove();
        violatorList = violatorList.enter().append('li').merge(violatorList)
            .html(function (d) {
                return 'f<sup>-1</sup>('+d.value+')';
            })
    }

    findCritical() {
        let criticalVertex = new Array();
        let criticalEdge = new Array();
        let criticalFace = new Array();

        //Find critical vertices
        this.uVertex.forEach(function (value, key, map) {
            if (value != null && value.length == 0) {
                criticalVertex.push(key);
            }
        });

        //Find critical edges
        for (let key of this.uEdge.keys()) {
            let u = this.uEdge.get(key);
            let l = this.lEdge.get(key);
            if (u != null && l != null && u.length == 0 && l.length == 0) {
                criticalEdge.push(key);
            }
        }

        //Find critical faces
        this.lFace.forEach(function (value, key, map) {
            if (value != null && value.length > 1) {
                criticalFace.push(key);
            }
        })

        this.criticalVertex = criticalVertex;
        this.criticalEdge = criticalEdge;
        this.criticalFace = criticalFace;
    }

    updateCritical() {
        this.findCritical();
        for (let e of this.criticalEdge) {
            d3.select('#e' + e.id)
                .attr('class', 'criticalEdge')
        }
        for (let v of this.criticalVertex) {
            d3.select('#v' + v.id)
                .attr('class', 'criticalVertex')
        }
        for (let f of this.criticalFace) {
            d3.select('#f' + f.id)
                .attr('class', 'criticalFace')
        }

        let test = this.criticalVertex.concat(this.criticalEdge).concat(this.criticalFace)
        let critical = d3.select('#critical');
        let criticalList = critical.selectAll('li')
            .data(test)
        criticalList.exit().remove();
        criticalList = criticalList.enter().append('li').merge(criticalList)
            .html(function (d) {
                return 'f<sup>-1</sup>(' + d.value + ')';
            })
    }

    findPair() {
        let vePair = new Array();
        let efPair = new Array();
        this.uVertex.forEach(function (value, key, map) {
            if (value != null && value.length == 1) {
                vePair.push([key, value[0]]);
            }
        })
        this.uEdge.forEach(function (value, key, map) {
            if (value != null && value.length == 1) {
                efPair.push([key, value[0]]);
            }
        })

        this.vePair = vePair;
        this.efPair = efPair;
    }

    updatePair() {
        this.findPair();
        this.drawArrow();

        let test = this.vePair.concat(this.efPair)
        let noncritical = d3.select('#noncritical');
        let noncriticalList = noncritical.selectAll('li')
            .data(test)
        noncriticalList.exit().remove();
        noncriticalList = noncriticalList.enter().append('li').merge(noncriticalList)
            .html(function (d) {
                return 'f<sup>-1</sup>(' + d[0].value + ') => f<sup>-1</sup>(' + d[1].value + ')';
            })
    }

    drawArrow() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        let ve = this.vegroup.selectAll('line')
            .data(this.vePair)
        ve.exit().remove();
        ve = ve.enter().append('line').merge(ve)
            .attr('id', function (d) {
                return 'arrow'+d[0].id+'to'+d[1].id;
            })
            .attr('x1', d => xScale(d[0].xcoord))
            .attr('y1', d => yScale(d[0].ycoord))
            .attr('x2', d => xScale(d[0].xcoord))
            .attr('y2', d => yScale(d[0].ycoord))
            .attr('class', 'arrowBody')
            .attr('marker-end', 'url(#arrowhead)')
            .transition()
            .duration(1000)
            .attr('x1', d => xScale(d[0].xcoord))
            .attr('y1', d => yScale(d[0].ycoord))
            .attr('x2', function (d) {
                let start = d[1].start.xcoord;
                let end = d[1].end.xcoord;
                return xScale((start+end)/2);
            })
            .attr('y2', function (d) {
                let start = d[1].start.ycoord;
                let end = d[1].end.ycoord;
                return yScale((start+end)/2);
            })
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
            .attr('x', d => xScale((d.start.xcoord + d.end.xcoord) / 2))
            .attr('y', d => yScale((d.start.ycoord + d.end.ycoord) / 2))
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

}