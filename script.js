let numVertices = 0;
let numFaces = 0;
let numEdges = 0;
let vertices = new Array();
let faces = new Array();
let edges = new Array();

document.getElementById('files').addEventListener('change', handleFileSelect);

let dmt = new DMT(vertices, faces, edges);
dmt.updateCritical();
dmt.updatePair();
dmt.updateViolator();



function handleFileSelect(evt)
{
    let file = evt.target.files[0]; // FileList object
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

        let draw = new Draw(vertices, faces, edges);
        draw.draw();
    }
}