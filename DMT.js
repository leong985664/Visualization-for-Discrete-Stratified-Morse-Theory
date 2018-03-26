class DMT {

    constructor(vertices, faces, edges) {
        this.vertices = vertices;
        this.faces = faces;
        this.edges = edges;
    }

    findViolator() {
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
        for (let e of this.violatorEdge) {
            d3.select('#e'+e.id)
                .attr('class', 'violatorEdge')
        }
        for (let v of this.violatorVertex) {
            d3.select('#v'+v.id)
                .attr('class', 'violatorVertex')
        }
        let violator = d3.select('#violator');
        let violatorList = violator.selectAll('li')
            .data(this.violatorVertex.concat(this.violatorEdge))
        violatorList.exit().remove();
        violatorList = violatorList.enter().append('li').merge(violatorList)
            .html(function (d) {
                return 'f<sup>-1</sup>('+d.value+')';
            })
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
}