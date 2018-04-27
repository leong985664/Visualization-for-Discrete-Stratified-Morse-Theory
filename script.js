let file;
let dmt;
let dmt2;

let input = document.getElementById('files');
input.onchange = function (event) {
    file = event.target.files[0];
    handleFileSelect(file);
    this.value = null;
}

function markViolators() {
    dmt.updateViolator();
    dmt2.updateViolator();
}

function markCriticals() {
    dmt.updateCritical();
    dmt2.updateCritical();
}

function markPairs() {
    dmt.updatePair();
    dmt2.updatePair();
}

function removeEFPairs() {
    dmt.efPairRemove();
    dmt2.efPairRemove();
}

function removeVEPairs() {
    dmt.vePairRemove();
    dmt2.vePairRemove();
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
        // vertices = read.getVertices();
        // faces = read.getFaces();
        // edges = read.getEdges();
        dmt = new DMT(read.getVertices(), read.getFaces(), read.getEdges());
        dmt.draw();

        let read2 = new Read();
        read2.readOFF(reader.result);
        // vertices = read.getVertices();
        // faces = read.getFaces();
        // edges = read.getEdges();
        dmt2 = new DMT2(read2.getVertices(), read2.getFaces(), read2.getEdges());
        dmt2.draw();
    }
}