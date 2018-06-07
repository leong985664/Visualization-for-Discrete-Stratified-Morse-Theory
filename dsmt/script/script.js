let file;
let off;
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
    initialzeDMT(off);
}

function exp5() {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function () {
        off = this.responseText;
        initialzeDMT()
    });
    oReq.open("GET", "data/dmt_sailboat.off");
    oReq.send();
}

function exp6() {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function () {
        off = this.responseText;
        initialzeDMT()
    });
    oReq.open("GET", "data/dmt_grid.off");
    oReq.send();
}

function exp1() {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function () {
        off = this.responseText;
        initialzeDMT()
    });
    oReq.open("GET", "data/dsmt_figure2.off");
    oReq.send();
}

function exp2() {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function () {
        off = this.responseText;
        initialzeDMT()
    });
    oReq.open("GET", "data/dsmt_figure3.off");
    oReq.send();
}

function exp3() {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function () {
        off = this.responseText;
        initialzeDMT()
    });
    oReq.open("GET", "data/dsmt_figure4.off");
    oReq.send();
}

function exp4() {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function () {
        off = this.responseText;
        initialzeDMT()
    });
    oReq.open("GET", "data/dsmt_figure6.off");
    oReq.send();
}

function handleFileSelect(file)
{
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function (e) {
        off = reader.result;
        initialzeDMT()
    }
}

function initialzeDMT() {
    console.log(off);

    let read = new Read();
    read.readOFF(off);
    dmt = new DMT(read.getVertices(), read.getFaces(), read.getEdges());
    dmt.draw();

    let read2 = new Read();
    read2.readOFF(off);
    dmt2 = new DMT2(read2.getVertices(), read2.getFaces(), read2.getEdges());
    dmt2.draw();
}