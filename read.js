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
        console.log(off);

        let lines = off.split('\n');
        let stats = lines[1].split(' ');

        this.numVertices = parseInt(stats[0]);
        this.numFaces = parseInt(stats[1]);
        this.numEdges = parseInt(stats[2]);

        for (let i = 2; i <= 1 + this.numVertices; i++) {
            let coord = lines[i].split(' ');
            let result = {
                id: i-2,
                armsid: [],
                arms: [],
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
                startid: parseInt(coord[0]),
                endid: parseInt(coord[1]),
                start: this.vertices[parseInt(coord[0])],
                end: this.vertices[parseInt(coord[1])],
                value: parseInt(coord[2])
            }
            this.edges.push(result);
        }

        for (let v of this.vertices) {
            for (let e of this.edges) {
                if (e.startid == v.id || e.endid == v.id) {
                    v.armsid.push(e.id);
                    v.arms.push(e);
                }
            }
        }

        // change for 3d
        // for (let i = 2 + this.numVertices; i <= 1 + this.numVertices + this.numFaces; i++) {
        //     let coord = lines[i].split(' ');
        //     for (let j = 0; j <= coord.length-1; j++) {
        //         console.log(coord[j]);
        //     }
        //     faces.push(coord);
        // }
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
        return this.vertices;
    }

    getFaces() {
        return this.faces;
    }

    getEdges() {
        return this.edges;
    }
}