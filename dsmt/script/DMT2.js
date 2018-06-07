class DMT2 {

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

        this.width = 500;
        this.height = 550;

        this.canvas = d3.select('#canvas2')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox","0 0 500 550");

        this.table = d3.select('#table2');

        this.xScale = d3.scaleLinear()
            .domain([this.xmin, this.xmax])
            .range([50,450])
        this.yScale = d3.scaleLinear()
            .domain([this.ymin, this.ymax])
            .range([450, 50])

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
        this.table.selectAll('li').remove();
        this.canvas.selectAll('g').remove();

        this.fgroup = this.canvas.append('g')
            .attr('id', 'fgroup')
        this.egroup = this.canvas.append('g')
            .attr('id', 'egroup')
        this.vegroup = this.canvas.append('g')
            .attr('id', 'vegroup')
        this.efgroup = this.canvas.append('g')
            .attr('id', 'efgroup')
        this.vgroup = this.canvas.append('g')
            .attr('id', 'vgroup')

        this.ftgroup = this.canvas.append('g')
            .attr('id', 'ftgroup')
        this.etgroup = this.canvas.append('g')
            .attr('id', 'etgroup');
        this.vtgroup = this.canvas.append('g')
            .attr('id', 'vtgroup');
    }

    draw() {
        this.clear();
        this.computeUL();
        this.findViolator();
        this.findCritical();
        this.findPair();
        this.drawFaces();
        this.drawEdges();
        this.drawVertices();
    }

    drawFaces() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        this.checkSpecialFaces();

        let fs = this.fgroup.selectAll('path')
            .data(this.faces);
        fs.exit().remove();
        fs = fs.enter().append('path').merge(fs)
            // .attr('points', function (d) {
            //     let result = '';
            //     for (let p of d.point) {
            //         result += xScale(p.xcoord) + ',' + yScale(p.ycoord) + ' '
            //     }
            //     return result;
            // })
            .attr('d', d => d.d)
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
            .attr('id', function (d) {
                return 'ft' + d.id;
            })
    }

    drawEdges() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        this.checkSpecialEdges();

        let es = this.egroup.selectAll('path')
            .data(this.edges)
        es.exit().remove();
        es = es.enter().append('path').merge(es)
            .attr('d', function (d) {
                return d.d;
            })
            .attr('class', 'edge')
            .attr('id', function (d) {
                return 'e' + d.id;
            })

        let ets = this.etgroup.selectAll('text')
            .data(this.edges);
        ets.exit().remove();
        ets = ets.enter().append('text').merge(ets)
            .attr('x', d => d.textcoord[0])
            .attr('y', d => d.textcoord[1])
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

    findViolatorVertex() {
        let violatorVertex = new Array();

        //Find vertex violators
        this.uVertex.forEach(function (value, key, map) {
            if (value != null && value.length > 1) {
                violatorVertex.push(key);
            }
        });

        //Remove violators from UL list
        this.removeUL(violatorVertex, this.uVertex, this.lEdge);

        this.violatorVertex = violatorVertex;
    }

    findViolatorEdge() {
        let violatorEdge = new Array();

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

        //Remove violators from UL list
        this.removeUL(violatorEdge, this.uEdge, this.lFace);
        this.removeUL(violatorEdge, this.lEdge, this.uVertex);

        this.violatorEdge = violatorEdge;
    }

    findViolatorFace() {
        let violatorFace = new Array();

        //Find face violators
        this.lFace.forEach(function (value, key, map) {
            if (value != null && value.length > 1) {
                violatorFace.push(key);
            }
        })

        //Remove violators from UL list
        this.removeUL(violatorFace, this.lFace, this.uEdge);

        this.violatorFace = violatorFace;
    }

    findViolator() {
        this.findViolatorVertex();
        this.findViolatorEdge();
        this.findViolatorFace();
    }

    removeUL(violator, map, map2) {
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
            if (value != null && value.length == 0) {
                criticalFace.push(key);
            }
        })

        this.criticalVertex = criticalVertex;
        this.criticalEdge = criticalEdge;
        this.criticalFace = criticalFace;
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

    updateViolator() {

        for (let e of this.violatorEdge) {
            this.canvas.select('#e'+e.id)
                .attr('class', 'violatorEdge')
        }
        for (let v of this.violatorVertex) {
            this.canvas.select('#v'+v.id)
                .attr('class', 'violatorVertex')
        }
        for (let f of this.violatorFace) {
            this.canvas.select('#f'+f.id)
                .attr('class', 'violatorFace')
        }

        let test = this.violatorVertex.concat(this.violatorEdge).concat(this.violatorFace);
        let violator = this.table.select('#violator2');
        let violatorList = violator.selectAll('li')
            .data(test)
        violatorList.exit().remove();
        violatorList = violatorList.enter().append('li').merge(violatorList)
            .html(function (d) {
                return 'f<sup>-1</sup>('+d.value+')';
            })
    }

    updateCritical() {

        for (let e of this.criticalEdge) {
            this.canvas.select('#e' + e.id)
                .attr('class', 'criticalEdge')
        }
        for (let v of this.criticalVertex) {
            this.canvas.select('#v' + v.id)
                .attr('class', 'criticalVertex')
        }
        for (let f of this.criticalFace) {
            this.canvas.select('#f' + f.id)
                .attr('class', 'criticalFace')
        }

        let test = this.criticalVertex.concat(this.criticalEdge).concat(this.criticalFace)
        let critical = this.table.select('#critical2');
        let criticalList = critical.selectAll('li')
            .data(test)
        criticalList.exit().remove();
        criticalList = criticalList.enter().append('li').merge(criticalList)
            .html(function (d) {
                return 'f<sup>-1</sup>(' + d.value + ')';
            })
    }

    updatePair() {

        this.drawArrow();

        let test = this.vePair.concat(this.efPair)
        let noncritical = this.table.select('#noncritical2');
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

        let ve = this.vegroup.selectAll('path')
            .data(this.vePair)
        ve.exit().remove();
        ve = ve.enter().append('path').merge(ve)
            .attr('id', function (d) {
                return 've'+d[0].id+'to'+d[1].id;
            })
            .attr('class', 'arrowBody')
            .attr('marker-end', 'url(#arrowhead)')
            .attr('d', function (d) {
                let startx = xScale(d[0].xcoord)
                let starty = yScale(d[0].ycoord)
                let endx = d[1].textcoord[0]
                let endy = d[1].textcoord[1]
                let path = d3.path();
                path.moveTo(startx, starty);
                path.lineTo(endx, endy);
                return path.toString()
            })

        let ef = this.efgroup.selectAll('line')
            .data(this.efPair)
        ef.exit().remove();
        ef = ef.enter().append('line').merge(ef)
            .attr('id', function (d) {
                return 'ef'+d[0].id+'to'+d[1].id;
            })
            .attr('class', 'arrowBody')
            .attr('marker-end', 'url(#arrowhead)')
            .attr('x1', function (d) {
                let start = d[0].start.xcoord;
                let end = d[0].end.xcoord;
                return xScale((start+end)/2);
            })
            .attr('y1', function (d) {
                let start = d[0].start.ycoord;
                let end = d[0].end.ycoord;
                return yScale((start+end)/2);
            })
            .attr('x2', function (d) {
                let sum = 0;
                for (let p of d[1].point) {
                    sum += p.xcoord;
                }
                return xScale(sum/d[1].point.length);
            })
            .attr('y2', function (d) {
                let sum = 0;
                for (let p of d[1].point) {
                    sum += p.ycoord;
                }
                return yScale(sum/d[1].point.length);
            })
    }

    removeSimplex(simplex, list) {
        for (let i = list.length - 1; i >= 0; i--) {
            if (list[i].id == simplex.id) {
                list.splice(i,1)
            }
        }
    }

    removeVertex(vertex) {
        this.removeSimplex(vertex, this.vertices)
        for (let f of this.faces) {
            this.removeSimplex(vertex, f.point)
        }
        for (let e of this.edges) {
            this.removeSimplex(vertex, [e.start, e.end])
        }
    }

    removeEdge(edge) {
        this.removeSimplex(edge, this.edges)
        for (let f of this.faces) {
            this.removeSimplex(edge, f.line)
        }
        for (let v of this.vertices) {
            this.removeSimplex(edge, v.arms)
        }
    }

    removeFace(face) {
        this.removeSimplex(face, this.faces)
        for (let e of this.edges) {
            this.removeSimplex(face, e.wings)
        }
        for (let v of this.vertices) {
            this.removeSimplex(face, v.wings)
        }
    }

    efPairRemove() {
        for (let p of this.efPair) {
            let e = p[0]
            let f = p[1]
            this.removeEdge(e)
            this.removeFace(f)
        }
        this.efPair = [];

        this.drawFaces();
        this.drawEdges();
        this.drawVertices();
        this.computeUL();
        this.updateViolator();
        this.updateCritical();
        this.updatePair();
    }

    vePairRemove() {

        let pole = this.violatorVertex.concat(this.criticalVertex);
        for (let v of pole) {
            let removes = this.test(v);
            this.updateFaces();
            this.updateEdges();
            this.updateVertices()
            this.computeUL();
            this.updateViolator();
            this.updateCritical();
            this.updatePair();

            let vertices2remove = removes[0]
            let edges2remove = removes[1]

            setTimeout(() => {
                this.test2(vertices2remove, edges2remove, v)
                this.drawFaces();
                this.drawEdges();
                this.drawVertices();
                this.computeUL();
                this.updateViolator();
                this.updateCritical();
                this.updatePair();
            }, 200)
        }
    }

    test(v) {
        let vertices2remove = [];
        let edges2remove = [];

        for (let e of v.arms) {
            //continue only if the edge is non-critical
            let isNoncritical = true;
            for (let violator of this.violatorEdge) {
                if (violator.id == e.id) {
                    isNoncritical = false;
                    break;
                }
            }
            for (let critical of this.criticalEdge) {
                if (critical.id == e.id) {
                    isNoncritical = false;
                    break;
                }
            }
            if (!isNoncritical)
                continue;

            //whether the vertex is the start point of the edge
            let isStart = true;
            if (e.end.id == v.id)
                isStart = false;

            //update the vertex on the other side of the edge
            if (isStart) {
                for (let vertex of this.vertices) {
                    if (vertex.id == e.end.id) {
                        vertices2remove.push(vertex)
                        edges2remove.push(e)
                        this.changeCoord(vertex, v)
                        continue;
                    }
                }
            } else {
                for (let vertex of this.vertices) {
                    if (vertex.id == e.start.id) {
                        vertices2remove.push(vertex)
                        edges2remove.push(e)
                        this.changeCoord(vertex, v)
                        continue;
                    }
                }
            }
        }
        return [vertices2remove, edges2remove]
    }

    test2(vertices2remove, edges2remove, v) {
        for (let edge of edges2remove) {
            //remove from canvas
            this.removeEdge(edge)
            //remove from vePair
            for (let i = this.vePair.length-1; i >= 0; i--) {
                let e = this.vePair[i][1]
                if (e.id == edge.id) {
                    this.vePair.splice(i,1)
                }
            }
        }
        let newwings = []
        let newarms = []

        for (let vertex of vertices2remove) {
            //reset wings' point
            for (let f of vertex.wings) {
                newwings.push(f)
                if (f.point[0].id == vertex.id) {
                    f.point[0] = v;
                } else if (f.point[1].id == vertex.id) {
                    f.point[1] = v;
                } else {
                    f.point[2] = v;
                }
            }
            //reset arms' point
            for (let e of vertex.arms) {
                newarms.push(e)
                if (e.start.id == vertex.id)
                    e.start = v;
                else
                    e.end = v;
            }
            this.removeVertex(vertex)
        }
        //reset wings and arms of critical vertex
        for (let vertex of this.vertices) {
            if (vertex.id == v.id) {
                vertex.arms = newarms;
                vertex.wings = newwings;
            }
        }
    }

    changeCoord(e, f) {
        e.xcoord = f.xcoord;
        e.ycoord = f.ycoord;
    }

    updateFaces() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        this.checkSpecialFaces();

        let fs = this.fgroup.selectAll('path')
            .data(this.faces);
        fs.exit().remove();
        fs = fs.enter().append('path').merge(fs)
            .transition()
            .duration(100)
            // .attr('points', function (d) {
            //     let result = '';
            //     for (let p of d.point) {
            //         result += xScale(p.xcoord) + ',' + yScale(p.ycoord) + ' '
            //     }
            //     return result;
            // })
            .attr('d', d => d.d)
            .attr('class', 'face')

        let fts = this.ftgroup.selectAll('text')
            .data(this.faces);
        fts.exit().remove();
        fts = fts.enter().append('text').merge(fts)
            .transition()
            .duration(100)
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
            .text(d => d.value)
    }

    updateEdges() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        this.checkSpecialEdges();

        let es = this.egroup.selectAll('path')
            .data(this.edges)
        es.exit().remove();
        es = es.enter().append('path').merge(es)
            .transition()
            .duration(100)
            .attr('d', function (d) {
                let path = d3.path();
                path.moveTo(xScale(d.start.xcoord), yScale(d.start.ycoord));
                path.lineTo(xScale(d.end.xcoord), yScale(d.end.ycoord));
                return path.toString()
                // return d.d;
            })
        // .attr('x1', d => xScale(d.start.xcoord))
        // .attr('y1', d => yScale(d.start.ycoord))
        // .attr('x2', d => xScale(d.end.xcoord))
        // .attr('y2', d => yScale(d.end.ycoord))

        let ets = this.etgroup.selectAll('text')
            .data(this.edges);
        ets.exit().remove();
        ets = ets.enter().append('text').merge(ets)
            .transition()
            .duration(100)
            .attr('x', d => d.textcoord[0])
            .attr('y', d => d.textcoord[1])
            // .attr('x', d => xScale((d.start.xcoord + d.end.xcoord) / 2))
            // .attr('y', d => yScale((d.start.ycoord + d.end.ycoord) / 2))
            .text(d => d.value)
    }

    updateVertices() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        let vs = this.vgroup.selectAll('circle')
            .data(this.vertices);
        vs.exit().remove();
        vs = vs.enter().append('circle').merge(vs)
            .transition()
            .duration(100)
            .attr('cx', d => xScale(d.xcoord))
            .attr('cy', d => yScale(d.ycoord))

        let vts = this.vtgroup.selectAll('text')
            .data(this.vertices);
        vts.exit().remove();
        vts = vts.enter().append('text').merge(vts)
            .transition()
            .duration(100)
            .attr('x', d => xScale(d.xcoord))
            .attr('y', d => yScale(d.ycoord))
            .text(d => d.value)
    }

    updateArrow() {
        let xScale = this.xScale;
        let yScale = this.yScale;

        let ve = this.vegroup.selectAll('path')
            .data(this.vePair)
        ve.exit().remove();
        ve = ve.enter().append('path').merge(ve)
            .transition()
            .duration(100)
            .attr('d', function (d) {
                let startx = xScale(d[0].xcoord)
                let starty = yScale(d[0].ycoord)
                let endx = d[1].textcoord[0]
                let endy = d[1].textcoord[1]
                let path = d3.path();
                path.moveTo(startx, starty);
                path.lineTo(endx, endy);
                return path.toString()
            })

        let ef = this.efgroup.selectAll('line')
            .data(this.efPair)
        ef.exit().remove();
        ef = ef.enter().append('line').merge(ef)
            .transition()
            .duration(100)
            .attr('x1', function (d) {
                let start = d[0].start.xcoord;
                let end = d[0].end.xcoord;
                return xScale((start+end)/2);
            })
            .attr('y1', function (d) {
                let start = d[0].start.ycoord;
                let end = d[0].end.ycoord;
                return yScale((start+end)/2);
            })
            .attr('x2', function (d) {
                let sum = 0;
                for (let p of d[1].point) {
                    sum += p.xcoord;
                }
                return xScale(sum/d[1].point.length);
            })
            .attr('y2', function (d) {
                let sum = 0;
                for (let p of d[1].point) {
                    sum += p.ycoord;
                }
                return yScale(sum/d[1].point.length);
            })
    }

    checkSpecialFaces() {

        for (let f of this.faces) {

            //check degeneration
            let distinct = new Set();
            for (let p of f.point) {
                distinct.add(p)
            }

            //dealing with degeneration to a point and a line
            if (distinct.size == 1) {
                let it = distinct.values();
                let p = it.next().value;
                let startx = this.xScale(p.xcoord)
                let starty = this.yScale(p.ycoord)
                let assistx = startx;
                let assisty = starty + 80;
                let pivotcx = (startx+assistx) / 2;
                let pivotcy = (starty+assisty) / 2;
                let pivotpx = startx - pivotcx;
                let pivotpy = starty - pivotcy;
                let x1 = -pivotpy + pivotcx;
                let y1 = pivotpx + pivotcy;
                let x2 = pivotpy + pivotcx;
                let y2 = -pivotpx + pivotcy;
                let r = Math.sqrt(Math.pow(x1-startx,2)+Math.pow(y1-starty,2));

                let path = d3.path();
                path.moveTo(startx, starty);
                path.arcTo(x1, y1, assistx, assisty, r);
                path.arcTo(x2, y2, startx, starty, r)

                f.d = path.toString();

                this.canvas.select('#ft' + f.id)
                    .attr('transform', 'translate(0,40)')
            } else if (distinct.size == 2) {
                //calculate coordinates
                let it = distinct.values();
                let p1 = it.next().value
                let p2 = it.next().value
                let startx = this.xScale(p1.xcoord);
                let starty = this.yScale(p1.ycoord);
                let endx = this.xScale(p2.xcoord);
                let endy = this.yScale(p2.ycoord);
                let cx = (startx + endx) / 2;
                let cy = (starty + endy) / 2;
                let px = startx - cx
                let py = starty - cy
                let x1 = -py + cx;
                let y1 = px + cy;
                let x2 = py + cx;
                let y2 = -px + cy;
                let r = Math.sqrt(Math.pow(x1 - startx, 2) + Math.pow(y1 - starty, 2));

                let path = d3.path();
                path.moveTo(startx, starty);
                path.arcTo(x1, y1, endx, endy, r);
                path.arcTo(x2, y2, startx, starty, r);
                f.d = path.toString();
            } else {
                let startx = this.xScale(f.point[0].xcoord)
                let starty = this.yScale(f.point[0].ycoord)
                let path = d3.path();
                path.moveTo(startx, starty);
                for (let i = 1; i < f.point.length; i++) {
                    let p = f.point[i];
                    path.lineTo(this.xScale(p.xcoord), this.yScale(p.ycoord))
                }
                f.d = path.toString();
            }
        }
    }

    checkSpecialEdges() {

        this.collinearEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            let e1 = this.edges[i];

            //calculate coordinates
            let startx = this.xScale(e1.start.xcoord);
            let starty = this.yScale(e1.start.ycoord);
            let endx = this.xScale(e1.end.xcoord);
            let endy = this.yScale(e1.end.ycoord);
            let cx = (startx + endx) / 2;
            let cy = (starty + endy) / 2;
            let px = startx - cx
            let py = starty - cy

            //check self-looping
            if (startx == endx && starty == endy) {

                //append path and textcoord for self-looping
                let assistx = startx;
                let assisty = starty + 80;
                let pivotcx = (startx+assistx) / 2;
                let pivotcy = (starty+assisty) / 2;
                let pivotpx = startx - pivotcx;
                let pivotpy = starty - pivotcy;
                let x1 = -pivotpy + pivotcx;
                let y1 = pivotpx + pivotcy;
                let x2 = pivotpy + pivotcx;
                let y2 = -pivotpx + pivotcy;
                let r = Math.sqrt(Math.pow(x1-startx,2)+Math.pow(y1-starty,2));

                let path = d3.path();
                path.moveTo(startx, starty);
                path.arcTo(x1, y1, assistx, assisty, r);
                path.arcTo(x2, y2, endx, endy, r)

                e1.d = path.toString();
                e1.textcoord = [assistx, assisty]
            } else {
                //append path and textcoord for straight line
                let path = d3.path();
                path.moveTo(startx, starty);
                path.lineTo(endx, endy);
                e1.d = path.toString();
                e1.textcoord = [cx,cy];
            }

            //check collinear
            let temp = [e1];
            for (let j = i + 1; j < this.edges.length; j++) {
                let e2 = this.edges[j]
                if (this.exist(e2, this.collinearEdges))
                    continue;
                if ((e1.start.id == e2.start.id && e1.end.id == e2.end.id) ||
                    (e1.start.id == e2.end.id && e1.end.id == e2.start.id)){
                    temp.push(e2);
                }
            }
            if (temp.length > 1) {
                this.collinearEdges.push(temp)
            }
        }

        for (let group of this.collinearEdges) {
            for (let i = 0; i < group.length; i++) {
                let m = group[i];
                let startx, starty, endx, endy = 0;
                if (m.start.id == group[0].start.id) {
                    startx = this.xScale(m.start.xcoord);
                    starty = this.yScale(m.start.ycoord);
                    endx = this.xScale(m.end.xcoord);
                    endy = this.yScale(m.end.ycoord);
                } else {
                    startx = this.xScale(m.end.xcoord);
                    starty = this.yScale(m.end.ycoord);
                    endx = this.xScale(m.start.xcoord);
                    endy = this.yScale(m.start.ycoord);
                }
                let cx = (startx + endx) / 2;
                let cy = (starty + endy) / 2;
                let px = startx - cx
                let py = starty - cy
                if (i == 0) {
                    let x = -py + cx;
                    let y = px + cy;
                    let r = Math.sqrt(Math.pow(x - startx, 2) + Math.pow(y - starty, 2));
                    let path = d3.path();
                    path.moveTo(startx, starty);
                    path.arcTo(x, y, endx, endy, r);
                    m.d = path.toString();
                    m.textcoord = [(x + cx) / 2, (y + cy) / 2];
                } else if (i == 1) {
                    let x = py + cx;
                    let y = -px + cy;
                    let r = Math.sqrt(Math.pow(x - startx, 2) + Math.pow(y - starty, 2));
                    let path = d3.path();
                    path.moveTo(startx, starty);
                    path.arcTo(x, y, endx, endy, r)
                    m.d = path.toString();
                    m.textcoord = [(x + cx) / 2, (y + cy) / 2];
                }
            }
        }
    }

    exist(element, list) {
        let exists = false;
        for (let l of list) {
            for (let e of l) {
                if (e.id == element.id)
                    exists = true;
            }
        }
        return exists;
    }
}