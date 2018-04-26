let numVertices = 0;
let numFaces = 0;
let numEdges = 0;
let vertices = new Array();
let faces = new Array();
let edges = new Array();
let file;
let dmt;
// let dmt2;

let input = document.getElementById('files');
input.onchange = function (event) {
    file = event.target.files[0];
    handleFileSelect(file);
    this.value = null;
}

function markViolators() {
    dmt.updateViolator();
    // dmt2.updateViolator();
}

function markCriticals() {
    dmt.updateCritical();
    // dmt2.updateCritical();
}

function markPairs() {
    dmt.updatePair();
    // dmt2.updatePair();
}

function removeEFPairs() {
    dmt.efPairRemove();
    // dmt2.efPairRemove();
}

function removeVEPairs() {
    dmt.vePairRemove();
    // dmt2.vePairRemove();
}

function rollback() {
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

        // dmt2 = new DMT2(vertices, faces, edges);
        // dmt2.draw();
    }
}