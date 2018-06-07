class Read {

    constructor() {
        this.numVertices = 0;
        this.numFaces = 0;
        this.numEdges = 0;
        this.vertices = new Array();
        this.faces = new Array();
        this.edges = new Array();
    }
    
    readOFF(off)
    {
        let lines = off.split('\n');
        let stats = lines[1].split(' ');

        this.numVertices = parseInt(stats[0]);
        this.numFaces = parseInt(stats[1]);
        this.numEdges = parseInt(stats[2]);

        for (let i = 2; i <= 1 + this.numVertices; i++) {
            let coord = lines[i].split(' ');
            let result = {
                id: i-2,
                arms: [],
                wings: [],
                xcoord: parseFloat(coord[0]),
                ycoord: parseFloat(coord[1]),
                value: parseInt(coord[2])
            };
            this.vertices.push(result);
        }

        for (let i = 2 + this.numVertices + this.numFaces; i <= 1 + this.numVertices + this.numFaces + this.numEdges; i++) {
            let coord = lines[i].split(' ');
            let result = {
                id: i-2-this.numVertices-this.numFaces,
                wings: [],
                // heads: [this.vertices[parseInt(coord[0])],this.vertices[parseInt(coord[1])]],
                start: this.vertices[parseInt(coord[0])],
                end: this.vertices[parseInt(coord[1])],
                value: parseInt(coord[2])
            }
            this.edges.push(result);
        }

        for (let i = 2 + this.numVertices; i <= 1 + this.numVertices + this.numFaces; i++) {
            let coord = lines[i].split(' ');
            let pntidx = [];
            let pnt = [];
            for (let idx of coord.slice(0,-1)) {
                pntidx.push(parseInt(idx));
                pnt.push(this.vertices[parseInt(idx)]);
            }
            let lnidx = [];
            let ln = [];
            for (let e of this.edges) {
                if (pntidx.includes(e.start.id) && pntidx.includes(e.end.id)) {
                    lnidx.push(e.id);
                    ln.push(e);
                }
            }
            let result = {
                id: i-2-this.numVertices,
                point: pnt,
                pointIndex: pntidx,
                line: ln,
                lineIndex: lnidx,
                value: parseInt(coord.slice(-1)[0])
            }
            this.faces.push(result);
        }

        for (let v of this.vertices) {
            for (let e of this.edges) {
                if (e.start.id == v.id || e.end.id == v.id) {
                    v.arms.push(e);
                }
            }
            for (let f of this.faces) {
                if (f.pointIndex.includes(v.id)) {
                    v.wings.push(f);
                }
            }
        }

        for (let e of this.edges) {
            for (let f of this.faces) {
                if (f.lineIndex.includes(e.id)) {
                    e.wings.push(f);
                }
            }
        }

    }

    getNumVertices() {
        return this.numVertices;
    }

    getNumFaces() {
        return this.numFaces;
    }

    getNumEdges() {
        return this.numEdges;
    }

    getVertices() {
        return this.vertices.slice(0);
    }

    getFaces() {
        return this.faces.slice(0);
    }

    getEdges() {
        return this.edges.slice(0);
    }
}