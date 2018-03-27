let numVertices = 0;
let numFaces = 0;
let numEdges = 0;
let vertices = new Array();
let faces = new Array();
let edges = new Array();
let file;
let dmt;

let input = document.getElementById('files');
input.onchange = function (event) {
    file = event.target.files[0];
    handleFileSelect(file);
    this.value = null;
}

function markViolators() {
    dmt.updateViolator();
}

function markCriticals() {
    dmt.updateCritical();
}

function markPairs() {
    dmt.updatePair();
}

function removePairs() {
    dmt.removePair();
}

function rollback() {
    dmt.clear();
    handleFileSelect(file);
}

function handleFileSelect(file)
{
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function (e) {
        let read = new Read();
        read.readOFF(reader.result);
        numVertices = read.getNumVertices();
        numFaces = read.getNumFaces();
        numEdges = read.getNumEdges();
        vertices = read.getVertices();
        faces = read.getFaces();
        edges = read.getEdges();

        dmt = new DMT(vertices, faces, edges);
        dmt.draw();
    }
}